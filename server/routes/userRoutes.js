const express = require('express');
const router = express.Router();
const { getUsage } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/usage', protect, getUsage);

module.exports = router;
