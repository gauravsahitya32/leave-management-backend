const Leave = require('../Models/Leave');
const User = require('../Models/User');
const leaveMailService = require('../Mails/leaves');

const globalUtils = require('../utils');
const Login = require('../Models/Login');
const Leave_Type = require('../Models/LeaveType');
require('dotenv/config');

let respMsg = {
    message: ``
};

let loggedUser, leave;

//Helper Methods

const userIdGenerator = async (empIds) => {

    try {

        const user = await User.find({
            empId: empIds
        }).select({
            _id: 1
        });

        if (user.length > 0) {
            return user[0]._id;
        }
        else
            return null;

    } catch (error) {
        console.log(`Error occured inside userIdGenerator method\n${error}`);
    }

}

const getLeaveNumber = (from, to) => {
    const from_date = new Date(from);
    const to_date = new Date(to);

    const leave_days = (to_date - from_date) / 84600000;

    return (leave_days === 0 ? 1 : leave_days);
}

const getAllLeaveHistory = async (leavePayload = {}, reportUsers, request) => {
    const { date, operator } = leavePayload;
    let leaveHistories = [];

    if (reportUsers) {

        for (let i = 0; i < reportUsers.length; i++) {

            switch (operator) {

                case `gte`:
                    leave = await Leave.find({
                        userId: reportUsers[i]._id,
                        leave_from: {
                            $gte: date
                        }
                    });
                    break;

                case `lte`:
                    leave = await Leave.find({
                        userId: reportUsers[i]._id,
                        leave_from: {
                            $lte: date
                        }
                    });
                    leaveHistories.push(leave);
                    break;

                case `between`:
                    leave = await Leave.find({
                        userId: reportUsers[i]._id,
                        leave_from: {
                            $gte: date.split(`,`)[0],
                            $lte: date.split(`,`)[1]
                        }
                    });
                    break;

                case `eq`:
                    leave = await Leave.find({
                        userId: reportUsers[i]._id,
                        leave_from: date
                    });
                    break;
            }

            if (leave.length > 0)
                leaveHistories.push(leave);

        }

        return leaveHistories;
    }
    else {
        return await getOwnLeaveHistory(request, operator);
    }
}

const getOwnLeaveHistory = async (request, operator) => {

    loggedUser = await globalUtils.requestAuthenticator(request, process.env.SECRETKEY);

    console.log(operator);
    
    switch (operator) {

        case `gte`:
            leave = await Leave.find({
                userId: loggedUser[0].userId,
                leave_from: {
                    $gte: date
                }
            });
            break;

        case `lte`:
            leave = await Leave.find({
                userId: loggedUser[0].userId,
                leave_from: {
                    $lte: date
                }
            });
            break;

        case `between`:
            leave = await Leave.find({
                userId: loggedUser[0].userId,
                leave_from: {
                    $gte: date.split(`,`)[0],
                    $lte: date.split(`,`)[1]
                }
            });
            break;

        case `eq`:
            leave = await Leave.find({
                userId: loggedUser[0].userId,
                leave_from: date
            });
            break;
    }

    return leave;

}

//Callback Methods (Protected)

