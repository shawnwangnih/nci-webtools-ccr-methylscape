var cors = require('cors');
const AWS = require('aws-sdk');
const path = require('path');
// const bodyParser  = require('body-parser');
const { port, MethylScapeTable, MethylScapeBucket } = require('./config.json');
const { scanTable } = require('./utils/scanDynamoDB');
const express = require('express');
const app = express();


const portST = port || '0.0.0.0';

app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join('client', 'build')));

app.get('/ping', (req, res) => res.send(true));

app.get('/scanMethylScapeTable', (req, res) => {
    try{
        scanTable(MethylScapeTable).then((data, error) => {
            if (error) {
              console.log('ERROR', error);
              res.send(error)
            }
            if (data) {
              console.log('DATA', data);
              res.send(data)
            }
          });
    }catch (e){
        res.send(e)
    }
});


app.post('/getMethylScapeFile', (req, res) => {
    console.log("REQ S3", req)
    const data = JSON.parse(req.body)
    console.log(data)
    const params = {
        Bucket: MethylScapeBucket,
        Key: "ClassifierReports/" + data.sampleId + "/" + data.fileName
      };
    var s3 = new AWS.S3();
    AWS.config.update({ region: 'us-east-1' });
    s3.getObject(params, (err, result) => {
        console.log("INSIDE S#",err, result)
        if (err === null) {
            res.attachment(data.fileName);
            console.log("++++", result)
            // const stream = fs.createReadStream(resolvePath('index.html'))

            // return res
        } else {
            res.status(500).send(err);
            return err
        }
    });
    res.send({"TEST":"TEST"})
})

app.listen(portST, () => console.log(`Listening on port ${port}`));