/**
 * MongoDB Database Connection Configuration
 * Connects to MongoDB using Mongoose and environment variables.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables (.env).');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[FeedNeed DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[FeedNeed DB Error] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
