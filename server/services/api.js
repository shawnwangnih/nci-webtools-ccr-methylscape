const express = require("express");
const compression = require("compression");
const sqlite = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const config = require("../config");
const { getSchema, query } = require("./query");
const { scanTable, getFile } = require("./aws");
const { logRequests, publicCacheControl, withAsync } = require("./middleware");

const apiRouter = express.Router();
const database = new sqlite(config.database);
const schema = getSchema(database);

// parse json requests
apiRouter.use(express.json());

// compress all responses
apiRouter.use(compression());

// log requests
apiRouter.use(logRequests());

// add public cache-control headers to responses for GET requests
apiRouter.use(publicCacheControl(60 * 60));

// healthcheck route
apiRouter.get("/ping", (request, response) => {
  response.json(1 === database.prepare("select 1").pluck().get());
});

// retrieves schema for all tables
apiRouter.get("/schema", (request, response) => {
  response.json(schema);
});

// handle query submission
apiRouter.get("/query", (request, response) => {
  const { logger } = request.app.locals;
  const results = query(database, request.query);
  response.json(results);
  logger.info({
    count: results.records.length,
    time: new Date().getTime() - request.startTime,
  });
});

// get entire dynamoDB table
apiRouter.get("/scanDynamoDB", withAsync(async (request, response) => {
  const results = await scanTable();
  response.json(results);
}));

// get file from s3
apiRouter.post("/getFile", withAsync(async (request, response) => {
  const { qc, sample } = request.body;
  const key = path.join(
    qc ? config.aws.S3QCReportsKey : config.aws.S3Key,
    qc || sample,
  );

  const file = await getFile(key);
  file.Body.pipe(response);
}));

module.exports = { apiRouter };
