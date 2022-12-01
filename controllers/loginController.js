const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv/config');

const Login = require('../Models/Login');
const User = require('../Models/User');

const globalUtils = require('../utils');


let respMsg = {
    message: ``
}

let accessToken, refreshToken;
let loggedUser, result;

const loginTheUser = async (request, response) => {

    try {

        const email = request.body.email;
        const password = request.body.password;

        result = await User.find({
            email: email
        }).select({
            password: 1
        });

        if (result.length > 0) {
            const hashedPassword = await bcrypt.compare(password, result[0].password);

            if (hashedPassword) {

                result = await User.find({
                    email: email,
                    password: result[0].password
                }).select({
                    _id: 1
                });

                loggedUser = await Login.find({
                    email: email
                }).select({
                    email: 1
                });

                if (loggedUser && loggedUser.length === 0) {
                    loggedUser = new Login({
                        email: email,
                        loggedIn: true,
                        userId: result[0]._id
                    });
                    await loggedUser.save();
                }
                else {
                    loggedUser[0].loggedIn = true;
                    loggedUser[0].updatedAt = new Date();
                    await loggedUser[0].save();
                }

                accessToken = jwt.sign({
                    email: email,
                    userId: result[0]._id
                }, process.env.SECRETKEY, {
                    expiresIn: `1h`
                });
                refreshToken = jwt.sign({
                    email: email,
                    userId: result[0]._id
                }, process.env.REFSECKEY, {
                    expiresIn: `1d`
                });

                respMsg.message = `Login Successfull`;
                respMsg.email = email;
                respMsg.accessToken = accessToken;
                respMsg.refreshToken = refreshToken;

                return response.status(200).json(respMsg);

            }
            else {
                globalUtils.respCleaner(respMsg);
                respMsg.message = `Login failed, invalid credentials`;
                return response.status(401).json(respMsg);
            }
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `User does not exits`;
            return response.status(404).json(respMsg);
        }

    } catch (error) {

        globalUtils.respCleaner(respMsg);

        console.log(`Error occured inside the loginTheUser method\n${error}`);

        respMsg.message = `An error occured`;
        return response.status(500).json(respMsg);

    }

}

const logoutTheUser = async (request, response) => {
    try {

        loggedUser = await globalUtils.requestAuthenticator(request, process.env.SECRETKEY);

        if (loggedUser) {
            console.log(loggedUser);
            loggedUser[0].loggedIn = false;
            loggedUser[0].updatedAt = new Date();
            await loggedUser[0].save();

            globalUtils.respCleaner(respMsg);
            respMsg.message = `Logout successfull`;
            return response.status(200).json(respMsg);
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Token missing`;
            return response.status(503).json(respMsg);
        }


    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            respMsg.message = `Token expired`;
            return response.status(403).json(respMsg);
        }
        else {
            respMsg.message = `An error occured`;
            return response.status(500).json(respMsg);
        }
    }
}

const refreshAccessToken = async (request, response) => {
    try {

        loggedUser = await globalUtils.requestAuthenticator(request, process.env.REFSECKEY);

        if (loggedUser) {

            accessToken = jwt.sign({
                email: loggedUser[0].email
            }, process.env.SECRETKEY, {
                expiresIn: `1h`
            });

            globalUtils.respCleaner(respMsg);
            respMsg.message = `Token created`;
            respMsg.accessToken = accessToken;

            return response.status(200).json(respMsg);
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Token missing`;

            return response.status(503).json(respMsg);
        }

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Token expired`;

            return response.status(401).json(respMsg);
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Invalid token`;

            return response.status(500).json(respMsg);
        }
    }
}

module.exports = { loginTheUser, logoutTheUser, refreshAccessToken };