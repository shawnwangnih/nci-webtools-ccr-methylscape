const express = require('express');
const compression = require('compression');
const sqlite = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { getSchema, query, getSamples, getAnnotations } = require('./query');
const { scanTable, getFile } = require('./aws');
const { logRequests, publicCacheControl, withAsync } = require('./middleware');
const { wrapper: r, getSurvivalData } = require('./R/r');
const { getCopyNumber } = require('./analysis/copyNumber/copyNumber');

const apiRouter = express.Router();

// parse json requests
apiRouter.use(express.json());

// compress all responses
apiRouter.use(compression());

// log requests
apiRouter.use(logRequests());

// add public cache-control headers to responses for GET requests
apiRouter.use(publicCacheControl(60 * 60));

// serve static results
apiRouter.use(
  '/results',
  express.static(config.results_folder, {
    setHeaders: (res, path, stat) => {
      res.set('Cache-Control', 'max-age=0, must-revalidate');
    },
  })
);

// healthcheck route
apiRouter.get('/ping', (request, response) => {
  response.json(true);
});

apiRouter.get(
  '/samples',
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const { embedding, organSystem } = request.query;
    const results = await getSamples(connection, { embedding, organSystem });
    response.json(results);
  })
);

apiRouter.get(
  '/annotations',
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const results = await getAnnotations(connection, request.query);
    response.json(results);
  })
);

// get entire dynamoDB table
apiRouter.get(
  '/scanDynamoDB',
  withAsync(async (request, response) => {
    const results = await scanTable();
    response.json(results);
  })
);

// get file from s3
apiRouter.post(
  '/getFile',
  withAsync(async (request, response) => {
    const { qc, sample } = request.body;
    const key = path.join(
      qc ? config.aws.S3QCReportsKey : config.aws.S3Key,
      qc || sample
    );

    const file = await getFile(key);
    file.Body.pipe(response);
  })
);

// get umap data
apiRouter.post(
  '/getCopyNumber',
  withAsync(async (request, response) => {
    const { id } = request.body;

    const data = await getCopyNumber(id);

    response.json(data);
  })
);

// call r wrapper
apiRouter.post(
  '/r',
  withAsync(async (request, response) => {
    const result = JSON.parse(await r(request.body));
    response.json(result);
  })
);

apiRouter.post(
  '/survival',
  withAsync(async (request, response) => {
    const results = await getSurvivalData(request.body);
    response.json(results);
  })
);

module.exports = { apiRouter };
