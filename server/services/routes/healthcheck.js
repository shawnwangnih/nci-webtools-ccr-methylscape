const { Router } = require('express');
const { withAsync } = require('../middleware');

const router = Router();
// healthcheck route
router.get('/ping', withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    await connection.raw('SELECT 1');
    response.json(true);
}));

module.exports = router;