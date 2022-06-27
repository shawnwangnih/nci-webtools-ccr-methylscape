const { Router } = require("express");
const { withAsync } = require("../middleware");
const { requiresRouteAccessPolicy } = require("../auth/policyMiddleware");
const { sendNotification } = require("../notifications");
const config = require("../../config");

const router = Router();

router.get(
  "/users",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const results = await userManager.getUsers();
    response.json(results);
  })
);

router.post(
  "/user",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const user = {
      ...request.body,
      name: request.body.email,
      roleId: null,
      status: "pending",
    };
    const results = await userManager.addUser(user);
    response.json(results);
  })
);

router.get(
  "/user/:id(\\d+)",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const { id } = request.params;
    const results = await userManager.getUser(id);
    response.json(results);
  })
);

router.put(
  "/user/:id(\\d+)",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const { id } = request.params;
    const user = { ...request.body, id, updatedAt: new Date() };
    const results = await userManager.updateUser(user);
    await sendNotification({
      userManager,
      from: config.email.from,
      to: results.email,
      subject: "Methylscape User Account Updated",
      templateName: "user-profile-update.html",
      params: {
        firstName: results.firstName,
        lastName: results.lastName,
        roleName: results.roleName,
        organizationName: [results.organizationName, results.organizationId === 1 && `(${results.organizationOther})`]
          .filter(Boolean)
          .join(" "),
        status: results.status,
      },
    });
    response.json(results);
  })
);

router.delete(
  "/user/:id(\\d+)",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const { id } = request.params;
    const results = await userManager.removeUser(id);
    response.json(results);
  })
);

router.post(
  "/user/register",
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const user = {
      ...request.body,
      name: request.body.email,
      roleId: null,
      status: "pending",
    };
    const results = await userManager.addUser(user);

    // send email to user
    await sendNotification({
      userManager,
      from: config.email.from,
      to: results.email,
      subject: "Methylscape User Account - Confirmation",
      templateName: "user-registration-confirmation.html",
      params: {
        firstName: results.firstName,
        lastName: results.lastName,
      },
    });

    // send emails to admins
    await sendNotification({
      userManager,
      from: config.email.from,
      roleName: "admin",
      subject: "Methylscape User Account - Review Required",
      templateName: "admin-user-registration-review.html",
      params: {
        userLastName: results.lastName,
        userFirstName: results.firstName,
        userEmail: results.email,
        organizationName: [results.organizationName, results.organizationId === 1 && `(${results.organizationOther})`]
          .filter(Boolean)
          .join(" "),
        baseUrl: config.server.baseUrl,
      },
    });

    response.json(results);
  })
);

router.post(
  "/user/approve",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const user = {
      id: request.body.id,
      roleId: request.body.roleId,
      status: "active",
      updatedAt: new Date(),
    };
    const results = await userManager.updateUser(user);
    await sendNotification({
      userManager,
      from: config.email.from,
      to: results.email,
      subject: "Methylscape Registration Approved",
      templateName: "user-registration-approval.html",
      params: {
        firstName: results.firstName,
        lastName: results.lastName,
        baseUrl: config.server.baseUrl,
      },
    });
    response.json(results);
  })
);

router.post(
  "/user/reject",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { userManager } = request.app.locals;
    const user = {
      id: request.body.id,
      notes: request.body.notes,
      status: "rejected",
      updatedAt: new Date(),
    };
    const results = await userManager.updateUser(user);
    await sendNotification({
      userManager,
      from: config.email.from,
      to: results.email,
      subject: "Methylscape Registration Rejected",
      templateName: "user-registration-rejection.html",
      params: {
        firstName: results.firstName,
        lastName: results.lastName,
        notes: results.notes,
      },
    });
    response.json(results);
  })
);

module.exports = router;
