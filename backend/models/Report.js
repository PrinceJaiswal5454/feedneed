/**
 * Report Mongoose Model
 * Allows users to report inappropriate, unsafe, or expired food listings
 * or unverified claims so Admins can review and moderate them.
 */
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['FoodPost', 'NGOCampaign', 'User'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetTitle: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      enum: [
        'Expired or Unsafe Food',
        'Misleading Information',
        'Inappropriate Content / Spam',
        'Suspicious Organization Claim',
        'No-Show / Unresponsive Contact',
      ],
      required: true,
    },
    details: {
      type: String,
      required: [true, 'Please provide details to help moderators investigate'],
      maxlength: [600, 'Details cannot exceed 600 characters'],
    },
    status: {
      type: String,
      enum: ['Open', 'Resolved', 'Dismissed'],
      default: 'Open',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
