const loginSchema = require('../Schema/Login');
const mongoose = require('mongoose');

const Login = new mongoose.model("Login", loginSchema);

module.exports = Login;