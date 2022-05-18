const { Router } = require("express");
const { withAsync } = require("../middleware");
const { getSamples, getGenes, getCnvBins, getCnvSegments } = require("../query");
const { getSurvivalData } = require("../R/r");

const router = Router();

router.get(
  "/samples",
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const { embedding, organSystem } = request.query;
    const results = await getSamples(connection, { embedding, organSystem });
    response.json(results);
  })
);

router.get(
  "/genes",
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const results = await getGenes(connection);
    response.json(results);
  })
);

router.get(
  "/cnv/segments",
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const { idatFilename } = request.query;
    const results = await getCnvSegments(connection, { idatFilename });
    response.json(results);
  })
);

router.get(
  "/cnv/bins",
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const { idatFilename } = request.query;
    const results = await getCnvBins(connection, { idatFilename });
    response.json(results);
  })
);

router.post(
  "/survival",
  withAsync(async (request, response) => {
    const results = await getSurvivalData(request.body);
    response.json(results);
  })
);

module.exports = router;
