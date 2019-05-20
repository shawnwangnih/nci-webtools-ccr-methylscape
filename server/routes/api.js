const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser')
const router = express.Router();
const createIndexFile = require('../scripts/createIndexFile')

router.use(cors());
router.use(bodyParser.json())

router.get('/ping', (req, res) => res.json(true));

router.get('/methylScapeIndexFile', (req, res) =>{
  createIndexFile.getIndexFile().then(data => res.json(data))
})

router.post('/project/experiments', (req, res) => {
  console.log(req.body)
  var temp_data =[]
  for(var i = 0; i < 100; i++){
    temp_data.push( { key: i, experiment: "67645322256" + i, investigator: "Zaki Abdullah", sample_size: 8, experimental_worksheet: 'link', experiment_details: 'link'})
  }
  setTimeout(function() { res.json(temp_data); }, 1000);
  // res.json(temp_data)
})

router.post('/project/summary', (req, res) => {
  console.log(req.body)
  var temp_data =[]
  setTimeout(function() { res.json(temp_data); }, 5000);
  // res.json(temp_data)
})

module.exports = router;
