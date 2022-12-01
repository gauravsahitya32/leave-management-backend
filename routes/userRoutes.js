const   userRoutes = require('express').Router();
const userController = require('../controllers/userController');
const userSchema = require('../Validators/user');
const middlewares = require('../Middlewares/index');

userRoutes.post('/', userSchema.addNewUserSchema, userController.addNewUser);

userRoutes.get('/', middlewares.isValidRequest, userSchema.getUserDetailsSchema, userController.getUserDetails);

module.exports = userRoutes;