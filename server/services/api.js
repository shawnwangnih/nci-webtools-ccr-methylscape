const path = require('path');
const express = require('express');
const compression = require('compression');
const passport = require('passport');
const { getSamples, getImportLogs, getCnvSegments, getCnvBins, getGenes } = require('./query');
const { scanTable, getFile } = require('./aws');
const { logRequests, publicCacheControl, withAsync } = require('./middleware');
const { wrapper: r, getSurvivalData } = require('./R/r');
const { getCopyNumber } = require('./analysis/copyNumber/copyNumber');
const { createImportRequest } = require('./database');
const config = require('../config');

const apiRouter = express.Router();

// parse json requests
apiRouter.use(express.json());

// compress all responses
apiRouter.use(compression());

// log requests
apiRouter.use(logRequests());

// add public cache-control headers to responses for GET requests
// apiRouter.use(publicCacheControl(60 * 60));

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
  '/login',
  passport.authenticate(config.auth[0].name, 
    { 
      successRedirect: '/', 
      failureRedirect: '/api/login' 
    }
  )
);

apiRouter.get(
  '/login/external',
  passport.authenticate(config.auth[1].name, 
    { 
      successRedirect: '/', 
      failureRedirect: '/api/login/external' 
    }
  )
);

apiRouter.get('/logout', (request, response) => {
  request.logout();
  response.redirect('/');
})

apiRouter.get('/session', (request, response) => {
  const { cookie, passport } = request.session;
  const { expires } = cookie;
  const user = (passport && passport.user)
    ? { email: passport.user.email, authenticated: true, permissions: [] }
    : { authenticated: false, permissions: [] };

  response.json({ expires, ...user });
});

apiRouter.get(
  '/admin/importLogs',
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const results = await getImportLogs(connection);
    response.json(results);
  })
);

apiRouter.post(
  '/admin/importData',
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const { sqsName } = config.aws;
    const { forceRecreate } = request.body;
    const results = await createImportRequest(connection, sqsName, { forceRecreate });
    response.json(results);
  })
);

apiRouter.post(
  '/users',
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const { firstName, lastName, email, organization } = request.body;
    if (!firstName || !lastName || !email || !organization) {
      throw new Error('Missing required fields');
    }
    const results = await userManager.addUser({ firstName, lastName, email, organization, name: email });
    response.json(results);
  })
);

apiRouter.get(
  '/users',
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const { id } = request.params;
    const results = await userManager.getAllUsers();
    response.json(results);
  })
);

apiRouter.get(
  '/users/:id',
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const { id } = request.params;
    const results = await userManager.getUser({id});
    response.json(results);
  })
);

apiRouter.put(
  '/users/:id',
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const { id } = request.params;
    const { firstName, lastName, email, organization, status, roleId} = request.body;
    if (!id || !firstName || !lastName || !email || !organization || !status || !roleId) {
      throw new Error('Missing required fields');
    }
    const results = await userManager.updateUser({ id, firstName, lastName, email, organization, name: email, status, roleId });
    response.json(results);
  })
)

apiRouter.delete(
  '/users/:id',
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const { id } = request.params;
    const results = await userManager.removeUser(id);
    response.json(results);
  })
)

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
  '/genes',
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const results = await getGenes(connection);
    response.json(results);
  })
);

apiRouter.get(
  '/cnv/segments',
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const { idatFilename } = request.query;
    const results = await getCnvSegments(connection, { idatFilename });
    response.json(results);
  })
);

apiRouter.get(
  '/cnv/bins',
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const { idatFilename } = request.query;
    const results = await getCnvBins(connection, { idatFilename });
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
      qc ? 'methylscape/QCReports' : 'methylscape/ClassifierReports',
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
    const data = await getCopyNumber(request);

    response.json(data);
  })
);

// call r wrapper (note: this is disabled for now because of injection issues)
// apiRouter.post(
//   '/r',
//   withAsync(async (request, response) => {
//     const result = JSON.parse(await r(request.body));
//     response.json(result);
//   })
// );

apiRouter.post(
  '/survival',
  withAsync(async (request, response) => {
    const results = await getSurvivalData(request.body);
    response.json(results);
  })
);

module.exports = { apiRouter };
