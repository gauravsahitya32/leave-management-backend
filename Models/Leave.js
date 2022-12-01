const mongoose = require('mongoose');
const leaveSchema = require('../Schema/Leave');

const Leave = new mongoose.model("Leave", leaveSchema);

module.exports = Leave;