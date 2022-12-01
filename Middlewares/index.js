const { TokenExpiredError } = require('jsonwebtoken');
const globalUtils = require('../utils');
require('dotenv/config');

let loggedUser;

let respMsg = {
    message: ``
};

const isValidRequest = async (request, response, next) => {
    try {
        loggedUser = await globalUtils.requestAuthenticator(request, process.env.SECRETKEY);

        if (loggedUser) {
            next();
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Token missing`;

            return response.status(400).json(respMsg);
        }
    } catch (error) {

        globalUtils.respCleaner(respMsg);

        if (error instanceof TokenExpiredError) {
            respMsg.message = `Token expired`;
            return response.status(401).json(respMsg);
        }
        else {
            respMsg.message = `An error occured`;
            return response.status(500).json(respMsg);
        }
    }
}

module.exports = { isValidRequest };