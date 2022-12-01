const mongoose = require('mongoose');
const userSchema = require('../Schema/User');

const User = new mongoose.model("User", userSchema);

module.exports = User;