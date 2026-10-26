const express = require('express');
const router = express.Router();
const {
  getFoodPosts,
  getFoodPostById,
  createFoodPost,
  updateFoodPost,
  deleteFoodPost,
} = require('../controllers/foodController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', optionalAuth, getFoodPosts);
router.get('/:id', optionalAuth, getFoodPostById);
router.post('/', protect, upload.single('photo'), createFoodPost);
router.put('/:id', protect, upload.single('photo'), updateFoodPost);
router.delete('/:id', protect, deleteFoodPost);

module.exports = router;
