/**
 * Admin & Moderation Controller
 * Allows Admins to manage users, verify NGO profiles, review reports,
 * and flag/remove inappropriate or unsafe food posts.
 */
const User = require('../models/User');
const FoodPost = require('../models/FoodPost');
const NGOCampaign = require('../models/NGOCampaign');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @desc    Submit a safety or moderation report (Any logged-in user)
// @route   POST /api/admin/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, targetTitle, reason, details } = req.body;

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      targetTitle: targetTitle || 'Reported Listing',
      reason,
      details,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted to FeedNeed moderators for review.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard overview (users, NGO verification queue, reports, posts)
// @route   GET /api/admin/overview
// @access  Private (Admin only)
const getAdminOverview = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const reports = await Report.find()
      .populate('reporter', 'name email role')
      .sort({ createdAt: -1 });
    const foodPosts = await FoodPost.find()
      .populate('donor', 'name email role city')
      .sort({ createdAt: -1 });
    const campaigns = await NGOCampaign.find()
      .populate('ngo', 'name email ngoDetails city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      counts: {
        totalUsers: users.length,
        pendingNgos: users.filter(
          (u) => u.role === 'ngo' && u.ngoDetails?.verificationStatus === 'pending'
        ).length,
        openReports: reports.filter((r) => r.status === 'Open').length,
        flaggedPosts: foodPosts.filter((p) => p.status === 'Flagged').length,
      },
      users,
      reports,
      foodPosts,
      campaigns,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject an NGO account
// @route   PUT /api/admin/ngos/:id/verify
// @access  Private (Admin only)
const verifyNgoAccount = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' | 'rejected' | 'pending'
    const ngoUser = await User.findById(req.params.id);

    if (!ngoUser || ngoUser.role !== 'ngo') {
      return res.status(404).json({ success: false, message: 'NGO user account not found.' });
    }

    ngoUser.ngoDetails.verificationStatus = status;
    if (status === 'verified') {
      ngoUser.ngoDetails.verifiedAt = new Date();
      const hasBadge = ngoUser.badges.some((b) => b.code === 'VERIFIED_NGO');
      if (!hasBadge) {
        ngoUser.badges.push({
          code: 'VERIFIED_NGO',
          name: 'Verified NGO Partner',
          icon: '✅',
          description: 'Organization credentials verified by FeedNeed Administrators.',
        });
      }
    }

    await ngoUser.save();

    await Notification.create({
      recipient: ngoUser._id,
      sender: req.user._id,
      type: 'ADMIN_NOTICE',
      title: `NGO Verification Status: ${status.toUpperCase()}`,
      message:
        status === 'verified'
          ? 'Congratulations! Your organization profile is now Verified on FeedNeed.'
          : `Your NGO verification status has been updated to: ${status}.`,
      link: '/profile',
    });

    res.json({
      success: true,
      message: `NGO verification status updated to ${status}.`,
      user: ngoUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user account suspension
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
const toggleUserSuspension = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id).select('-password');
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be suspended.',
      });
    }

    targetUser.isSuspended = !targetUser.isSuspended;
    await targetUser.save();

    res.json({
      success: true,
      message: targetUser.isSuspended
        ? `User ${targetUser.name} has been suspended.`
        : `User ${targetUser.name} has been reinstated.`,
      user: targetUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve or dismiss a report and optionally flag the target post
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin only)
const resolveReport = async (req, res, next) => {
  try {
    const { status, adminNotes, flagTargetPost } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    report.status = status || 'Resolved';
    report.adminNotes = adminNotes || 'Reviewed by moderator.';
    report.resolvedBy = req.user._id;
    await report.save();

    if (flagTargetPost && report.targetType === 'FoodPost') {
      await FoodPost.findByIdAndUpdate(report.targetId, {
        status: 'Flagged',
        moderationNote: adminNotes || 'Flagged by moderator due to safety/policy report.',
      });
    }

    res.json({
      success: true,
      message: `Report marked as ${report.status}.`,
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Flag or restore a food post directly
// @route   PUT /api/admin/food/:id/moderate
// @access  Private (Admin only)
const moderateFoodPost = async (req, res, next) => {
  try {
    const { status, moderationNote } = req.body;
    const post = await FoodPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Food post not found.' });
    }

    post.status = status;
    post.moderationNote = moderationNote || '';
    await post.save();

    res.json({
      success: true,
      message: `Food listing status updated to ${status}.`,
      foodPost: post,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getAdminOverview,
  verifyNgoAccount,
  toggleUserSuspension,
  resolveReport,
  moderateFoodPost,
};