const isLeaveAvailable = async (request, response) => {
    try {

        const leave_type = request.body.type;
        const leave_from = request.body.from;
        const leave_to = request.body.to;

        const leave_days = getLeaveNumber(leave_from, leave_to);
        const current_date = Date.now();

        loggedUser = await globalUtils.requestAuthenticator(request, process.env.SECRETKEY);
        leave = await Leave_Type.find({
            userId: loggedUser[0].userId
        });

        if (leave[0][leave_type] >= Math.round(leave_days)) {

            if ((current_date - leave_days) <= 3) {
                globalUtils.respCleaner(respMsg);
                respMsg.message = `Available`;

                return response.status(200).json(respMsg);
            }
            else {
                globalUtils.respCleaner(respMsg);
                respMsg.message = `keka policy violated`;

                return response.status(200).json(respMsg);
            }
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Not Available`;

            return response.status(200).json(respMsg);
        }

    } catch (error) {
        console.log(`Error occured inside isLeaveAvailable endpoint method\n${error}`);

        globalUtils.respCleaner(respMsg);
        respMsg.message = `An error occured`;

        return response.status(503).json(respMsg);
    }
}

const createNewLeave = async (request, response) => {
    try {

        const from = request.body.from;
        const to = request.body.to;
        const reason = request.body.reason;
        const approvers = request.body.approvers;
        const type = request.body.type;
        const approversList = approvers.split(",");

        loggedUser = await globalUtils.requestAuthenticator(request, process.env.SECRETKEY);

        leave = new Leave({
            userId: loggedUser[0].userId,
            leave_from: new Date(from),
            leave_to: new Date(to),
            reason: reason,
            approvers: approvers,
            leave_type: type
        });
        const newLeave = await leave.save();
        //Retrieving the name of user, who has requested the leave.
        loggedUser = await User.find({
            email: loggedUser[0].email
        });

        // //Retrieving the name of user, to whom email has to be sent.
        leave = await User.find({
            empId: {
                $in: approversList
            }
        });

        leave.forEach(async (element, index) => {
            await leaveMailService.sendLeaveCreationMail(`gaurav.sahitya@digimantra.com`, loggedUser[0].name, reason, from, to, newLeave._id, await userIdGenerator(approversList[index])).then((messageId) => {
                console.log(messageId);
            });
        })

        globalUtils.respCleaner(respMsg);
        respMsg.message = `Leave created`;

        return response.status(201).json(respMsg);

    } catch (error) {
        console.log(`Error occured inside createNewLeave method\n${error}`);

        globalUtils.respCleaner(respMsg);
        respMsg.message = `An error occured`;

        return response.status(500).json(respMsg);
    }
}

const getLeaveHistory = async (request, response) => {
    try {

        const payload = {
            date: request.query.date,
            operator: request.query.operator,
            reqType: request.query.type
        }

        let leaveHistory;
        if (payload.reqType === `admin`) {
            const users = await globalUtils.getUsers(request);

            leaveHistory = await getAllLeaveHistory(payload, users, request);

            if (leaveHistory.length > 0 && users.length > 0) {
                globalUtils.respCleaner(respMsg);
                respMsg.message = `Match Found`;
                respMsg.historyType = `All`;
                respMsg.history = leaveHistory;

                return response.status(200).json(respMsg);
            }
            else if (leaveHistory.length > 0) {
                globalUtils.respCleaner(respMsg);
                respMsg.message = `Match Found`;
                respMsg.historyType = `Single`;
                respMsg.history = leaveHistory;

                return response.status(200).json(respMsg);
            }
            else {
                globalUtils.respCleaner(respMsg);
                respMsg.message = `No leave history found`;

                return response.status(404).json(respMsg);
            }
        }
        else {
            leaveHistory = await getOwnLeaveHistory(request);

            if (leaveHistory.length > 0) {
                globalUtils.respCleaner(respMsg);
                respMsg.message = `Match Found`;
                respMsg.history = leaveHistory;

                return response.status(200).json(respMsg);
            }
            else {
                globalUtils.respCleaner(respMsg);
                respMsg.message = `No leave found`;

                return response.status(404).json(respMsg);
            }
        }

    } catch (error) {
        console.log(`Error occured inside getLeaveHistory endpoint method\n${error}`);

        globalUtils.respCleaner(respMsg);
        respMsg.message = `An error occured`;

        return response.status(500).json(respMsg);
    }
}

const deleteLeave = async (request, response) => {

    try {
        const leaveId = request.body.id;
        const userId = request.body.userId;

        leave = await Leave.deleteOne({
            $and: [{
                _id: leaveId
            }, {
                userId: userId
            }]
        });

        if (leave.deletedCount === 1) {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `${request.body.id} deleted`;

            return response.status(200).json(respMsg);
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `${leaveId} not found`;

            return response.status(404).json(respMsg);
        }
    } catch (error) {
        console.log(`Error occured inside deleteLeave endpoint method\n${error}`);

        globalUtils.respCleaner(respMsg);
        respMsg.message = `An error occured`;

        return response.status(500).json(respMsg);
    }

}

const getReportedUsers = async (request, response) => {
    loggedUser = await globalUtils.getUsers(request);

    if (loggedUser.length > 0) {
        globalUtils.respCleaner(respMsg);
        respMsg.message = `Users Found`;
        respMsg.users = loggedUser;

        return response.status(200).json(respMsg);
    }
    else {
        globalUtils.respCleaner(respMsg);
        respMsg.message = `Nobody reports to you`;

        return response.status(404).json(respMsg);
    }
}

//Un-protected Callbacks

const approveLeave = async (request, response) => {

    try {
        const leaveId = request.query.id;
        const userId = request.query.userId;

        leave = await Leave.find({
            _id: leaveId
        });

        if (leave.length > 0) {
            loggedUser = await User.find({
                _id: userId
            }).select({
                empId: 1
            });
            const approvers = leave[0].approvers.split(',');

            console.log(approvers.length);

            if (leave[0].approvedBy === `none`) {
                leave[0].approvedBy = loggedUser[0].empId + ",";
                leave[0].status = `partially approved`;
            }
            else if (leave[0].approvedBy.split(",").length === approvers.length) {

                if (await globalUtils.updateLeaveNos(leave[0].userId, leave[0].leave_from, leave[0].leave_to, leave[0].leave_type)) {
                    leave[0].approvedBy += loggedUser[0].empId;
                    leave[0].status = `Approved`;


                    loggedUser = await globalUtils.getUserDetails(leave[0].userId);
                    if (loggedUser && loggedUser.length) {
                        const msgBody = `Hi ${loggedUser[0].name}, your leave request has been approved. Your leaves are from ${leave[0].leave_from} to ${leave[0].leave_to} and your leave reason is as follows:<br/>${leave[0].reason}`;

                        await leaveMailService.sendLeaveApprovedMail(`gaurav.sahitya@digimantra.com`, msgBody, `LEAVE ACCEPTED`);
                    }
                }
                else {
                    globalUtils.respCleaner(respMsg);
                    respMsg.message = `Unable to approve this leave now!`;

                    return response.status(500).json(respMsg);
                }

            }
            else {
                leave[0].approvedBy += loggedUser[0].empId + ",";
                leave[0].status = `partially approved`;
            }

            await leave[0].save();

            globalUtils.respCleaner(respMsg);
            respMsg.message = `Leave approved`;

            return response.status(200).json(respMsg);
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Invalid leave id`;

            return response.status(401).json(respMsg);
        }

    } catch (error) {

        console.log(`Error occured inside the approveLeave endpoint's callback\n${error}`);

        globalUtils.respCleaner(respMsg);
        respMsg.message = `An error occured`;

        return response.status(500).json(respMsg);

    }
}

