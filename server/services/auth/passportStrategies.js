const { Issuer, Strategy, generators } = require('openid-client');
const { codeVerifier, codeChallenge, nonce } = generators;

async function createPkceStrategy({ baseUrl, clientId, redirectUris, params }) {
  const { Client } = await Issuer.discover(baseUrl);

  const client = new Client({
    client_id: clientId,
    redirect_uris: redirectUris,
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  });

  params = {
    code_challenge: codeChallenge(codeVerifier()),
    code_challenge_method: 'S256',
    nonce: nonce(),
    ...params,
  };

  return new Strategy({ client, params }, (tokenSet, done) => {
    console.log('tokenSet', tokenSet);
    done(null, tokenSet.claims());
  });
}

async function createLoginGovStrategy() {
  return createPkceStrategy({
    baseUrl: process.env.LOGIN_GOV_AUTHORIZATION_BASE_URL,
    clientId: process.env.LOGIN_GOV_CLIENT_ID,
    redirectUris: [process.env.LOGIN_GOV_REDIRECT_URI],
    params: {
      scope: 'openid email',
      acr_values: process.env.LOGIN_GOV_ACR_VALUES,
    },
  });
}

module.exports = {
  createPkceStrategy,
  createLoginGovStrategy,
};
