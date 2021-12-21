const express = require("express");
const helmet = require("helmet");
const getLogger = require("./services/logger");
const { apiRouter } = require("./services/api");
const { forkCluster } = require("./services/cluster");
const config = require("./config.json");
const { logErrors } = require("./services/middleware");
const args = require("minimist")(process.argv.slice(2));
const isProduction = process.env.NODE_ENV === "production" || args.production;

// fork to multiple processes
if (forkCluster()) return;

// create app and register locals/middlware
const app = express();
app.locals.logger = getLogger("methylscape-analysis");
app.use(helmet());
app.use("/api", apiRouter);
app.use(logErrors); // logErrors should always be last

// serve static assets during local development
if (!isProduction) app.use(express.static(config.server.client));

app.listen(config.server.port, () => {
  app.locals.logger.info(
    `Application is running on port: ${config.server.port}`,
  );
});

module.exports = app;
