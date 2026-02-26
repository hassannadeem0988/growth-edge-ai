const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing in .env file');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds
            connectTimeoutMS: 10000,        // 10 seconds
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`🚨 MongoDB Connection Error: ${error.message}`);
    }
};

module.exports = connectDB;
