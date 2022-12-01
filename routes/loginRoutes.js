const loginRoutes = require('express').Router();
const loginControllers = require('../controllers/loginController');

loginRoutes.post('/login', loginControllers.loginTheUser);
loginRoutes.post('/logout', loginControllers.logoutTheUser);
loginRoutes.post('/refresh', loginControllers.refreshAccessToken);

module.exports = loginRoutes;