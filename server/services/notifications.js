const fsp = require('fs/promises');
const path = require('path');
const { createTransport } = require('nodemailer');
const { template, groupBy } = require('lodash');
const config = require('../config.json');

async function sendNotification({ userManager, from, to = [], cc = [], bcc = [], roleName = '', organizationName = '', subject, templateName, params, force = false }) {
    if (!to?.length && !cc?.length && !bcc?.length && !roleName && !organizationName) {
        throw new Error('Missing recipient');
    }

    if (!templateName) {
        throw new Error('Missing template');
    }

    to = asArray(to);
    cc = asArray(cc);
    bcc = asArray(bcc);

    if (roleName) {
        const users = await userManager.getUsersByRoleName(roleName);
        bcc = bcc.concat(users.map(user => user.email));
    }

    if (organizationName) {
        const users = await userManager.getUsersByOrganizationName(organizationName);
        bcc = bcc.concat(users.map(user => user.email));
    }

    if (!force) {
        // force overrides notification preferences (eg: for inactive users)
        to = await getValidNotificationEmails(to, userManager);
        cc = await getValidNotificationEmails(cc, userManager);
        bcc = await getValidNotificationEmails(bcc, userManager);
    }

    const html = renderTemplate(templateName, params);
    return await sendMail({ from, to, cc, bcc, subject, html });
}

async function renderTemplate(templateName, params, basePath = 'templates') {
    const templatePath = path.resolve(basePath, templateName);
    const templateSource = await fsp.readFile(templatePath, "utf-8");
    return template(templateSource)(params);
}

async function sendMail(params, smtp = config.email.smtp) {
    const transport = createTransport(smtp);
    return await transport.sendMail(params);
}

async function getValidNotificationEmails(emails, userManager) {
    const users = await userManager.getUsers();
    const userMap = groupBy(users, 'email');
    return emails.filter(email => {
        const [user] = userMap[email] || [];
        return user 
            && user.receiveNotification 
            && user.status !== 'inactive';
    });
}

function asArray(values = []) {
    return Array.isArray(values)
        ? values
        : [values];
}

module.exports = { sendNotification }
