/**
 * DonationRequest Mongoose Model
 * Tracks requests from individuals or NGOs to pick up a FoodPost.
 * Controls when protected donor contact details and exact address are unlocked.
 */
const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    foodPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodPost',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedServings: {
      type: Number,
      required: true,
      min: 1,
    },
    message: {
      type: String,
      required: [true, 'Please include a short note about pickup timing and need'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    proposedPickupTime: {
      type: String,
      required: [true, 'Please propose a pickup time window'],
    },
    requesterConsentToShareContact: {
      type: Boolean,
      default: true,
    },
    donorConsentToShareContact: {
      type: Boolean,
      default: false, // Automatically set to true when donor accepts the request
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed', 'Declined', 'Cancelled'],
      default: 'Pending',
    },
    completionNote: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
