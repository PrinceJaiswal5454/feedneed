/**
 * FeedNeed Clean Database Utility Script
 * Run with: npm run seed (inside /backend)
 *
 * Clears all collections so the database starts completely clean
 * with zero demo accounts and zero sample listings.
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const FoodPost = require('../models/FoodPost');
const DonationRequest = require('../models/DonationRequest');
const NGOCampaign = require('../models/NGOCampaign');
const VolunteerApplication = require('../models/VolunteerApplication');
const RewardTransaction = require('../models/RewardTransaction');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

const resetCleanDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing all collections for a clean zero-demo database state...');
    await Promise.all([
      User.deleteMany({}),
      FoodPost.deleteMany({}),
      DonationRequest.deleteMany({}),
      NGOCampaign.deleteMany({}),
      VolunteerApplication.deleteMany({}),
      RewardTransaction.deleteMany({}),
      Notification.deleteMany({}),
      Report.deleteMany({}),
    ]);

    console.log('✅ FeedNeed database is now completely clean (0 demo accounts, 0 demo posts).');
    console.log('👉 Register your own Individual, NGO, or Admin account at /register to get started.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset error:', error);
    process.exit(1);
  }
};

resetCleanDatabase();
