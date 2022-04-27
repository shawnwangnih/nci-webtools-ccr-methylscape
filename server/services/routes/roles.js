const { Router } = require('express');
const { withAsync } = require('../middleware');

const router = Router();

router.post(
    '/roles',
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const role = request.body;
        const results = await connection('role')
            .insert(role)
            .returning('id')
        response.json(results);
    })
);

router.get(
    '/roles',
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const results = await connection('role');
        response.json(results);
    })
);

router.get(
    '/roles/:id',
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const { id } = request.params;
        const results = await connection('role').where({ id });
        response.json(results);
    })
);

router.put(
    '/roles/:id',
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const { id } = request.params;
        const role = { ...request.body, id };
        const results = await connection('role')
            .where({ id })
            .update(role);
        response.json(results);
    })
)

router.delete(
    '/roles/:id',
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const { id } = request.params;
        const results = await connection('role')
            .where({ id })
            .delete();
        response.json(results);
    })
)

module.exports = router;