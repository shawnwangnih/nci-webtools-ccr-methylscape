function publicCacheControl(maxAge) {
  return (request, response, next) => {
    if (request.method === "GET")
      response.set("Cache-Control", `public, max-age=${maxAge}`);
    next();
  };
}

function logRequests(formatter = request => [request.path, request.query]) {
  return (request, response, next) => {
    const { logger } = request.app.locals;
    request.startTime = new Date().getTime();
    logger.info(formatter(request));
    next();
  }
}

function logErrors(error, request, response, next) {
  const { name, message } = error;
  request.app.locals.logger.error(error);

  // return less descriptive errors in production
  response.status(500).json(isProduction ? name : `${name}: ${message}`);
}

module.exports = {
  publicCacheControl,
  logErrors,
  logRequests,
};
