const { Router } = require('express');
const { withAsync } = require('../middleware');
const { requiresRouteAccessPolicy } = require('../auth/policyMiddleware');

const router = Router();

router.post(
    '/organizations',
    requiresRouteAccessPolicy('AccessApi'),
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const organization = request.body;
        const results = await connection('organization')
            .insert(organization)
            .returning('id')
        response.json(results);
    })
);

router.get(
    '/organizations',
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const results = await connection('organization').orderBy(['order', 'name']);
        response.json(results);
    })
);

router.get(
    '/organizations/:id',
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const { id } = request.params;
        const results = await connection('organization').where({ id });
        response.json(results);
    })
);

router.put(
    '/organizations/:id',
    requiresRouteAccessPolicy('AccessApi'),
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const { id } = request.params;
        const organization = { ...request.body, id, updatedAt: new Date() };
        const results = await connection('organization')
            .where({ id })
            .update(organization);
        response.json(results);
    })
)

router.delete(
    '/organizations/:id',
    requiresRouteAccessPolicy('AccessApi'),
    withAsync(async (request, response) => {
        const { connection } = request.app.locals;
        const { id } = request.params;
        const results = await connection('organization')
            .where({ id })
            .delete();
        response.json(results);
    })
)

module.exports = router;