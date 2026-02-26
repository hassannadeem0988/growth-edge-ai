const User = require('../models/User');

// @desc    Get current usage count
// @route   GET /api/user/usage
// @access  Private
const getUsage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            messageCount: user.messageCount,
            limit: parseInt(process.env.MESSAGE_LIMIT) || 500, // Dynamic limit from Config
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUsage,
};
