/**
 * FoodPost Controller
 * Handles browsing, filtering, viewing, creating, editing, and deleting food listings.
 * Enforces food safety checks and privacy masking for phone numbers and exact addresses.
 */
const FoodPost = require('../models/FoodPost');
const DonationRequest = require('../models/DonationRequest');
const { awardPointsIfEligible } = require('../utils/rewardHelper');
const { sanitizeFoodPostForViewer } = require('../utils/privacyHelper');

// @desc    Get all food posts with search and filters (category, dietary, status, city)
// @route   GET /api/food
// @access  Public (Optional Auth)
const getFoodPosts = async (req, res, next) => {
  try {
    const { search, category, dietaryType, status, city } = req.query;
    const query = {};

    // Hide Flagged posts from public browse unless admin
    if (!req.user || req.user.role !== 'admin') {
      query.status = { $ne: 'Flagged' };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (dietaryType && dietaryType !== 'All') {
      query.dietaryType = dietaryType;
    }

    if (city && city !== 'All') {
      query.pickupCity = { $regex: city, $options: 'i' };
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { pickupArea: regex },
        { pickupCity: regex },
      ];
    }

    const posts = await FoodPost.find(query)
      .populate('donor', 'name role city neighborhood phone email ngoDetails points levelTitle')
      .sort({ createdAt: -1 });

    // Check which posts the current logged-in viewer has an accepted request for
    let acceptedPostIds = new Set();
    if (req.user) {
      const acceptedReqs = await DonationRequest.find({
        requester: req.user._id,
        status: { $in: ['Accepted', 'Completed'] },
      }).select('foodPost');
      acceptedPostIds = new Set(acceptedReqs.map((r) => String(r.foodPost)));
    }

    const sanitizedPosts = posts.map((post) =>
      sanitizeFoodPostForViewer(post, req.user, acceptedPostIds.has(String(post._id)))
    );

    res.json({
      success: true,
      count: sanitizedPosts.length,
      foodPosts: sanitizedPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food post details
// @route   GET /api/food/:id
// @access  Public (Optional Auth)
const getFoodPostById = async (req, res, next) => {
  try {
    const post = await FoodPost.findById(req.params.id).populate(
      'donor',
      'name role city neighborhood phone email ngoDetails points levelTitle badges'
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found.',
      });
    }

    let hasAcceptedRequest = false;
    let viewerRequest = null;

    if (req.user) {
      viewerRequest = await DonationRequest.findOne({
        foodPost: post._id,
        requester: req.user._id,
      });
      if (viewerRequest && ['Accepted', 'Completed'].includes(viewerRequest.status)) {
        hasAcceptedRequest = true;
      }
    }

    const sanitized = sanitizeFoodPostForViewer(post, req.user, hasAcceptedRequest);

    // If the viewer is the donor or admin, include incoming requests for this post
    let incomingRequests = [];
    if (
      req.user &&
      (String(post.donor._id) === String(req.user._id) || req.user.role === 'admin')
    ) {
      incomingRequests = await DonationRequest.find({ foodPost: post._id })
        .populate('requester', 'name role city neighborhood phone email ngoDetails points')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      foodPost: sanitized,
      viewerRequest,
      incomingRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new food post
// @route   POST /api/food
// @access  Private (Individual, NGO, Admin)
const createFoodPost = async (req, res, next) => {
  try {
    const {
      title,
      description,
      photoUrl,
      category,
      dietaryType,
      quantity,
      servingsEstimate,
      preparedAt,
      expiresAt,
      storageCondition,
      allergens,
      pickupCity,
      pickupArea,
      exactPickupAddress,
      pickupInstructions,
      contactPreference,
      donorPhoneConsent,
      safetyDeclarationAccepted,
    } = req.body;

    // Validate food safety timestamps: expiry must be in the future and after preparation
    const prepDate = new Date(preparedAt);
    const expDate = new Date(expiresAt);
    const now = new Date();

    if (isNaN(prepDate.getTime()) || isNaN(expDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid preparation and safe-consumption expiry timestamps.',
      });
    }

    if (expDate <= now) {
      return res.status(400).json({
        success: false,
        message:
          'Food Safety Alert: Expired food cannot be listed on FeedNeed. Expiry deadline must be in the future.',
      });
    }

    if (expDate <= prepDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry deadline must be later than the preparation time.',
      });
    }

    if (safetyDeclarationAccepted !== true && safetyDeclarationAccepted !== 'true') {
      return res.status(400).json({
        success: false,
        message:
          'You must confirm the food safety checklist (freshly prepared/stored safely and not expired).',
      });
    }

    const uploadedPhoto = req.file ? `/uploads/${req.file.filename}` : photoUrl || '';

    const foodPost = await FoodPost.create({
      donor: req.user._id,
      title,
      description,
      photoUrl: uploadedPhoto,
      category,
      dietaryType,
      quantity,
      servingsEstimate: Number(servingsEstimate) || 2,
      preparedAt: prepDate,
      expiresAt: expDate,
      storageCondition: storageCondition || 'Refrigerated',
      allergens: allergens || 'None specified',
      pickupCity: pickupCity || req.user.city,
      pickupArea: pickupArea || req.user.neighborhood,
      exactPickupAddress,
      pickupInstructions: pickupInstructions || 'Please bring reusable containers.',
      contactPreference: contactPreference || 'approval_only',
      donorPhoneConsent: Boolean(donorPhoneConsent),
      safetyDeclarationAccepted: true,
    });

    // Award +15 points for creating a valid food post (idempotent per post ID)
    const rewardResult = await awardPointsIfEligible({
      userId: req.user._id,
      actionType: 'FOOD_POST_CREATED',
      points: 15,
      referenceModel: 'FoodPost',
      referenceId: foodPost._id,
      description: `Listed surplus food: "${foodPost.title}"`,
      statUpdates: { postsCreated: 1 },
    });

    const populated = await FoodPost.findById(foodPost._id).populate(
      'donor',
      'name role city neighborhood phone email ngoDetails points levelTitle'
    );

    res.status(201).json({
      success: true,
      message: 'Food post published! +15 Impact Points awarded.',
      foodPost: sanitizeFoodPostForViewer(populated, req.user, true),
      rewardEarned: rewardResult.awarded ? 15 : 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a food post (Owner or Admin only)
// @route   PUT /api/food/:id
// @access  Private
const updateFoodPost = async (req, res, next) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Food post not found.' });
    }

    if (String(post.donor) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own food listings.',
      });
    }

    const updatableFields = [
      'title',
      'description',
      'photoUrl',
      'category',
      'dietaryType',
      'quantity',
      'servingsEstimate',
      'preparedAt',
      'expiresAt',
      'storageCondition',
      'allergens',
      'pickupCity',
      'pickupArea',
      'exactPickupAddress',
      'pickupInstructions',
      'contactPreference',
      'donorPhoneConsent',
      'status',
    ];

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    }

    if (req.file) {
      post.photoUrl = `/uploads/${req.file.filename}`;
    }

    await post.save();
    const updated = await FoodPost.findById(post._id).populate(
      'donor',
      'name role city neighborhood phone email ngoDetails points levelTitle'
    );

    res.json({
      success: true,
      message: 'Food post updated successfully.',
      foodPost: sanitizeFoodPostForViewer(updated, req.user, true),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a food post (Owner or Admin only)
// @route   DELETE /api/food/:id
// @access  Private
const deleteFoodPost = async (req, res, next) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Food post not found.' });
    }

    if (String(post.donor) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this food post.',
      });
    }

    await DonationRequest.deleteMany({ foodPost: post._id });
    await post.deleteOne();

    res.json({
      success: true,
      message: 'Food post and associated pending requests removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoodPosts,
  getFoodPostById,
  createFoodPost,
  updateFoodPost,
  deleteFoodPost,
};
