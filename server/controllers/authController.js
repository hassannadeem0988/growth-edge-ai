const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT for auth
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // 30 day expiration
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
        });

        if (user) {
            const token = generateToken(user._id);

            // Set HTTP-only cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            res.status(201).json({
                _id: user.id,
                email: user.email,
                messageCount: user.messageCount,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!process.env.JWT_SECRET) {
                console.error('🚨 JWT_SECRET is missing in environment variables!');
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const token = generateToken(user._id);

            // Set HTTP-only cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: true, // Always secure for Vercel
                sameSite: 'none', // Required for cross-site cookies between diff vercel domains
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            console.log(`✅ Login successful for: ${user.email}`);
            res.json({
                _id: user.id,
                email: user.email,
                messageCount: user.messageCount,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('🚨 LOGIN ERROR:', error.stack || error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get currently logged in user (from cookie)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = {
            _id: req.user._id,
            email: req.user.email,
            messageCount: req.user.messageCount,
            role: req.user.role,
        };
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
};
