const express = require("express");
const knex = require("knex");
const passport = require("passport");
const { registerUserSerializers, registerAuthStrategies } = require("./services/auth/passportUtils");
const { createSession } = require("./services/session");
const getLogger = require("./services/logger");
const { apiRouter } = require("./services/api");
const { forkCluster } = require("./services/cluster");
const { logErrors } = require("./services/middleware");
const UserManager = require("./services/auth/userManager");
const { loadAwsCredentials } = require("./services/aws");
const args = require("minimist")(process.argv.slice(2));
const config = require("./config.json");
const isProduction = process.env.NODE_ENV === "production" || args.production;

// fork to multiple processes
// note: this should not be enabled until session state is stored in the database
// if (forkCluster()) return;

if (require.main === module) {
  createApp(config).then((app) => {
    const { port } = config.server;
    app.listen(port, () => app.locals.logger.info(`Application is running on port: ${port}`));
  });
}

async function createApp(config) {
  // create app and register locals/middlware
  const app = express();
  const connection = knex({
    client: "pg",
    connection: config.database,
  });

  app.locals.config = config;
  app.locals.logger = getLogger("methylscape-analysis");
  app.locals.connection = connection;
  app.locals.userManager = new UserManager(connection);

  loadAwsCredentials(config.aws);
  registerUserSerializers(passport, app.locals.userManager);
  await registerAuthStrategies(passport, config.auth);

  app.use(createSession({ maxAge: config.server.maxSessionAge }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/api", apiRouter);
  app.use(logErrors); // logErrors should always be last

  return app;
}

module.exports = createApp;
