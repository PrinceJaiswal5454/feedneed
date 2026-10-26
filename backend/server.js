/**
 * FeedNeed Backend Express Server
 * Connects to MongoDB and exposes RESTful API endpoints for:
 * Auth, Food Posts, Donation Requests, NGO Campaigns, Volunteers,
 * Rewards/Leaderboard, Notifications, and Admin Moderation.
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded food & campaign photos statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'FeedNeed MERN API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[FeedNeed Server] Running on http://localhost:${PORT}`);
});
