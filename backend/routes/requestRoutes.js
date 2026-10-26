const express = require('express');
const router = express.Router();
const {
  createDonationRequest,
  getMyRequests,
  updateRequestStatus,
  completeDonation,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createDonationRequest);
router.get('/my', protect, getMyRequests);
router.put('/:id/status', protect, updateRequestStatus);
router.put('/:id/complete', protect, completeDonation);

module.exports = router;
