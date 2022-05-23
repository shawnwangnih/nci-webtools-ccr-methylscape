const express = require('express');
const compression = require('compression');
const { logRequests } = require('./middleware');
const adminRouter = require('./routes/admin');
const analysisRouter = require('./routes/analysis');
const healthcheckRouter = require('./routes/healthcheck');
const organizationsRouter = require('./routes/organizations');
const reportsRouter = require('./routes/reports');
const sessionRouter = require('./routes/session');
const usersRouter = require('./routes/users');
const rolesRouter = require('./routes/roles');
const notificationsRouter = require('./routes/notifications');

const apiRouter = express.Router();

// parse json requests
apiRouter.use(express.json());

// compress all responses
apiRouter.use(compression());

// log requests
apiRouter.use(logRequests());

// register routes
apiRouter.use('/admin', adminRouter);
apiRouter.use('/analysis', analysisRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use(healthcheckRouter);
apiRouter.use(organizationsRouter);
apiRouter.use(usersRouter);
apiRouter.use(rolesRouter);
apiRouter.use(sessionRouter);
apiRouter.use(notificationsRouter);

module.exports = { apiRouter };
