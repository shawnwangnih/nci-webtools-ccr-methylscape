const { createOAuthStrategy, createPkceStrategy } = require("./passportStrategies");

function registerUserSerializers(passport, connection) {
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
}

async function registerAuthStrategies(passport, providers) {
    for (const provider of providers) {
        const strategy = provider.clientSecret
            ? await createOAuthStrategy(provider)
            : await createPkceStrategy(provider);
        passport.use(provider.name, strategy);
    }
  
    return passport;
}

module.exports = { registerUserSerializers, registerAuthStrategies };