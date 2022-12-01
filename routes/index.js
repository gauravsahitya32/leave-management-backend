const routes = require('express').Router();
const userRoutes = require('./userRoutes');
const loginRoute = require('./loginRoutes');
const leaveRoute = require('./leaveRoutes');

routes.use('/users', userRoutes);
routes.use('/account', loginRoute);

routes.use('/leave', leaveRoute);

module.exports = routes;