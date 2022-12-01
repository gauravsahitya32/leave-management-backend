const User = require('../Models/User');
const bcrypt = require('bcrypt');

const globalUtils = require('../utils');

let respMsg = {
    message: ``
}

const addNewUser = async (request, response) => {

    try {

        const user = new User(request.body);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        const result = await user.save();
        console.log(`${request.body.name} has been inserted successfully\n${result}`);

        return response.status(201).json({
            message: `${request.body.name} has been inserted successfully`
        });

    } catch (error) {
        console.log(`Error occured inside addNewUser method\n${error}`);

        return response.status(500).json({
            message: `An error occured`
        });
    }
}

const getUserDetails = async (request, response) => {
    try {
        const name = request.query.name;

        const user = await User.find({
            name: {
                $regex: `(${name}.*)`,
                $options: `i`
            }
        }).select({
            empId: 1,
            email: 2,
            name: 3
        });

        if (user.length > 0) {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `Match Found`;
            respMsg.userDetails = user;

            return response.status(200).json(respMsg);
        }
        else {
            globalUtils.respCleaner(respMsg);
            respMsg.message = `No match found`;

            return response.status(404).json(respMsg);
        }

    } catch (error) {
        console.log(`Error occured inside getUserDetails\n${error}`);

        globalUtils.respCleaner(respMsg);
        respMsg.message = `An error occured`;

        return response.status(200).json(respMsg);
    }
}

module.exports = { addNewUser, getUserDetails };