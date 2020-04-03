var cors = require('cors');
const AWS = require('aws-sdk');
const path = require('path');
const logger = require('./utils/loggerUtil').logger;
const { port, dynamoDBTableName, S3BucketName, S3SamplesKey, S3QCReportsKey } = require('./config.json');
const { scanTable } = require('./utils/scanDynamoDB');
const express = require('express');
const app = express();


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

app.use(express.static(path.join('client', 'build')));

app.get('/ping', (req, res) => res.send(true));

app.get('/scanMethylScapeTable', (req, res) => {
    logger.log('info', 'Request scan on dynamoDB table: %s', dynamoDBTableName)
    try{
        scanTable(dynamoDBTableName).then((data, error) => {
            if (error) {
                logger.error('error', '1 - DynamoDB scan fail: %s', error)
                res.send(error)
            }
            if (data) {
                logger.log('info', 'Sample table size %s', data.length)
                res.send(data)
            }
          });
    }catch (e){
        logger.error('error', '2 - DynamoDB scan fail: %s', e)
        res.send(e)
    }
});

app.post('/getMethylScapeFile', (req, res) => {
    logger.log('info', 'Request file download data: %j', req.body)
    try{
        const s3 = new AWS.S3();
        AWS.config.update({ region: 'us-east-1' });
        const data = req.body
        const key = path.join(S3SamplesKey, data.sampleId, data.fileName)
        const params = {
            Bucket: S3BucketName,
            Key: key
        };
        logger.log('info', 'Request file download params: %j', params)
        s3.headObject(params, function (err, metadata) {  
            if (err && err.code === 'NotFound') {  
              // Handle no object on cloud here  
              res.status(404).send('File not found');
            } else {  
                var fileStream = s3.getObject(params).createReadStream().on('error', e => {
                    logger.log('error', 'Request file download failed: %s', e)
                    res.send(e);
                });;
                res.attachment(data.fileName);
                fileStream.pipe(res);
            }
          });
        
    }catch (e){
        logger.log('error', 'File download failed: %s', e)
        res.send(e)
    }
})

app.post('/getMethylScapeQCIFile', (req, res) => {
    logger.log('info', 'Request file download data: %j', req.body)
    try{
        const s3 = new AWS.S3();
        AWS.config.update({ region: 'us-east-1' });
        const data = req.body
        const key = path.join(S3SamplesKey, 'X085_xml_report.txt')
        const params = {
            Bucket: S3BucketName,
            Key: key
        };
        logger.log('info', 'Request file download params: %j', params)
        s3.headObject(params, function (err, metadata) {  
            if (err && err.code === 'NotFound') {  
              // Handle no object on cloud here  
              res.status(404).send('File not found');
            } else {  
                var fileStream = s3.getObject(params).createReadStream().on('error', e => {
                    logger.log('error', 'Request file download failed: %s', e)
                    res.send(e);
                });;
                res.attachment(data.fileName);
                fileStream.pipe(res);
            }
          });
        
    }catch (e){
        logger.log('error', 'File download failed: %s', e)
        res.send(e)
    }
})

app.post('/getMethylScapeQCFile', (req, res) => {
    logger.log('info', 'Request file download data: %j', req.body)
    try{
        const s3 = new AWS.S3();
        AWS.config.update({ region: 'us-east-1' });
        const data = req.body
        const key = path.join(S3QCReportsKey, data.experiment, data.fileName)
        const params = {
            Bucket: S3BucketName,
            Key: key
        };
        logger.log('info', 'Request file download params: %j', params)
        /*res.status(404).send('File not found');
        return;*/
        s3.headObject(params, function (err, metadata) {  
            if (err && err.code === 'NotFound') {  
              // Handle no object on cloud here  
              res.status(404).send('File not found');
            } else {  
                var fileStream = s3.getObject(params).createReadStream().on('error', e => {
                    logger.log('error', 'Request file download failed: %s', e)
                    res.send(e);
                });;
                res.attachment(data.fileName);
                fileStream.pipe(res);
            }
          });
    }catch (e){
        logger.log('error', 'File download failed: %s', e)
        res.send(e)
    }
})


const appPort = process.env.PORT || port;

app.listen(appPort, () => {
    logger.log('info', 'Application running on port: %s',appPort)
    console.log(`Listening on port ${appPort}`)
});