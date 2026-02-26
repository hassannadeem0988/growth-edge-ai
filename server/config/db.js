const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'growthedge',
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = db.connections[0].readyState === 1;
        console.log('✅ MongoDB Connected');

        // Seed if needed
        if (process.env.NODE_ENV === 'production') {
            const User = require('../models/User');
            const bcrypt = require('bcryptjs');
            const seedUsers = [
                { email: 'hass_admin@growthedge.co', password: 'GE_Admin_Secure_99!', role: 'admin' },
                { email: 'ali_employee@growthedge.co', password: 'GE_Staff_Access_77!', role: 'user' }
            ];

            for (const u of seedUsers) {
                const doc = await User.findOne({ email: u.email });
                if (!doc) {
                    const salt = await bcrypt.genSalt(10);
                    const hashed = await bcrypt.hash(u.password, salt);
                    await User.create({ ...u, password: hashed });
                }
            }
        }
    } catch (error) {
        console.error('🚨 DB Error:', error.message);
        throw error;
    }
};

module.exports = connectDB;
