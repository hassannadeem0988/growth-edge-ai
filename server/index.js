/**
 * GrowthEdge AI Assistant — Express Server
 * ==========================================
 * This is the main entry point for the backend API.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

const app = express();
app.set('trust proxy', 1); // Required for cookies to work on Vercel
const PORT = process.env.PORT || 5000;

// --- Middleware ---
// 1. Database Connection (Ensures DB is ready before routes)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ message: "Database connection failed", error: err.message });
    }
});

app.use(cors({
    origin: function (origin, callback) {
        // Allow any Vercel domain or localhost
        if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// --- Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// --- Health Check Route ---
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: '🚀 GrowthEdge AI Assistant API is running!',
        version: '1.0.0',
    });
});

// --- Start Server ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ GrowthEdge server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
