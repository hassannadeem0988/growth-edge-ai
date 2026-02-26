const User = require('../models/User');

// Middleware to run before generating an AI response
// Ensures the user has not hit the 500-message limit
const usageGuard = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if limit is reached
        const messageLimit = parseInt(process.env.MESSAGE_LIMIT) || 500;
        if (user.messageCount >= messageLimit) {
            return res.status(403).json({
                message: `Monthly limit reached. You have used ${messageLimit}/${messageLimit} messages.`,
                code: 'LIMIT_EXCEEDED'
            });
        }

        // Limit not reached, proceed to next middleware/controller
        next();
    } catch (error) {
        console.error('Usage guard error:', error);
        res.status(500).json({ message: 'Server logic error checking usage' });
    }
};

module.exports = { usageGuard };
