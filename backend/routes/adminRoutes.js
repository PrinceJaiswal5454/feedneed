const express = require('express');
const router = express.Router();
const {
  createReport,
  getAdminOverview,
  verifyNgoAccount,
  toggleUserSuspension,
  resolveReport,
  moderateFoodPost,
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/reports', protect, createReport);
router.get('/overview', protect, authorizeRoles('admin'), getAdminOverview);
router.put('/ngos/:id/verify', protect, authorizeRoles('admin'), verifyNgoAccount);
router.put('/users/:id/suspend', protect, authorizeRoles('admin'), toggleUserSuspension);
router.put('/reports/:id', protect, authorizeRoles('admin'), resolveReport);
router.put('/food/:id/moderate', protect, authorizeRoles('admin'), moderateFoodPost);

module.exports = router;
