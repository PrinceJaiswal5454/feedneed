/**
 * Rewards, Points, Levels & Badges Helper
 * Prevents duplicate rewards for the same completed activity by checking
 * and inserting into RewardTransaction with a unique compound index.
 */
const User = require('../models/User');
const RewardTransaction = require('../models/RewardTransaction');
const Notification = require('../models/Notification');

const LEVEL_THRESHOLDS = [
  { level: 1, minPoints: 0, title: 'Seedling Sharer' },
  { level: 2, minPoints: 50, title: 'Kindness Sprout' },
  { level: 3, minPoints: 150, title: 'Zero-Waste Neighbor' },
  { level: 4, minPoints: 300, title: 'Community Nourisher' },
  { level: 5, minPoints: 500, title: 'Hunger Hero' },
  { level: 6, minPoints: 850, title: 'FeedNeed Guardian' },
];

const BADGE_DEFINITIONS = [
  {
    code: 'FIRST_POST',
    name: 'First Meal Shared',
    icon: '🍲',
    description: 'Listed your first valid surplus food post on FeedNeed.',
    check: (user) => user.impactStats.postsCreated >= 1,
  },
  {
    code: 'GENEROUS_DONOR',
    name: 'Zero-Waste Champion',
    icon: '🌱',
    description: 'Successfully completed 3 or more food donations.',
    check: (user) => user.impactStats.donationsCompleted >= 3,
  },
  {
    code: 'COMMUNITY_CHEF',
    name: 'Community Nourisher',
    icon: '🍱',
    description: 'Shared 25+ estimated meal servings with neighbors and NGOs.',
    check: (user) => user.impactStats.mealsSharedEstimate >= 25,
  },
  {
    code: 'VOLUNTEER_STAR',
    name: 'Active Volunteer',
    icon: '🤝',
    description: 'Completed a verified volunteer shift with an NGO campaign.',
    check: (user) => user.impactStats.volunteerHours >= 2,
  },
  {
    code: 'CAMPAIGN_BACKER',
    name: 'Drive Supporter',
    icon: '🏛️',
    description: 'Delivered supplies or food to an NGO donation drive.',
    check: (user) => user.impactStats.campaignsSupported >= 1,
  },
  {
    code: 'HUNGER_HERO',
    name: 'Hunger Hero (300+ Pts)',
    icon: '🏆',
    description: 'Earned over 300 impact points across food sharing and volunteering.',
    check: (user) => user.points >= 300,
  },
];

function calculateLevel(points) {
  let matched = LEVEL_THRESHOLDS[0];
  for (const threshold of LEVEL_THRESHOLDS) {
    if (points >= threshold.minPoints) {
      matched = threshold;
    }
  }
  return matched;
}

/**
 * Idempotently awards points and updates user impact stats & badges.
 * Returns { awarded: boolean, transaction, user }
 */
async function awardPointsIfEligible({
  userId,
  actionType,
  points,
  referenceModel,
  referenceId,
  description,
  statUpdates = {},
}) {
  try {
    // 1. Check if reward was already granted for this exact user + actionType + referenceId
    const existingTx = await RewardTransaction.findOne({
      user: userId,
      actionType,
      referenceId,
    });

    if (existingTx) {
      return { awarded: false, reason: 'already_awarded', transaction: existingTx };
    }

    // 2. Create the unique RewardTransaction
    const transaction = await RewardTransaction.create({
      user: userId,
      actionType,
      pointsAwarded: points,
      referenceModel,
      referenceId,
      description,
    });

    // 3. Update User points, impactStats, level, and badges
    const user = await User.findById(userId);
    if (!user) {
      return { awarded: false, reason: 'user_not_found' };
    }

    user.points += points;

    if (statUpdates.postsCreated) {
      user.impactStats.postsCreated += statUpdates.postsCreated;
    }
    if (statUpdates.donationsCompleted) {
      user.impactStats.donationsCompleted += statUpdates.donationsCompleted;
    }
    if (statUpdates.mealsSharedEstimate) {
      user.impactStats.mealsSharedEstimate += statUpdates.mealsSharedEstimate;
    }
    if (statUpdates.volunteerHours) {
      user.impactStats.volunteerHours += statUpdates.volunteerHours;
    }
    if (statUpdates.campaignsSupported) {
      user.impactStats.campaignsSupported += statUpdates.campaignsSupported;
    }

    // Recalculate level
    const levelInfo = calculateLevel(user.points);
    user.level = levelInfo.level;
    user.levelTitle = levelInfo.title;

    // Evaluate badges
    const existingBadgeCodes = new Set(user.badges.map((b) => b.code));
    for (const badgeDef of BADGE_DEFINITIONS) {
      if (!existingBadgeCodes.has(badgeDef.code) && badgeDef.check(user)) {
        user.badges.push({
          code: badgeDef.code,
          name: badgeDef.name,
          icon: badgeDef.icon,
          description: badgeDef.description,
          earnedAt: new Date(),
        });
      }
    }

    await user.save();

    // 4. Send in-app notification for earned reward
    await Notification.create({
      recipient: user._id,
      type: 'REWARD_EARNED',
      title: `+${points} Impact Points Earned!`,
      message: `${description} You now have ${user.points} points (${user.levelTitle}).`,
      link: '/rewards',
    });

    return { awarded: true, transaction, user };
  } catch (error) {
    // Handle race condition on unique index gracefully
    if (error.code === 11000) {
      return { awarded: false, reason: 'duplicate_prevented' };
    }
    throw error;
  }
}

module.exports = {
  awardPointsIfEligible,
  calculateLevel,
  LEVEL_THRESHOLDS,
  BADGE_DEFINITIONS,
};
