const fs = require('fs');
require('dotenv/config');

const credetials = require('./credentials');

let htmlCode = '';

const sendLeaveCreationMail = async (to, name, reason, leave_from, leave_to, id, userId) => {
    try {

        htmlCode = fs.readFileSync('Templates/index.html').toString();
        htmlCode = htmlCode.replace(`{name}`, name);
        htmlCode = htmlCode.replace(`{from}`, leave_from);
        htmlCode = htmlCode.replace(`{to}`, leave_to);
        htmlCode = htmlCode.replace(`{reason}`, reason);
        htmlCode = htmlCode.replace(`{approve-url}`, `http://localhost:8000/leave/approve?id=${id}&userId=${userId}`);
        htmlCode = htmlCode.replace(`{reject-url}`, `http://localhost:8000/leave/reject?id=${id}&userId=${userId}`);

        const mailStatus = await credetials.sendMail({
            from: `Leave Management indium9874@gmail.com`,
            to: to,
            subject: `Leave Request`,
            text: `${name} has requested leave from ${leave_from} to ${leave_to}.\nReason : ${reason}`,
            html: htmlCode
        });

        if (mailStatus.messageId)
            return mailStatus.messageId;
        else
            return null;

    } catch (error) {
        console.log(`Error occured inside sendLeaveCreationMail method\n${error}`);
    }
}

const sendLeaveApprovedMail = async (to, msgBody, status) => {
    try {

        htmlCode = fs.readFileSync('Templates/status.html').toString();
        htmlCode = htmlCode.replace(`{leave-status}`, status);
        htmlCode = htmlCode.replace(`{leave-body}`, msgBody);

        const mailStatus = await credetials.sendMail({
            from: `Leave Management indium9874@gmail.com`,
            to: to,
            subject: `Leave Request`,
            text: `${msgBody}`,
            html: htmlCode
        });

        if (mailStatus.messageId)
            return mailStatus.messageId;
        else
            return null;

    } catch (error) {
        console.log(`Error occured inside sendLeaveCreationMail method\n${error}`);
    }
}

module.exports = { sendLeaveCreationMail, sendLeaveApprovedMail };