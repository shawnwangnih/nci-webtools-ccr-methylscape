var cors = require('cors');
const AWS = require('aws-sdk');
const path = require('path');
const { port, MethylScapeTable, MethylScapeBucket } = require('./config.json');
const { scanTable } = require('./utils/scanDynamoDB');
const express = require('express');
const app = express();


const portST = port || '0.0.0.0';

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

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
    try{
        const s3 = new AWS.S3();
        AWS.config.update({ region: 'us-east-1' });
        const data = req.body
        const params = {
            Bucket: MethylScapeBucket,
            Key: "ClassifierReports/" + data.sampleId + "/" + data.fileName
        };
        res.attachment(data.fileName);
        var fileStream = s3.getObject(params).createReadStream();
        fileStream.pipe(res);
    }catch (e){
        res.send(e)
    }
})



app.listen(portST, () => console.log(`Listening on port ${port}`));