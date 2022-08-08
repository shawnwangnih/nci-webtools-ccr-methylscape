const { createOAuthStrategy, createPkceStrategy } = require("./passportStrategies");

function getAccountType({ preferred_username }) {
  const loginDomain = (preferred_username || "").split("@").pop();
  return loginDomain.endsWith("login.gov") ? "Login.gov" : "NIH";
}

function registerUserSerializers(passport, userManager) {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser(async ({ email, preferred_username }, done) => {
    const accountType = getAccountType({ preferred_username });
    const user = await userManager.getUserForLogin(email, accountType);
    done(null, user || {});
  });
}

async function registerAuthStrategies(passport, providers) {
  for (const provider of providers) {
    const strategy = provider.clientSecret ? await createOAuthStrategy(provider) : await createPkceStrategy(provider);
    passport.use(provider.name, strategy);
  }

  return passport;
}

module.exports = { registerUserSerializers, registerAuthStrategies };
