const leaveTypeSchema = require('../Schema/LeaveType');
const mongoose = require('mongoose');

const Leave_Type = new mongoose.model("LeaveType", leaveTypeSchema);

module.exports = Leave_Type;