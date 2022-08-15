const { Router, request } = require("express");
const passport = require("passport");
const config = require("../../config.json");

const router = Router();

router.get(
  "/login",
  (request, response, next) => {
    const destination = request.query.destination || "/";
    passport.authenticate(config.auth[0].name, {
      failureRedirect: "/api/login",
      state: destination,
    })(request, response, next);
  },
  (request, response) => {
    request.session.expires = request.session.cookie.expires;
    const destination = request.query.state || "/";
    response.redirect(destination);
  }
);

router.get("/logout", (request, response) => {
  request.logout(() => response.redirect("/"));
});

router.get("/session", (request, response) => {
  const { expires, passport } = request.session;
  const user = passport && passport.user ? { authenticated: true, user: request.user } : { authenticated: false };
  response.json({ expires, ...user });
});

router.post("/session", (request, response) => {
  if (request.session?.passport?.user) {
    request.session.touch();
    request.session.expires = request.session.cookie.expires;
    response.json(true);
  } else {
    response.json(false);
  }
});

module.exports = router;
