const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv/config');

const User = require('./Models/User');
const Login = require('./Models/Login');
const Leave_Type = require('./Models/LeaveType');

let receivedCredentials, token, loggedUser;

const myLogger = (req, res, next) => {

    console.log(`\n----------------------------------------------------------------------------------`);
    console.log(`login time: ${new Date()}, Request : ${req.url}, Requested method : ${req.method}`);

    let err;

    if (req.method == 'GET') {
        next();
    }
    else if (req.method == 'POST') {
        next();
    }
    else if (req.method == 'PATCH') {
        next();
    }
    else if (req.method == 'DELETE') {
        next();
    }
    else if (req.method == 'PUT')
        next();
    else {

        err = {
            msg: `api is not ${req.method} compatible`
        }

        return res.send(err);
    }

}

const feeder = (request = {}) => {

    let array = [];

    if (Object.keys(request).length > 0) {

        if (request.query) {
            for (let keys in request.query)
                array.push(keys);
        }
        if (request.body) {
            for (let keys in request.body) {
                array.push(keys);
            }
        }
        if (request.params) {
            for (let keys in request.params)
                array.push(keys);
        }

        return array;
    }
    else {
        return null;
    }
}

const respCleaner = (respMsg = {}) => {

    if (Object.keys(respMsg).length > 0) {
        for (let keys in respMsg)
            delete respMsg[keys];

        return respMsg;
    }
    else
        return null;

}

const requestAuthenticator = async (request, key) => {
    try {
        token = request.headers.authorization;

        if (token) {
            receivedCredentials = jwt.verify(token, key);
            loggedUser = await Login.find({
                email: receivedCredentials.email
            });

            return loggedUser;
        }
        else
            return null;
    } catch (error) {

        console.log(`Error occured inside requestAuthenticator utils method\n${error}`);
        if (error instanceof jwt.TokenExpiredError)
            throw error;

        throw error;

    }
}

const getUserDetails = async (userId) => {
    try {
        loggedUser = await User.find({
            _id: userId
        });

        return loggedUser;
    } catch (error) {
        console.log(`An error occured inside the getUserDetails method\n${error}`);
    }
}

const updateLeaveNos = async (userId, from, to, type) => {
    try {
        const from_date = new Date(from);
        const to_date = new Date(to);
        const leave_days = ((to_date - from_date) / 86400000) === 0 ? 1 : (to_date - from_date) / 86400000;

        let status = false;

        switch (type) {
            case `paid_leave`:
                loggedUser = Leave_Type.find({
                    userId: userId
                });

                if (loggedUser && loggedUser.length === 1) {
                    loggedUser[0].paid_leave = 12 - leave_days;
                    loggedUser[0].paid_leave_used = leave_days;
                    await loggedUser[0].save();
                }
                else {
                    await new Leave_Type({
                        userId: userId,
                        paid_leave: (12 - leave_days),
                        paid_leave_used: leave_days
                    }).save();
                }
                status = true;
                break;

            case `sick_leave`:
                loggedUser = Leave_Type.find({
                    userId: userId
                });

                if (loggedUser && loggedUser.length === 1) {
                    loggedUser[0].sick_leave = 4 - leave_days;
                    loggedUser[0].sick_leave_used = leave_days;
                    loggedUser[0].save();
                }
                else {
                    await new Leave_Type({
                        userId: userId,
                        sick_leave: (4 - leave_days),
                        sick_leave_used: leave_days
                    }).save();
                }
                status = true;
                break;

            case `unpaid_leave`:
                loggedUser = Leave_Type.find({
                    userId: userId
                });

                if (loggedUser && loggedUser.length === 1) {
                    loggedUser[0].unpaid_leave_used = leave_days;
                    loggedUser[0].save();
                }
                else {
                    await new Leave_Type({
                        userId: userId,
                        unpaid_leave_used: leave_days
                    }).save();
                }
                status = true;
                break;
        }

        return status;
    } catch (error) {
        console.log(`Error occured inside updateLeaveNos method\n${error}`);
    }
}

const getUsers = async (request) => {
    try {

        loggedUser = await requestAuthenticator(request, process.env.SECRETKEY);
        leave = await getUserDetails(loggedUser[0].userId);

        if (!leave[0].role.includes(`CEO`)) {
            loggedUser = await User.find({
                reportTo: leave[0]._id
            });

            if (loggedUser.length > 0) {
                return loggedUser;
            }
            else {
                return null;
            }

        }
        else {
            loggedUser = await User.find();
            return loggedUser;
        }

    } catch (error) {
        console.log(`Error occured inside getUsers method\n${error}`);
    }
}

module.exports = { myLogger, feeder, respCleaner, requestAuthenticator, getUserDetails, updateLeaveNos, getUsers };