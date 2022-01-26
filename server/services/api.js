const express = require('express');
const compression = require('compression');
const sqlite = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { getSchema, query } = require('./query');
const { scanTable, getFile, getKey } = require('./aws');
const { logRequests, publicCacheControl, withAsync } = require('./middleware');
const { wrapper: r } = require('./R/r');
const Papa = require('papaparse');

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
apiRouter.get('/ping', (request, response) => {
  response.json(1 === database.prepare('select 1').pluck().get());
});

// retrieves schema for all tables
apiRouter.get('/schema', (request, response) => {
  response.json(schema);
});

// handle query submission
apiRouter.get('/query', (request, response) => {
  const { logger } = request.app.locals;
  const results = query(database, request.query);
  response.json(results);
  logger.info({
    count: results.records.length,
    time: new Date().getTime() - request.startTime,
  });
});

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
    async function parseTSV(stream) {
      return new Promise((resolve, reject) => {
        let data = [];
        const options = { header: true };
        const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, options);
        stream.pipe(parseStream);
        parseStream.on('error', (e) => {
          reject(e);
        });
        parseStream.on('data', (d) => {
          data.push(d);
        });
        parseStream.on('end', () => {
          resolve(data);
        });
      });
    }

    const { id } = request.body;

    const binFind = await getKey('methylscapeShiny/Bins/BAF.bins_ ' + id);
    const binKey = binFind.Contents[0].Key;

    const segFind = await getKey(
      'methylscapeShiny/Segments/BAF.segments_ ' + id
    );
    const segKey = segFind.Contents[0].Key;

    const binFile = await getFile(binKey);
    const segFile = await getFile(segKey);

    const bin = await parseTSV(binFile.Body);
    const seg = await parseTSV(segFile.Body);

    response.json({ bin, seg });
  })
);

// call r wrapper
apiRouter.post(
  '/r',
  withAsync(async (request, response) => {
    const results = r(request.body.args);
    response.json(results);
  })
);

module.exports = { apiRouter };
