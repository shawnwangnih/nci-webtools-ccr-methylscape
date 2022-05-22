const { createOAuthStrategy, createPkceStrategy } = require("./passportStrategies");

function registerUserSerializers(passport, userManager) {
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser(async ({email}, done) => done(null, await userManager.getUserByEmail(email)));
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