const fsp = require('fs/promises');
const path = require('path');
const { Router } = require('express');
const { createTransport } = require('nodemailer');
const { template } = require('lodash');
const { withAsync } = require('../middleware');
const { requiresRouteAccessPolicy } = require('../auth/policyMiddleware');
const config = require('../../config.json');

const router = Router();

router.post(
    "/notifications",
    requiresRouteAccessPolicy('AccessApi'),
    withAsync(async (request, response) => {
    const { from, smtp } = config.email;
    const { to, subject, templateName, params } = request.body;
      const templateSource = await fsp.readFile(
        path.resolve("templates", templateName),
        "utf-8",
      );
      const html = template(templateSource)(params);
      await createTransport(smtp).sendMail({from, to, subject, html });
      response.json(true);
    }),
);
 

module.exports = router;