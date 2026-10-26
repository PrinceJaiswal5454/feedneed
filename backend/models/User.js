/**
 * User Mongoose Model
 * Supports three account roles: 'individual', 'ngo', and 'admin'.
 * Includes bcrypt password hashing, NGO verification metadata,
 * privacy preferences, and impact/rewards tracking.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name or organization contact name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password hashes by default
    },
    role: {
      type: String,
      enum: ['individual', 'ngo', 'admin'],
      default: 'individual',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [400, 'Bio cannot exceed 400 characters'],
      default: '',
    },
    // Location & Protected Contact Fields
    city: {
      type: String,
      required: [true, 'City is required to match local food donations'],
      trim: true,
    },
    neighborhood: {
      type: String,
      required: [true, 'Neighborhood/Area is required'],
      trim: true,
    },
    exactAddress: {
      type: String,
      default: '',
      // Protected field: only shared when user consents or request is accepted
    },
    phone: {
      type: String,
      default: '',
      // Protected field: masked unless user consents or request is accepted
    },
    contactPreference: {
      type: String,
      enum: ['approval_only', 'in_app_only', 'public_to_verified'],
      default: 'approval_only',
    },
    showPhoneOnApproval: {
      type: Boolean,
      default: true,
    },
    // NGO-Specific Profile Fields
    ngoDetails: {
      organizationName: { type: String, default: '' },
      registrationNumber: { type: String, default: '' },
      verificationStatus: {
        type: String,
        enum: ['none', 'pending', 'verified', 'rejected'],
        default: 'none',
      },
      verifiedAt: { type: Date },
      beneficiaryFocus: { type: String, default: '' },
      operatingHours: { type: String, default: '' },
      website: { type: String, default: '' },
      dailyMealsCapacity: { type: Number, default: 0 },
    },
    // Rewards, Gamification & Impact Statistics
    points: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    levelTitle: {
      type: String,
      default: 'Seedling Sharer',
    },
    badges: [
      {
        code: String,
        name: String,
        icon: String,
        description: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    impactStats: {
      postsCreated: { type: Number, default: 0 },
      donationsCompleted: { type: Number, default: 0 },
      mealsSharedEstimate: { type: Number, default: 0 },
      volunteerHours: { type: Number, default: 0 },
      campaignsSupported: { type: Number, default: 0 },
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare candidate password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
