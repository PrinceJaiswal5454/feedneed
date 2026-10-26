/**
 * DonationRequest Controller
 * Manages requesting food, donor approval/decline (which unlocks protected contact info),
 * and marking donations as completed (which awards non-duplicate points).
 */
const DonationRequest = require('../models/DonationRequest');
const FoodPost = require('../models/FoodPost');
const Notification = require('../models/Notification');
const { awardPointsIfEligible } = require('../utils/rewardHelper');

// @desc    Create a pickup request for an available food post
// @route   POST /api/requests
// @access  Private
const createDonationRequest = async (req, res, next) => {
  try {
    const { foodPostId, requestedServings, message, proposedPickupTime } = req.body;

    const foodPost = await FoodPost.findById(foodPostId);
    if (!foodPost) {
      return res.status(404).json({ success: false, message: 'Food listing not found.' });
    }

    if (String(foodPost.donor) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own food listing.',
      });
    }

    if (['Completed', 'Expired', 'Flagged'].includes(foodPost.status)) {
      return res.status(400).json({
        success: false,
        message: `This food listing is currently ${foodPost.status} and cannot be requested.`,
      });
    }

    // Prevent duplicate request from the same user for the same post
    const existingReq = await DonationRequest.findOne({
      foodPost: foodPostId,
      requester: req.user._id,
      status: { $in: ['Pending', 'Accepted'] },
    });

    if (existingReq) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active pickup request for this food listing.',
      });
    }

    const donationRequest = await DonationRequest.create({
      foodPost: foodPost._id,
      donor: foodPost.donor,
      requester: req.user._id,
      requestedServings: Number(requestedServings) || foodPost.servingsEstimate,
      message,
      proposedPickupTime,
    });

    if (foodPost.status === 'Available') {
      foodPost.status = 'Requested';
      await foodPost.save();
    }

    // Notify the donor
    await Notification.create({
      recipient: foodPost.donor,
      sender: req.user._id,
      type: 'DONATION_REQUEST',
      title: 'New Food Pickup Request',
      message: `${req.user.name} requested "${foodPost.title}" (Proposed pickup: ${proposedPickupTime}).`,
      link: `/food/${foodPost._id}`,
    });

    const populated = await DonationRequest.findById(donationRequest._id)
      .populate('requester', 'name role city neighborhood')
      .populate('foodPost', 'title pickupArea pickupCity status');

    res.status(201).json({
      success: true,
      message: 'Pickup request sent! The donor has been notified.',
      donationRequest: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incoming requests for posts owned by the logged-in donor, plus outgoing requests
// @route   GET /api/requests/my
// @access  Private
const getMyRequests = async (req, res, next) => {
  try {
    const incoming = await DonationRequest.find({ donor: req.user._id })
      .populate('foodPost', 'title category quantity servingsEstimate status pickupArea pickupCity')
      .populate('requester', 'name role city neighborhood phone email ngoDetails points')
      .sort({ createdAt: -1 });

    const outgoing = await DonationRequest.find({ requester: req.user._id })
      .populate(
        'foodPost',
        'title category quantity servingsEstimate status pickupArea pickupCity exactPickupAddress pickupInstructions'
      )
      .populate('donor', 'name role city neighborhood phone email')
      .sort({ createdAt: -1 });

    // Mask protected donor details on outgoing requests unless status is Accepted or Completed
    const safeOutgoing = outgoing.map((reqDoc) => {
      const obj = reqDoc.toObject();
      const unlocked = ['Accepted', 'Completed'].includes(obj.status);
      if (!unlocked) {
        if (obj.foodPost) {
          obj.foodPost.exactPickupAddress =
            '🔒 Hidden until the donor accepts your pickup request';
        }
        if (obj.donor) {
          obj.donor.phone = '🔒 Protected';
          obj.donor.email = '🔒 Protected';
        }
      }
      return obj;
    });

    res.json({
      success: true,
      incomingRequests: incoming,
      outgoingRequests: safeOutgoing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor accepts or declines a pickup request (Accepting unlocks protected contact details)
// @route   PUT /api/requests/:id/status
// @access  Private (Donor or Admin)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Accepted' | 'Declined' | 'Cancelled'
    const donationRequest = await DonationRequest.findById(req.params.id)
      .populate('foodPost')
      .populate('requester', 'name');

    if (!donationRequest) {
      return res.status(404).json({ success: false, message: 'Donation request not found.' });
    }

    const isDonor = String(donationRequest.donor) === String(req.user._id);
    const isRequester = String(donationRequest.requester._id) === String(req.user._id);

    if (status === 'Cancelled' && !isRequester && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel their request.',
      });
    }

    if (['Accepted', 'Declined'].includes(status) && !isDonor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the food donor can accept or decline this request.',
      });
    }

    donationRequest.status = status;

    if (status === 'Accepted') {
      donationRequest.donorConsentToShareContact = true;
      await FoodPost.findByIdAndUpdate(donationRequest.foodPost._id, {
        status: 'Reserved',
        acceptedRequestId: donationRequest._id,
      });

      await Notification.create({
        recipient: donationRequest.requester._id,
        sender: req.user._id,
        type: 'REQUEST_ACCEPTED',
        title: 'Pickup Request Accepted! 🎉',
        message: `Your request for "${donationRequest.foodPost.title}" was accepted! Exact pickup address and donor contact details are now unlocked.`,
        link: `/food/${donationRequest.foodPost._id}`,
      });
    } else if (status === 'Declined') {
      await Notification.create({
        recipient: donationRequest.requester._id,
        sender: req.user._id,
        type: 'REQUEST_DECLINED',
        title: 'Update on Your Food Request',
        message: `Your request for "${donationRequest.foodPost.title}" could not be accommodated this time.`,
        link: `/explore`,
      });
    }

    await donationRequest.save();

    res.json({
      success: true,
      message:
        status === 'Accepted'
          ? 'Request accepted! Protected pickup address and contact details have been shared with the requester.'
          : `Request marked as ${status}.`,
      donationRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a donation as completed (Awards +40 points to donor, prevents duplicates)
// @route   PUT /api/requests/:id/complete
// @access  Private (Donor, accepted Requester, or Admin)
const completeDonation = async (req, res, next) => {
  try {
    const { completionNote } = req.body;
    const donationRequest = await DonationRequest.findById(req.params.id).populate('foodPost');

    if (!donationRequest) {
      return res.status(404).json({ success: false, message: 'Donation request not found.' });
    }

    const isDonor = String(donationRequest.donor) === String(req.user._id);
    const isRequester = String(donationRequest.requester) === String(req.user._id);

    if (!isDonor && !isRequester && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the donor or accepted recipient can mark this donation as completed.',
      });
    }

    if (donationRequest.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This donation has already been marked as completed and rewarded.',
      });
    }

    donationRequest.status = 'Completed';
    donationRequest.completedAt = new Date();
    donationRequest.completionNote = completionNote || 'Picked up safely and verified.';
    await donationRequest.save();

    const foodPost = await FoodPost.findById(donationRequest.foodPost._id);
    if (foodPost) {
      foodPost.status = 'Completed';
      foodPost.completedAt = new Date();
      await foodPost.save();
    }

    // Award +40 points to the donor (strictly once per FoodPost ID via unique compound index)
    const rewardResult = await awardPointsIfEligible({
      userId: donationRequest.donor,
      actionType: 'DONATION_COMPLETED',
      points: 40,
      referenceModel: 'FoodPost',
      referenceId: donationRequest.foodPost._id,
      description: `Completed food donation: "${donationRequest.foodPost.title}" (${donationRequest.foodPost.servingsEstimate} servings)`,
      statUpdates: {
        donationsCompleted: 1,
        mealsSharedEstimate: donationRequest.foodPost.servingsEstimate || 2,
      },
    });

    // Notify both parties
    await Notification.create({
      recipient: isDonor ? donationRequest.requester : donationRequest.donor,
      sender: req.user._id,
      type: 'DONATION_COMPLETED',
      title: 'Food Donation Completed! 🌱',
      message: `"${donationRequest.foodPost.title}" has been marked as completed. Thank you for preventing food waste!`,
      link: `/food/${donationRequest.foodPost._id}`,
    });

    res.json({
      success: true,
      message: rewardResult.awarded
        ? 'Donation marked as completed! Donor earned +40 Impact Points.'
        : 'Donation marked as completed (points were already credited for this listing).',
      donationRequest,
      pointsAwarded: rewardResult.awarded ? 40 : 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonationRequest,
  getMyRequests,
  updateRequestStatus,
  completeDonation,
};
