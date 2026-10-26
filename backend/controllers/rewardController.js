/**
 * Rewards, Leaderboard & Real-Time Impact Statistics Controller
 * Computes live platform statistics from MongoDB collections (no hardcoded stats).
 */
const User = require('../models/User');
const FoodPost = require('../models/FoodPost');
const NGOCampaign = require('../models/NGOCampaign');
const VolunteerApplication = require('../models/VolunteerApplication');
const RewardTransaction = require('../models/RewardTransaction');
const { LEVEL_THRESHOLDS, BADGE_DEFINITIONS } = require('../utils/rewardHelper');

// @desc    Get live platform impact statistics & leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Public
const getLeaderboardAndStats = async (req, res, next) => {
  try {
    const topUsers = await User.find({ isSuspended: false })
      .select('name role city neighborhood points level levelTitle badges impactStats ngoDetails')
      .sort({ points: -1 })
      .limit(15);

    // Compute real-time aggregate platform statistics from MongoDB
    const totalFoodPosts = await FoodPost.countDocuments({ status: { $ne: 'Flagged' } });
    const completedPosts = await FoodPost.find({ status: 'Completed' }).select('servingsEstimate');
    const availablePostsCount = await FoodPost.countDocuments({ status: 'Available' });
    const activeCampaignsCount = await NGOCampaign.countDocuments({ status: 'Active' });
    const verifiedNgosCount = await User.countDocuments({
      role: 'ngo',
      'ngoDetails.verificationStatus': 'verified',
    });

    const mealsFromPosts = completedPosts.reduce(
      (sum, p) => sum + (Number(p.servingsEstimate) || 0),
      0
    );
    const allCampaigns = await NGOCampaign.find().select('mealsCollected');
    const mealsFromCampaigns = allCampaigns.reduce(
      (sum, c) => sum + (Number(c.mealsCollected) || 0),
      0
    );

    const completedVolunteers = await VolunteerApplication.find({ status: 'Completed' }).select(
      'hoursContributed'
    );
    const totalVolunteerHours = completedVolunteers.reduce(
      (sum, v) => sum + (Number(v.hoursContributed) || 0),
      0
    );

    res.json({
      success: true,
      platformStats: {
        totalMealsShared: mealsFromPosts + mealsFromCampaigns,
        totalFoodPosts,
        completedDonationsCount: completedPosts.length,
        availablePostsCount,
        activeCampaignsCount,
        verifiedNgosCount,
        totalVolunteerHours,
      },
      leaderboard: topUsers,
      levelsCatalog: LEVEL_THRESHOLDS,
      badgesCatalog: BADGE_DEFINITIONS.map(({ code, name, icon, description }) => ({
        code,
        name,
        icon,
        description,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's reward transactions
// @route   GET /api/rewards/my-transactions
// @access  Private
const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await RewardTransaction.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboardAndStats,
  getMyTransactions,
};
