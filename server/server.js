const express = require('express');
const knex = require('knex');
const passport = require("passport");
const { registerUserSerializers, registerAuthStrategies } = require("./services/auth/passportUtils");
const { createSession } = require("./services/session");
const getLogger = require('./services/logger');
const { apiRouter } = require('./services/api');
const { forkCluster } = require('./services/cluster');
const config = require('./config.json');
const { logErrors } = require('./services/middleware');
const UserManager = require('./services/auth/userManager');
const RoleManager = require('./services/auth/roleManager');
const args = require('minimist')(process.argv.slice(2));
const isProduction = process.env.NODE_ENV === 'production' || args.production;

// fork to multiple processes
if (forkCluster()) return;

// create app and register locals/middlware
const app = express();
const connection = knex({
  client: "pg",
  connection: config.database
});

registerUserSerializers(passport, connection);
registerAuthStrategies(passport, config.auth);

app.locals.logger = getLogger('methylscape-analysis');
app.locals.connection = connection;
app.locals.userManager = new UserManager(connection);
app.locals.roleManager = new RoleManager(connection);

app.use(createSession());
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', apiRouter);
app.use(logErrors); // logErrors should always be last

// serve static assets during local development
if (!isProduction) app.use(express.static(config.server.client));

app.listen(config.server.port, () => {
  app.locals.logger.info(
    `Application is running on port: ${config.server.port}`
  );
});

module.exports = app;
