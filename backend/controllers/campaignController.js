/**
 * NGOCampaign Controller
 * Enables verified/registered NGOs to publish donation drives, list required food & supplies,
 * receive pledges from donors, and award points when pledges are delivered.
 */
const NGOCampaign = require('../models/NGOCampaign');
const VolunteerApplication = require('../models/VolunteerApplication');
const Notification = require('../models/Notification');
const { awardPointsIfEligible } = require('../utils/rewardHelper');
const { sanitizeCampaignForViewer } = require('../utils/privacyHelper');

// @desc    Get all NGO campaigns with optional search & city filters
// @route   GET /api/campaigns
// @access  Public (Optional Auth)
const getCampaigns = async (req, res, next) => {
  try {
    const { search, city, status } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (city && city !== 'All') {
      query.city = { $regex: city, $options: 'i' };
    }
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { summary: regex },
        { beneficiaryGroup: regex },
        { dropoffArea: regex },
      ];
    }

    const campaigns = await NGOCampaign.find(query)
      .populate('ngo', 'name role city neighborhood phone email ngoDetails')
      .sort({ createdAt: -1 });

    const sanitized = campaigns.map((c) => {
      const isPledger =
        req.user &&
        c.pledges &&
        c.pledges.some((p) => String(p.donor) === String(req.user._id));
      return sanitizeCampaignForViewer(c, req.user, isPledger);
    });

    res.json({
      success: true,
      count: sanitized.length,
      campaigns: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single NGO campaign details
// @route   GET /api/campaigns/:id
// @access  Public (Optional Auth)
const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await NGOCampaign.findById(req.params.id)
      .populate('ngo', 'name role city neighborhood phone email ngoDetails bio')
      .populate('pledges.donor', 'name role city');

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'NGO campaign not found.' });
    }

    let isParticipant = false;
    if (req.user) {
      const hasPledge = campaign.pledges.some(
        (p) => String(p.donor._id || p.donor) === String(req.user._id)
      );
      const hasVolApp = await VolunteerApplication.findOne({
        campaign: campaign._id,
        volunteer: req.user._id,
        status: { $in: ['Accepted', 'Completed'] },
      });
      isParticipant = Boolean(hasPledge || hasVolApp);
    }

    res.json({
      success: true,
      campaign: sanitizeCampaignForViewer(campaign, req.user, isParticipant),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new NGO campaign
// @route   POST /api/campaigns
// @access  Private (NGO or Admin)
const createCampaign = async (req, res, next) => {
  try {
    const {
      title,
      summary,
      description,
      bannerUrl,
      beneficiaryGroup,
      beneficiaryCount,
      targetMeals,
      requiredItems,
      volunteersNeeded,
      volunteerRoles,
      city,
      dropoffArea,
      exactDropoffAddress,
      publicContactConsent,
      startDate,
      endDate,
      scheduleWindow,
    } = req.body;

    const uploadedBanner = req.file ? `/uploads/${req.file.filename}` : bannerUrl || '';

    const parsedItems =
      typeof requiredItems === 'string' ? JSON.parse(requiredItems) : requiredItems || [];

    const campaign = await NGOCampaign.create({
      ngo: req.user._id,
      title,
      summary,
      description,
      bannerUrl: uploadedBanner,
      beneficiaryGroup,
      beneficiaryCount: Number(beneficiaryCount) || 100,
      targetMeals: Number(targetMeals) || 200,
      requiredItems: parsedItems,
      volunteersNeeded: Number(volunteersNeeded) || 10,
      volunteerRoles:
        volunteerRoles && volunteerRoles.length
          ? volunteerRoles
          : ['Food Pickup & Transport', 'Meal Sorting & Packing', 'Community Distribution'],
      city: city || req.user.city,
      dropoffArea: dropoffArea || req.user.neighborhood,
      exactDropoffAddress,
      publicContactConsent: Boolean(publicContactConsent),
      startDate,
      endDate,
      scheduleWindow,
    });

    const populated = await NGOCampaign.findById(campaign._id).populate(
      'ngo',
      'name role city neighborhood phone email ngoDetails'
    );

    res.status(201).json({
      success: true,
      message: 'NGO Donation Drive published successfully!',
      campaign: sanitizeCampaignForViewer(populated, req.user, true),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Support an NGO campaign by pledging food/supplies
// @route   POST /api/campaigns/:id/pledge
// @access  Private
const pledgeToCampaign = async (req, res, next) => {
  try {
    const { itemName, quantityPledged, unit, deliveryNote } = req.body;
    const campaign = await NGOCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    if (campaign.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This campaign is not currently accepting new pledges.',
      });
    }

    const qty = Number(quantityPledged) || 5;

    campaign.pledges.push({
      donor: req.user._id,
      itemName: itemName || 'Cooked Meals / Rations',
      quantityPledged: qty,
      unit: unit || 'servings',
      deliveryNote: deliveryNote || 'Will drop off during scheduled window.',
      status: 'Delivered', // Verified support
      verifiedAt: new Date(),
    });

    campaign.mealsCollected += qty;

    // Update matching requiredItem if found
    const matchingItem = campaign.requiredItems.find(
      (i) => i.itemName.toLowerCase() === String(itemName).toLowerCase()
    );
    if (matchingItem) {
      matchingItem.quantityFulfilled += qty;
    }

    await campaign.save();

    // Award +35 points for supporting an NGO campaign (strictly once per user per campaign)
    const rewardResult = await awardPointsIfEligible({
      userId: req.user._id,
      actionType: 'CAMPAIGN_SUPPORTED',
      points: 35,
      referenceModel: 'NGOCampaign',
      referenceId: campaign._id,
      description: `Supported NGO Campaign: "${campaign.title}" with ${qty} ${unit || 'servings'}`,
      statUpdates: {
        campaignsSupported: 1,
        mealsSharedEstimate: qty,
      },
    });

    await Notification.create({
      recipient: campaign.ngo,
      sender: req.user._id,
      type: 'CAMPAIGN_PLEDGE',
      title: 'New Campaign Contribution!',
      message: `${req.user.name} pledged ${qty} ${unit || 'servings'} of ${itemName} to "${campaign.title}".`,
      link: `/campaigns/${campaign._id}`,
    });

    const updated = await NGOCampaign.findById(campaign._id)
      .populate('ngo', 'name role city neighborhood phone email ngoDetails')
      .populate('pledges.donor', 'name role city');

    res.status(201).json({
      success: true,
      message: rewardResult.awarded
        ? 'Thank you for supporting this NGO drive! +35 Impact Points awarded and drop-off address unlocked.'
        : 'Contribution recorded! Drop-off address is unlocked.',
      campaign: sanitizeCampaignForViewer(updated, req.user, true),
      pointsAwarded: rewardResult.awarded ? 35 : 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  pledgeToCampaign,
};
