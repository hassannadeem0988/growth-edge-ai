const express = require('express');
const router = express.Router();
const { generateChatResponse } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { usageGuard } = require('../middleware/usageMiddleware');

// Mount the restricted route protected by JWT and Usage limiters
router.post('/', protect, usageGuard, generateChatResponse);

module.exports = router;
