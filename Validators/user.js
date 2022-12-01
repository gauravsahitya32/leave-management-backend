const joi = require('joi');
const { feeder, respCleaner } = require('../utils');

const rules = {
    password: new RegExp(`(^[A-Z]+[a-zA-Z0-9]+)([@|$|_]+[0-9]+)([a-zA-Z0-9@$_]+$)`),
    name: new RegExp(/(^[A-Z]{1})([a-z]+)(\s)([A-Z]{1})([a-z]+$)/),
    queryName: new RegExp(/(^[a-zA-Z0-9\s]+$)/),
    email: new RegExp(`(^[a-zA-Z0-9._-]+)(@)(gmail.com|digimantra.com|outlook.com)$`),
    empId: new RegExp(/(^DML[0-9]+$)/),
    role: new RegExp(/(^.*Team\sLead.*$|.*Hr Manager|.*Hr Head|^Sr\..*Developer$|^.* Developer$|^.*Intern$|^.*CEO$|^.*Founder$)/),
    reportTo: new RegExp(/(^[a-zA-Z0-9\s,]+$)/)
};
let data = {}, schema = {};
let result;

let respMsg = {
    message: ``
}

// Helper Methods

const addNewUserPayloadChecker = (payload = []) => {
    if (payload.length > 0) {
        const defPayload = [`name`, `email`, `password`, `role`, `empId`, 'reportTo'];
        let found = false;

        payload.forEach((element) => {
            if (!defPayload.includes(element))
                found = true;
        });

        if (found)
            return false;
        else
            return true;
    }
    else
        return false;
}

const getUserDetailsPayloadChecker = (payload = {}) => {
    const defKeys = ['name'];
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

const addNewUserSchema = (request, response, next) => {

    if (feeder(request).length > 0) {

        let receivedPayload = feeder(request);

        if (addNewUserPayloadChecker(receivedPayload)) {

            data = {
                name: request.body?.name,
                email: request.body?.email,
                password: request.body?.password,
                role: request.body.role,
                reportTo: request.body.reportTo,
                empId: request.body.empId
            }

            schema = joi.object({
                name: joi.string().regex(rules.name).required(),
                email: joi.string().regex(rules.email).required(),
                password: joi.string().regex(rules.password).required(),
                empId: joi.string().regex(rules.empId).required(),
                role: joi.string().regex(rules.role).required(),
                reportTo: joi.string().regex(rules.reportTo).optional()
            });

            result = schema.validate(data);

            if (result.error) {
                return response.status(400).json(result.error);
            }
            else
                next();
        }
        else {
            return response.status(400).json({
                message: `Invalid payload`
            });
        }

    }
    else {
        return response.status(400).json({
            message: `No payload received`
        })
    }

}

const getUserDetailsSchema = (request, response, next) => {
    if (getUserDetailsPayloadChecker(request)) {
        data = {
            name: request.query?.name
        }

        schema = joi.object({
            name: joi.string().regex(rules.queryName).required()
        });

        result = schema.validate(data);

        if (result.error) {
            respCleaner(respMsg);
            respMsg.message = `Validation Error`;
            respMsg.error = result.error;

            return response.status(400).json(respMsg);
        }
        else
            next();
    }
    else {
        respCleaner(respMsg);
        respMsg.message = `Invalid Payload`;

        return response.status(401).json(respMsg);
    }
}
module.exports = { addNewUserSchema, getUserDetailsSchema };