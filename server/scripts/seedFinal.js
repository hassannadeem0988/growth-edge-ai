const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedFinalUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = [
            {
                email: 'hass_admin@growthedge.co',
                password: 'GE_Admin_Secure_99!', // You can change this
                role: 'admin',
                messageCount: 0
            },
            {
                email: 'ali_employee@growthedge.co',
                password: 'GE_Staff_Access_77!', // You can change this
                role: 'user',
                messageCount: 0
            }
        ];

        for (const u of users) {
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                const salt = await bcrypt.genSalt(10);
                existing.password = await bcrypt.hash(u.password, salt);
                existing.role = u.role;
                await existing.save();
                console.log(`Updated: ${u.email}`);
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                await User.create({
                    ...u,
                    password: hashedPassword
                });
                console.log(`Created: ${u.email}`);
            }
        }

        console.log('--- FINAL ACCOUNTS PREPARED ---');
        console.log('Admin: hass_admin@growthedge.co / GE_Admin_Secure_99!');
        console.log('Staff: ali_employee@growthedge.co / GE_Staff_Access_77!');

        process.exit();
    } catch (error) {
        console.error('Error seeding final users:', error);
        process.exit(1);
    }
};

seedFinalUsers();
