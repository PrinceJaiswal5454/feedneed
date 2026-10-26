/**
 * RewardTransaction Mongoose Model
 * Logs points awarded for valid food posts, completed donations,
 * verified volunteer contributions, and successful campaign support.
 * Enforces a compound unique index on (user, actionType, referenceId)
 * so duplicate rewards for the exact same completed activity are impossible.
 */
const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        'FOOD_POST_CREATED',
        'DONATION_COMPLETED',
        'VOLUNTEER_VERIFIED',
        'CAMPAIGN_SUPPORTED',
      ],
      required: true,
    },
    pointsAwarded: {
      type: Number,
      required: true,
    },
    referenceModel: {
      type: String,
      enum: ['FoodPost', 'DonationRequest', 'VolunteerApplication', 'NGOCampaign'],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index strictly prevents duplicate rewards for the same activity
rewardTransactionSchema.index(
  { user: 1, actionType: 1, referenceId: 1 },
  { unique: true }
);

module.exports = mongoose.model('RewardTransaction', rewardTransactionSchema);
