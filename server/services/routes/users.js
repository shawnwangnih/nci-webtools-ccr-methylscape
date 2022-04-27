const { Router } = require('express');
const { withAsync } = require('../middleware');

const router = Router();

router.post(
    '/users',
    withAsync(async (request, response) => {
        const { userManager } = request.app.locals;
        const user = {
            ...request.body,
            name: request.body.email,
            roleId: null,
            status: 'pending'
        }
        const results = await userManager.addUser(user);
        response.json(results);
    })
);

router.get(
    '/users',
    withAsync(async (request, response) => {
        const { userManager } = request.app.locals;
        const results = await userManager.getUsers();
        response.json(results);
    })
);

router.get(
    '/users/:id',
    withAsync(async (request, response) => {
        const { userManager } = request.app.locals;
        const { id } = request.params;
        const results = await userManager.getUser(id);
        response.json(results);
    })
);

router.put(
    '/users/:id',
    withAsync(async (request, response) => {
        const { userManager } = request.app.locals;
        const { id } = request.params;
        const user = {...request.body, id};
        const results = await userManager.updateUser(user);
        response.json(results);
    })
)

router.delete(
    '/users/:id',
    withAsync(async (request, response) => {
        const { userManager } = request.app.locals;
        const { id } = request.params;
        const results = await userManager.removeUser(id);
        response.json(results);
    })
)

module.exports = router;