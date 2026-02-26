const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getUsers, resetAllUsage, uploadDocument, getDocuments } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { checkAdmin } = require('../middleware/adminMiddleware');

// Setup multer memory storage since we process buffers directly via Pinecone/HF
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/users', protect, checkAdmin, getUsers);
router.put('/reset-all', protect, checkAdmin, resetAllUsage);

// Dynamic Knowledge API
router.post('/upload', protect, checkAdmin, upload.single('file'), uploadDocument);
router.get('/documents', protect, checkAdmin, getDocuments);

module.exports = router;
