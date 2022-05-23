const { Router, request } = require('express');
const passport = require('passport');
const config = require('../../config.json');

const router = Router();

router.get(
    '/login',
    (request, response, next) => {
        const destination = request.query.destination || '/';
        passport.authenticate(config.auth[0].name, { 
            failureRedirect: '/api/login',
            state: destination
        })(request, response, next);
    },
    (request, response) => {
        const destination = request.query.state || '/';
        response.redirect(destination);
    }
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
    request.logout(() => response.redirect('/'));
})

router.get('/session', (request, response) => {
    const { cookie, passport } = request.session;
    const { expires } = cookie;
    const user = (passport && passport.user)
        ? { authenticated: true, user: request.user }
        : { authenticated: false };

    response.json({ expires, ...user });
});

module.exports = router;