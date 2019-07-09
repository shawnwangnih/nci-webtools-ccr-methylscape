const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser')
const router = express.Router();
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

router.use(cors());
router.use(bodyParser.json())

router.get('/ping', (req, res) => res.json(true));

router.get('/methylScapeIndexData', (req, res) =>{
  var documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
  const params = { TableName: "MethylscapeSamples-prod" }
  let scanResults = [];
  documentClient.scan(params, onScan)
  function onScan(err, data){
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Scan succeeded.");
        data.Items.forEach(function(itemdata) {
          console.log("Item :", JSON.stringify(itemdata));
          scanResults.push(itemdata)
        });
        // data.Items.forEach((itemdata) => scanResults.push(itemdata));
        // continue scanning if we have more items
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }
    }
  }
  console.log("Scanning for more...");
  // res.json(scanResults)
})

// router.get('/methylScapeIndexFile', (req, res) =>{
//   createIndexFile.getIndexFile().then(data => res.json(data))
// })

// router.get('/getMethylScapeUpdateIndexFile', (req, res) =>{
//   createIndexFile.getIndexFile().then(data => res.json(data))
// })

// router.post('/project/experiments', (req, res) => {
//   console.log(req.body)
//   var temp_data =[]
//   for(var i = 0; i < 100; i++){
//     temp_data.push( { key: i, experiment: "67645322256" + i, investigator: "Zaki Abdullah", sample_size: 8, experimental_worksheet: 'link', experiment_details: 'link'})
//   }
//   setTimeout(function() { res.json(temp_data); }, 1000);
//   // res.json(temp_data)
// })

// router.post('/project/summary', (req, res) => {
//   console.log(req.body)
//   var temp_data =[]
//   setTimeout(function() { res.json(temp_data); }, 1000);
//   // res.json(temp_data)
// })

// router.post('/project/samples', (req, res) => {
//   console.log(req.body)
//   var temp_data =[]
//   for(var i = 0; i < 100; i++){
//     temp_data.push( { key: i, experiment: "67645322256" + i, investigator: "Zaki Abdullah", sample_size: 8, experimental_worksheet: 'link', experiment_details: 'link'})
//   }
//   setTimeout(function() { res.json(temp_data); }, 1000);
//   // res.json(temp_data)
// })

module.exports = router;
