const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing in .env file');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000,
            dbName: 'growthedge', // Explicitly set the DB name
            bufferCommands: false // Disable buffering - fail fast if not connected
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Masking the URI for safety but logging the attempt
        const maskedURI = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:.+@/, ':****@') : 'MISSING';
        console.error(`🚨 MongoDB Connection Error! Attempted URI: ${maskedURI}`);
        console.error(`🚨 Message: ${error.message}`);
    }
};

module.exports = connectDB;
