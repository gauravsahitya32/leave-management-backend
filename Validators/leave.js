const joi = require('joi');
const globalUtils = require('../utils');

const rules = {
    date: new RegExp(/(^[0-9]{1,2})(\/)([0-9]{1,2})(\/)([0-9]{4})$/),
    reason: new RegExp(/(.){10,}/),
    type: new RegExp(/(paid_leave|sick_leave|unpaid_leave)/),
    id: new RegExp(/(^[a-z0-9]+$)/),
    operator: new RegExp(/(gte|lte|between|eq)/),
    dateQuery: new RegExp(/(^[0-9,\/]+$)/),
    reqType: new RegExp(/(admin|user)/)
}

let data = {}, schema = {};
let respMsg = {
    message: ``
};

//Payload Checkers

const leavePayloadChecker = (payload = {}) => {

    const defKeys = ['from', 'to', 'reason', 'approvers', 'type'];
    let found = false;

    if (Object.keys(payload).length > 0) {
        for (let keys in payload.body)
            if (!defKeys.includes(keys))
                found = true;

        if (found)
            return false;
        else
            return true;
    }
    else
        return false;

}

const approveLeavePayloadChecker = (payload = {}) => {
    const defKeys = ['id', 'userid'];
    let found = false;

    if (Object.keys(payload).length > 0) {
        for (let keys in payload.query)
            if (!defKeys.includes(keys))
                found = true;

        if (found)
            return false;
        else
            return true;
    }
    else
        return false;
}

const getLeaveHistoryPayloadChecker = (payload = {}) => {
    const defKeys = ['date', 'operator', 'type'];
    let found = false;

    if (Object.keys(payload).length > 0) {
        for (let keys in payload.query)
            if (!defKeys.includes(keys))
                found = true;

        if (found)
            return false;
        else
            return true;
    }
    else
        return false;
}

const deleteLeavePayloadChecker = (payload = {}) => {
    const defKeys = ['id', 'userId'];
    let found = false;

    if (Object.keys(payload).length > 0) {
        for (let keys in payload.body)
            if (!defKeys.includes(keys))
                found = true;

        if (found)
            return false;
        else
            return true;
    }
    else
        return false;
}

//Validators

const isValidApproveReq = (request, response, next) => {
    if (approveLeavePayloadChecker(request)) {
        data = {
            id: request.query?.id,
            userId: request.query?.userId
        }

        schema = joi.object({
            userId: joi.string().regex(rules.id).required(),
            id: joi.string().regex(rules.id).required()
        });

        const result = schema.validate(data);

        if (!result.error) {
            next();
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Invalid data format`;
            respMsg.error = result.error;

            return response.status(400).json(respMsg);
        }
    }
    else {
        globalUtils.respCleaner(respMsg);
        respMsg.message = `Invalid payload`

        return response.status(400).json(respMsg);
    }
}

const isValidLeaveRequest = (request, response, next) => {
    if (leavePayloadChecker(request)) {
        data = {
            from: request.body?.from,
            to: request.body?.to,
            reason: request.body?.reason,
            approvers: request.body?.approvers,
            leave_type: request.body?.type
        }

        schema = joi.object({
            from: joi.string().regex(rules.date).required(),
            to: joi.string().regex(rules.date).required(),
            reason: joi.string().regex(rules.reason).required(),
            approvers: joi.string().regex(rules.reason).required(),
            leave_type: joi.string().regex(rules.type).required()
        });

        const result = schema.validate(data);

        if (!result.error) {
            next();
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Invalid data format`;
            respMsg.error = result.error;

            return response.status(400).json(respMsg);
        }
    }
    else {
        globalUtils.respCleaner(respMsg);
        respMsg.message = `Invalid payload`

        return response.status(400).json(respMsg);
    }
}

const isValidAvailabilityReq = (request, response, next) => {
    if (leavePayloadChecker(request)) {
        data = {
            from: request.body?.from,
            to: request.body?.to,
            leave_type: request.body?.type
        }

        schema = joi.object({
            from: joi.string().regex(rules.date).required(),
            to: joi.string().regex(rules.date).required(),
            leave_type: joi.string().regex(rules.type).required()
        });

        const result = schema.validate(data);

        if (!result.error) {
            next();
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Invalid data format`;
            respMsg.error = result.error;

            return response.status(400).json(respMsg);
        }
    }
    else {
        globalUtils.respCleaner(respMsg);
        respMsg.message = `Invalid payload`

        return response.status(400).json(respMsg);
    }
}

const isValidHistoryRequest = (request, response, next) => {
    if (getLeaveHistoryPayloadChecker(request)) {
        data = {
            date: request.query?.date,
            operator: request.query?.operator,
            type: request.query.type
        }

        schema = joi.object({
            date: joi.string().regex(rules.dateQuery).required(),
            operator: joi.string().regex(rules.operator).required(),
            type: joi.string().regex(rules.reqType).required()
        });

        let result = schema.validate(data);

        if (!result.error) {

            if (data.operator === `between` && data.date.split(`,`).length > 1) {
                next();
            }
            else if (data.operator !== `between`) {
                data = {
                    date: request.query.date
                }

                schema = joi.object({
                    date: joi.string().regex(rules.date).required()
                });

                result = schema.validate(data);
                if (!result.error) {
                    next();
                }
                else {
                    globalUtils.respCleaner(respMsg);
                    respMsg.message = `End date missing`;

                    return response.status(400).json(respMsg);
                }
            }
            else {
                globalUtils.respCleaner(respMsg);
                respMsg.message = `End date missing`;

                return response.status(400).json(respMsg);
            }

        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Invalid data format`;
            respMsg.error = result.error;

            return response.status(400).json(respMsg);
        }
    }
    else {
        globalUtils.respCleaner(respMsg);
        respMsg.message = `Invalid payload`

        return response.status(400).json(respMsg);
    }
}

const isValidDeleteRequest = (request, response, next) => {
    if (deleteLeavePayloadChecker(request)) {
        data = {
            id: request.body.id,
            userId: request.body.userId
        }

        schema = joi.object({
            id: joi.string().regex(rules.id).required(),
            userId: joi.string().regex(rules.id).optional()
        });

        const result = schema.validate(data);

        if (!result.error) {
            next();
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Invalid data format`;
            respMsg.error = result.error;

            return response.status(400).json(respMsg);
        }
    }
    else {
        globalUtils.respCleaner(respMsg);
        respMsg.message = `Invalid payload`

        return response.status(400).json(respMsg);
    }
}

module.exports = { isValidLeaveRequest, isValidAvailabilityReq, isValidApproveReq, isValidHistoryRequest, isValidDeleteRequest };