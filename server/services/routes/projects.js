const path = require('path');
const { Router } = require('express');
const { withAsync } = require('../middleware');
const { scanTable, getFile } = require('../aws');

const router = Router();

// get entire dynamoDB table
router.get(
    '/scanDynamoDB',
    withAsync(async (request, response) => {
        const results = await scanTable();
        response.json(results);
    })
);

// get file from s3
router.post(
    '/getFile',
    withAsync(async (request, response) => {
        const { qc, sample } = request.body;
        const key = path.join(
            qc ? 'methylscape/QCReports' : 'methylscape/ClassifierReports',
            qc || sample
        );

        const file = await getFile(key);
        file.Body.pipe(response);
    })
);

module.exports = router;