const rejectLeave = async (request, response) => {

    try {
        const leaveId = request.query.id;
        const userId = request.query.userId;

        leave = await Leave.find({
            _id: leaveId
        });

        if (leave.length > 0) {
            loggedUser = await User.find({
                _id: userId
            }).select({
                empId: 1
            });
            const approvers = leave[0].approvers.split(',');

            if (leave[0].rejectedBy === `none`) {
                leave[0].rejectedBy = loggedUser[0].empId + ",";

                loggedUser = await globalUtils.getUserDetails(leave[0].userId);
                if (loggedUser && loggedUser.length) {
                    const msgBody = `Hi ${loggedUser[0].name}, your leave request has been rejected. Your leaves are from ${leave[0].leave_from} to ${leave[0].leave_to} and your leave reason is as follows:<br/>${leave[0].reason}`;

                    await leaveMailService.sendLeaveApprovedMail(`gaurav.sahitya@digimantra.com`, msgBody, `LEAVE REJECTED`);
                }
            }
            else if (leave[0].approvedBy.split(",").length === approvers.length) {
                leave[0].approvedBy += loggedUser[0].empId;
            }
            else {
                leave[0].approvedBy += loggedUser[0].empId + ",";
            }

            leave[0].status = `Rejected`;
            await leave[0].save();

            globalUtils.respCleaner(respMsg);
            respMsg.message = `Leave rejected`;

            return response.status(200).json(respMsg);
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Invalid leave id`;

            return response.status(401).json(respMsg);
        }

    } catch (error) {

        console.log(`Error occured inside the approveLeave endpoint's callback\n${error}`);

        globalUtils.respCleaner(respMsg);
        respMsg.message = `An error occured`;

        return response.status(500).json(respMsg);

    }

}


module.exports = { createNewLeave, approveLeave, isLeaveAvailable, rejectLeave, getLeaveHistory, deleteLeave, getReportedUsers };