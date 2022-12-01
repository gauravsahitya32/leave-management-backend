const leaveRoute = require('express').Router();
const leaveController = require('../controllers/leaveController');

const middlewares = require('../Middlewares');
const leaveValidators = require('../Validators/leave');

leaveRoute.post('/', middlewares.isValidRequest, leaveValidators.isValidLeaveRequest, leaveController.createNewLeave);
leaveRoute.post('/get-availability', middlewares.isValidRequest, leaveValidators.isValidAvailabilityReq, leaveController.isLeaveAvailable);

leaveRoute.get('/approve', leaveValidators.isValidApproveReq, leaveController.approveLeave);
leaveRoute.get('/reject', leaveValidators.isValidApproveReq, leaveController.rejectLeave);
leaveRoute.get('/history', middlewares.isValidRequest, leaveValidators.isValidHistoryRequest, leaveController.getLeaveHistory);
leaveRoute.get(`/reports`, leaveController.getReportedUsers);

leaveRoute.delete(`/`, middlewares.isValidRequest, leaveValidators.isValidDeleteRequest, leaveController.deleteLeave);

module.exports = leaveRoute;