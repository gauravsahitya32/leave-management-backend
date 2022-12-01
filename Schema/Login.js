const mongoose = require('mongoose');


const loginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    loggedIn: {
        type: Boolean,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
});

module.exports = loginSchema;