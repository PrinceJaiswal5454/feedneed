/**
 * VolunteerApplication Controller
 * Connects volunteers with NGO campaigns, handles NGO approval/completion,
 * and awards +50 points for verified volunteer contributions.
 */
const VolunteerApplication = require('../models/VolunteerApplication');
const NGOCampaign = require('../models/NGOCampaign');
const Notification = require('../models/Notification');
const { awardPointsIfEligible } = require('../utils/rewardHelper');

// @desc    Apply as a volunteer for an NGO campaign
// @route   POST /api/volunteers/apply
// @access  Private
const applyForCampaign = async (req, res, next) => {
  try {
    const { campaignId, preferredRole, availability, hasVehicle, experienceNote } = req.body;

    const campaign = await NGOCampaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'NGO Campaign not found.' });
    }

    const existing = await VolunteerApplication.findOne({
      campaign: campaignId,
      volunteer: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a volunteer application for this campaign.',
      });
    }

    const application = await VolunteerApplication.create({
      campaign: campaign._id,
      ngo: campaign.ngo,
      volunteer: req.user._id,
      preferredRole: preferredRole || 'Food Pickup & Distribution',
      availability,
      hasVehicle: Boolean(hasVehicle),
      experienceNote,
    });

    await Notification.create({
      recipient: campaign.ngo,
      sender: req.user._id,
      type: 'VOLUNTEER_APPLICATION',
      title: 'New Volunteer Offer',
      message: `${req.user.name} applied to volunteer as "${preferredRole}" for "${campaign.title}".`,
      link: '/dashboard',
    });

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted! The NGO team will review your offer.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get volunteer applications for current user (or incoming applications for NGO)
// @route   GET /api/volunteers/my
// @access  Private
const getMyVolunteerApplications = async (req, res, next) => {
  try {
    const myApplications = await VolunteerApplication.find({ volunteer: req.user._id })
      .populate('campaign', 'title city dropoffArea scheduleWindow startDate endDate status')
      .populate('ngo', 'name ngoDetails city phone email')
      .sort({ createdAt: -1 });

    let ngoIncomingApplications = [];
    if (req.user.role === 'ngo' || req.user.role === 'admin') {
      const filter = req.user.role === 'admin' ? {} : { ngo: req.user._id };
      ngoIncomingApplications = await VolunteerApplication.find(filter)
        .populate('campaign', 'title city dropoffArea')
        .populate('volunteer', 'name email phone city neighborhood points levelTitle badges')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      myApplications,
      ngoIncomingApplications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    NGO updates volunteer application status ('Accepted', 'Completed', 'Declined')
// @route   PUT /api/volunteers/:id/status
// @access  Private (NGO or Admin)
const updateVolunteerStatus = async (req, res, next) => {
  try {
    const { status, hoursContributed, ngoResponseNote } = req.body;
    const application = await VolunteerApplication.findById(req.params.id).populate('campaign');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Volunteer application not found.' });
    }

    if (String(application.ngo) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the organizing NGO or an Admin can update this volunteer application.',
      });
    }

    const previousStatus = application.status;
    application.status = status;
    if (ngoResponseNote !== undefined) application.ngoResponseNote = ngoResponseNote;

    if (status === 'Accepted' && previousStatus !== 'Accepted') {
      await NGOCampaign.findByIdAndUpdate(application.campaign._id, {
        $inc: { volunteersAccepted: 1 },
      });

      await Notification.create({
        recipient: application.volunteer,
        sender: req.user._id,
        type: 'VOLUNTEER_STATUS',
        title: 'Volunteer Application Accepted! 🤝',
        message: `Your offer to volunteer for "${application.campaign.title}" was accepted! Check your dashboard for coordinator details.`,
        link: `/campaigns/${application.campaign._id}`,
      });
    }

    let pointsAwarded = 0;
    if (status === 'Completed') {
      const hours = Number(hoursContributed) || 4;
      application.hoursContributed = hours;
      application.completedAt = new Date();

      const rewardResult = await awardPointsIfEligible({
        userId: application.volunteer,
        actionType: 'VOLUNTEER_VERIFIED',
        points: 50,
        referenceModel: 'VolunteerApplication',
        referenceId: application._id,
        description: `Verified volunteer service (${hours} hrs) for "${application.campaign.title}"`,
        statUpdates: { volunteerHours: hours },
      });

      if (rewardResult.awarded) {
        pointsAwarded = 50;
      }
    }

    await application.save();

    res.json({
      success: true,
      message:
        status === 'Completed'
          ? `Volunteer contribution verified! ${pointsAwarded ? '+50 Impact Points awarded.' : ''}`
          : `Volunteer application marked as ${status}.`,
      application,
      pointsAwarded,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForCampaign,
  getMyVolunteerApplications,
  updateVolunteerStatus,
};
