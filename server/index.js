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

// Connect to MongoDB
connectDB().then(async () => {
    if (process.env.NODE_ENV === 'production') {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');

        const seedUsers = [
            { email: 'hass_admin@growthedge.co', password: 'GE_Admin_Secure_99!', role: 'admin' },
            { email: 'ali_employee@growthedge.co', password: 'GE_Staff_Access_77!', role: 'user' }
        ];

        for (const u of seedUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                await User.create({ ...u, password: hashedPassword });
                console.log(`✅ Auto-seeded: ${u.email}`);
            }
        }
    }
});

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Required for setting HTTP-only cookies
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
