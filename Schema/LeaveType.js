const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`
    },
    paid_leave: {
        type: mongoose.Schema.Types.Number,
        required: true,
        default: 12
    },
    paid_leave_used: {
        type: mongoose.Schema.Types.Number,
        required: true,
        default: 0
    },
    sick_leave: {
        type: mongoose.Schema.Types.Number,
        required: true,
        default: 4
    },
    sick_leave_used: {
        type: mongoose.Schema.Types.Number,
        required: true,
        default: 0
    },
    unpaid_leave: {
        type: mongoose.Schema.Types.String,
        required: true,
        default: `Infinity`
    },
    unpaid_leave_used: {
        type: mongoose.Schema.Types.Number,
        required: true,
        default: 0
    }
});

module.exports = leaveTypeSchema;