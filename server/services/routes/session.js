const { Router } = require('express');
const passport = require('passport');
const config = require('../../config.json');

const router = Router();

router.get(
    '/login',
    passport.authenticate(config.auth[0].name,
        {
            successRedirect: '/',
            failureRedirect: '/api/login'
        }
    )
);

router.get(
    '/login/external',
    passport.authenticate(config.auth[1].name,
        {
            successRedirect: '/',
            failureRedirect: '/api/login/external'
        }
    )
);

router.get('/logout', (request, response) => {
    request.logout();
    response.redirect('/');
})

router.get('/session', (request, response) => {
    const { cookie, passport } = request.session;
    const { expires } = cookie;
    const user = (passport && passport.user)
        ? { email: passport.user.email, authenticated: true, permissions: [] }
        : { authenticated: false, permissions: [] };

    response.json({ expires, ...user });
});

module.exports = router;