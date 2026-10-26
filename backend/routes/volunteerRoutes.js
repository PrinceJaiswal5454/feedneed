const express = require('express');
const router = express.Router();
const {
  applyForCampaign,
  getMyVolunteerApplications,
  updateVolunteerStatus,
} = require('../controllers/volunteerController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyForCampaign);
router.get('/my', protect, getMyVolunteerApplications);
router.put('/:id/status', protect, authorizeRoles('ngo', 'admin'), updateVolunteerStatus);

module.exports = router;
