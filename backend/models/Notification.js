/**
 * Notification Mongoose Model
 * Delivers in-app notifications for donation requests, request approvals,
 * volunteer responses, campaign pledges, and earned rewards.
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'DONATION_REQUEST',
        'REQUEST_ACCEPTED',
        'REQUEST_DECLINED',
        'DONATION_COMPLETED',
        'VOLUNTEER_APPLICATION',
        'VOLUNTEER_STATUS',
        'CAMPAIGN_PLEDGE',
        'REWARD_EARNED',
        'ADMIN_NOTICE',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '/dashboard',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
