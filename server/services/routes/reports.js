const path = require("path");
const { Router } = require("express");
const { withAsync } = require("../middleware");
const { requiresRouteAccessPolicy } = require("../auth/policyMiddleware");
const { scanTable, getFile } = require("../aws");

const router = Router();

// get entire dynamoDB table
router.get(
  "/scanDynamoDB",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const results = await scanTable();
    response.json(results);
  })
);

// get file from s3
router.post(
  "/getFile",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { qc, sample } = request.body;
    const key = path.join(qc ? "methylscape/QCReports" : "methylscape/ClassifierReports", qc || sample);

    const file = await getFile(key);
    file.Body.pipe(response);
  })
);

module.exports = router;
