const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing in .env file');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            dbName: 'growthedge',
            bufferCommands: true // ALLOW buffering so the server waits for connection
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // AUTO-SEED LOGIC (Guaranteed to run after connection)
        if (process.env.NODE_ENV === 'production') {
            const User = require('../models/User');
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
    } catch (error) {
        console.error(`🚨 MongoDB Connection Error: ${error.message}`);
    }
};

module.exports = connectDB;
