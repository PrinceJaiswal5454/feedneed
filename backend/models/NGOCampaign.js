/**
 * NGOCampaign Mongoose Model
 * Allows NGOs to publish food drives, list required food quantities and supplies,
 * describe beneficiary needs, set schedules, and recruit volunteers/donors.
 */
const mongoose = require('mongoose');

const requiredItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, default: 'Dry Rations' },
  quantityNeeded: { type: Number, required: true, min: 1 },
  quantityFulfilled: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' },
});

const campaignPledgeSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true },
    quantityPledged: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'servings' },
    deliveryNote: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pledged', 'Delivered'],
      default: 'Pledged',
    },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ngoCampaignSchema = new mongoose.Schema(
  {
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter a campaign title'],
      trim: true,
      maxlength: [120, 'Campaign title cannot exceed 120 characters'],
    },
    summary: {
      type: String,
      required: [true, 'Please provide a brief summary'],
      maxlength: [240, 'Summary cannot exceed 240 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please describe the campaign and beneficiary needs'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    beneficiaryGroup: {
      type: String,
      required: [true, 'Please specify the beneficiaries (e.g., Daily Wage Families, Shelter Children)'],
    },
    beneficiaryCount: {
      type: Number,
      default: 100,
    },
    targetMeals: {
      type: Number,
      required: [true, 'Please set a target number of meals/rations'],
      min: 10,
    },
    mealsCollected: {
      type: Number,
      default: 0,
    },
    requiredItems: [requiredItemSchema],
    volunteersNeeded: {
      type: Number,
      default: 10,
    },
    volunteersAccepted: {
      type: Number,
      default: 0,
    },
    volunteerRoles: {
      type: [String],
      default: ['Food Pickup & Transport', 'Meal Sorting & Packing', 'Community Distribution'],
    },
    city: {
      type: String,
      required: true,
    },
    dropoffArea: {
      type: String,
      required: true,
    },
    exactDropoffAddress: {
      type: String,
      required: true,
      // Protected until user pledges or applies as a volunteer or NGO sets public consent
    },
    publicContactConsent: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    scheduleWindow: {
      type: String,
      required: [true, 'Please specify drop-off / distribution schedule hours'],
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Paused'],
      default: 'Active',
    },
    pledges: [campaignPledgeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('NGOCampaign', ngoCampaignSchema);
