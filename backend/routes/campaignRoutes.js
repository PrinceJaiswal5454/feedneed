const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  getCampaignById,
  createCampaign,
  pledgeToCampaign,
} = require('../controllers/campaignController');
const { protect, optionalAuth, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', optionalAuth, getCampaigns);
router.get('/:id', optionalAuth, getCampaignById);
router.post('/', protect, authorizeRoles('ngo', 'admin'), upload.single('banner'), createCampaign);
router.post('/:id/pledge', protect, pledgeToCampaign);

module.exports = router;
