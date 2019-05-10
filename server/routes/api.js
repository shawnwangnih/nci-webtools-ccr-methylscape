const cors = require('cors');
const express = require('express');
const router = express.Router();
const createIndexFile = require('../scripts/createIndexFile')

router.use(cors());
router.get('/ping', (req, res) => res.json(true));

router.get('/methylScapeIndexFile', (req, res) =>{
  createIndexFile.getIndexFile().then(data => res.json(data))
})

module.exports = router;
