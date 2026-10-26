/**
 * FoodPost Mongoose Model
 * Represents a surplus household or event food listing shared by an Individual or NGO.
 * Enforces food safety metadata (preparation time, expiry deadline, storage, checklist)
 * and separates public area from protected exact pickup address.
 */
const mongoose = require('mongoose');

const foodPostSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter a food name or title'],
      trim: true,
      maxlength: [100, 'Food title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please describe the food items, ingredients, and packaging'],
      maxlength: [800, 'Description cannot exceed 800 characters'],
    },
    photoUrl: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please select a food category'],
      enum: [
        'Cooked Meal',
        'Fresh Produce',
        'Bakery & Bread',
        'Packaged / Dry Goods',
        'Dairy & Beverages',
        'Event Surplus',
      ],
    },
    dietaryType: {
      type: String,
      required: [true, 'Please specify vegetarian or non-vegetarian status'],
      enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain'],
    },
    quantity: {
      type: String,
      required: [true, 'Please specify quantity (e.g., "6 meal boxes" or "3 kg")'],
      trim: true,
    },
    servingsEstimate: {
      type: Number,
      required: [true, 'Please provide an estimated number of servings'],
      min: [1, 'Servings must be at least 1'],
      default: 2,
    },
    preparedAt: {
      type: Date,
      required: [true, 'Please specify when the food was prepared or packed'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Please specify the safe-consumption deadline / expiry time'],
    },
    storageCondition: {
      type: String,
      enum: ['Refrigerated', 'Hot / Insulated', 'Room Temperature (Dry)', 'Frozen'],
      default: 'Refrigerated',
    },
    allergens: {
      type: String,
      default: 'None specified',
    },
    // Location & Protected Pickup Details
    pickupCity: {
      type: String,
      required: [true, 'Pickup city is required'],
      trim: true,
    },
    pickupArea: {
      type: String,
      required: [true, 'Public neighborhood or landmark is required'],
      trim: true,
    },
    exactPickupAddress: {
      type: String,
      required: [true, 'Exact pickup address is required (hidden until request approval)'],
      trim: true,
    },
    pickupInstructions: {
      type: String,
      default: 'Bring clean reusable containers if possible.',
      maxlength: [300, 'Pickup instructions cannot exceed 300 characters'],
    },
    contactPreference: {
      type: String,
      enum: ['approval_only', 'immediate_consent', 'in_app_only'],
      default: 'approval_only',
    },
    donorPhoneConsent: {
      type: Boolean,
      default: false, // If true, phone is revealed immediately; otherwise only on accepted request
    },
    // Food Safety Declaration
    safetyDeclarationAccepted: {
      type: Boolean,
      required: [true, 'You must confirm the food safety declaration before posting'],
      validate: {
        validator: (val) => val === true,
        message: 'Food safety declaration must be accepted.',
      },
    },
    status: {
      type: String,
      enum: ['Available', 'Requested', 'Reserved', 'Completed', 'Expired', 'Flagged'],
      default: 'Available',
    },
    acceptedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    moderationNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodPost', foodPostSchema);
