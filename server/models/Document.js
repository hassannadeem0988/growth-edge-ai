const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
        },
        chunks: {
            type: Number,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Document', documentSchema);
