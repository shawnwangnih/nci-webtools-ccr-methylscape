const fsp = require('fs/promises');
const path = require('path');
const { createTransport } = require('nodemailer');
const { template } = require('lodash');
const config = require('../config.json');

async function sendNotification({ userManager, from, to = [], cc = [], bcc = [], roleName = '', organizationName = '', subject, templateName, params }) {
    if (!to?.length && !cc?.length && !bcc?.length && !roleName && !organizationName) {
        throw new Error('Missing recipient');
    }

    if (!templateName) {
        throw new Error('Missing template');
    }

    if (roleName) {
        const users = await userManager.getUsersByRoleName(roleName);
        bcc = [...bcc, ...users.map(user => user.email)];
    }

    if (organizationName) {
        const users = await userManager.getUsersByOrganizationName(organizationName);
        bcc = [...bcc, ...users.map(user => user.email)];
    }

    to = await getValidNotificationEmails(to, userManager);
    cc = await getValidNotificationEmails(cc, userManager);
    bcc = await getValidNotificationEmails(bcc, userManager);

    const templateSource = await fsp.readFile(path.resolve("templates", templateName), "utf-8");
    const html = template(templateSource)(params);
    return await createTransport(config.email.smtp)
        .sendMail({ from, to, cc, bcc, subject, html });
}

async function getValidNotificationEmails(emails, userManager) {
    if (!Array.isArray(emails)) {
        emails = [emails];
    }
    const users = await userManager.getUsers();
    return emails.filter(email => 
        users.find(user => 
            user.email === email 
            // && user.status !== 'inactive' 
            && user.receiveNotification
        )
    );
}

module.exports = { sendNotification }
