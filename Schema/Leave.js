const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    leave_from: {
        type: Date,
        required: true
    },
    leave_to: {
        type: Date,
        required: true
    },
    leave_type: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
    reason: {
        type: String,
        required: true
    },
    approvers: {
        type: String,
        required: true
    },
    approvedBy: {
        type: String,
        default: `none`
    },
    rejectedBy: {
        type: String,
        default: `none`
    },
    status: {
        type: String,
        default: `pending`
    }
});

module.exports = leaveSchema;