const isProduction = process.env.NODE_ENV === 'production';

function publicCacheControl(maxAge) {
  return (request, response, next) => {
    if (request.method === 'GET')
      response.set('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
}

function logRequests(
  formatter = (request) => [request.path, { ...request.query, ...request.body }]
) {
  return (request, response, next) => {
    const { logger } = request.app.locals;
    request.startTime = new Date().getTime();
    logger.info(formatter(request));
    next();
  };
}

function logErrors(error, request, response, next) {
  const { name, message } = error;
  request.app.locals.logger.error(error.stack ? error.stack : error);

  // return less descriptive errors in production
  // response.status(500).json(isProduction ? name : `${name}: ${message}`);
  response.status(500).json(`${name}: ${message}`);
}

function withAsync(fn) {
  return async (request, response, next) => {
    try {
      return await fn(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  publicCacheControl,
  logErrors,
  logRequests,
  withAsync,
};
