const User = require('../models/User');
const Document = require('../models/Document');
const pdfParse = require('pdf-parse-fork');
const { HfInference } = require('@huggingface/inference');
const { Pinecone } = require('@pinecone-database/pinecone');

// Init inference & Pinecone
const hf = new HfInference(process.env.HF_TOKEN);
const embeddingModel = process.env.EMBEDDING_MODEL || 'BAAI/bge-m3';
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reset all user message counts to 0
// @route   PUT /api/admin/reset-all
// @access  Private/Admin
const resetAllUsage = async (req, res) => {
    try {
        await User.updateMany({}, { messageCount: 0, lastReset: Date.now() });
        res.status(200).json({ message: 'All user message counts reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- KNOWLEDGE BASE --- //

const getChunks = (text, maxChars = 1000) => {
    const chunks = [];
    const splitText = text.split('\n\n');
    let currentChunk = '';

    for (const paragraph of splitText) {
        if ((currentChunk.length + paragraph.length) > maxChars) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = paragraph + '\n\n';
        } else {
            currentChunk += paragraph + '\n\n';
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
};

// @desc    Upload Knowledge PDF
// @route   POST /api/admin/upload
// @access  Private/Admin
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileBuffer = req.file.buffer;
        const filename = req.file.originalname;

        // Parse PDF
        const pdfData = await pdfParse(fileBuffer);
        const text = pdfData.text;

        // Chunking
        const chunks = getChunks(text, 1000);
        const vectorsToUpsert = [];
        let i = 0;

        for (const chunk of chunks) {
            // Embed
            const embedding = await hf.featureExtraction({
                model: embeddingModel,
                inputs: chunk,
            });

            vectorsToUpsert.push({
                id: `${filename}-${Date.now()}-chunk-${i}`,
                values: embedding,
                metadata: {
                    source: filename,
                    text: chunk,
                }
            });
            i++;
        }

        const indexName = process.env.PINECONE_INDEX_NAME;
        const index = pc.Index(indexName);

        // Batched Upsert
        for (let j = 0; j < vectorsToUpsert.length; j += 100) {
            const batch = vectorsToUpsert.slice(j, j + 100);
            await index.upsert(batch);
        }

        // Save into Mongo exactly as specified for logs
        const loggedDoc = await Document.create({
            filename: filename,
            size: req.file.size,
            chunks: chunks.length
        });

        res.status(200).json({ message: 'Success', document: loggedDoc });
    } catch (error) {
        res.status(500).json({ message: 'Server error during vectorization', error: error.message });
    }
};

// @desc    Get uploaded documents
// @route   GET /api/admin/documents
// @access  Private/Admin
const getDocuments = async (req, res) => {
    try {
        const docs = await Document.find({}).sort('-createdAt');
        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUsers,
    resetAllUsage,
    uploadDocument,
    getDocuments,
};
