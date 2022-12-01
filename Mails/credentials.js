const mail = require('nodemailer');
require('dotenv/config');

const transport = mail.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS
    }
});

module.exports = transport;