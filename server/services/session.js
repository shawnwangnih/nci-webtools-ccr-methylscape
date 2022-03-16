const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const { randomBytes } = require('crypto');

function createSession({ sessionSecret, maxAge } = {}) {
  sessionSecret = sessionSecret || randomBytes(16).toString("hex");
  maxAge = maxAge || 60 * 60 * 24;

  return session({
    cookie: {
      maxAge,
    },
    store: new MemoryStore({
      checkPeriod: maxAge,
    }),
    resave: false,
    secret: sessionSecret,
    saveUninitialized: true,
  })
}

module.exports = { createSession }