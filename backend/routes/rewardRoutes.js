const express = require('express');
const router = express.Router();
const { getLeaderboardAndStats, getMyTransactions } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/leaderboard', getLeaderboardAndStats);
router.get('/my-transactions', protect, getMyTransactions);

module.exports = router;
