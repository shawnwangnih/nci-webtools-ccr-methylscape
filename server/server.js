var cors = require('cors');
const AWS = require('aws-sdk');
const path = require('path');
const logger = require('./utils/loggerUtil').logger;
const { port, dynamoDBTableName, S3BucketName, S3SamplesKey, S3QCReportsKey } = require('./config.json');
const { scanTable } = require('./utils/scanDynamoDB');
const express = require('express');
const app = express();
const fs = require('fs');


function htmlDecode(input){
    while(input.indexOf('&lt;') != -1){
        input = input.substring(0, input.indexOf('&lt;')) + '<' + input.substring(input.indexOf('&lt;') + 4);
    }
    while(input.indexOf('&gt;') != -1){
        input = input.substring(0, input.indexOf('&gt;')) + '>' + input.substring(input.indexOf('&gt;') + 4);
    }
    return input
  }

function createHTML(filename){

    var text = fs.readFileSync(filename, 'utf-8');
    //var text = data;
    var significantArray = [];
    var uncertainArray = [];
    var toCheckTable = ["gene","position","transcriptchange,transcript","transcriptchange,change","proteinchange,change"]
    while(text.indexOf('<variant>') != -1){

        var nextVariant = text.substring(text.indexOf('<variant>'), text.indexOf('</variant>') + 10);
        let significance = nextVariant.substring(nextVariant.indexOf("<assessment>") + 12, nextVariant.indexOf("</assessment>"))
        if(significance == "Uncertain Significance"){
            uncertainArray.push(nextVariant);
        }
        else{
            significantArray.push(nextVariant)
        }
        text = text.substring(0, text.indexOf('<variant>')) + text.substring(text.indexOf('</variant>') + 10)
        
    }
    var htmlText="<!DOCTYPE html>\n<html>\n<head>\n<style>\ntable {\nfont-family: arial, sans-serif;\nborder-collapse: collapse;\nwidth: 100%;\n}td, th {\nborder: 1px solid #dddddd;\ntext-align: left;\npadding: 8px;\n}\n</style>\n</head>\n<body>\n<h2>1- VARIANTS OF CLINICAL OR PATHOGENIC SIGNIFICANCE</h2>\n"
    htmlText += "<table>\n<tr>\n<th>Gene</th>\n<th>Genomic Location</th>\n<th>Transcript</th>\n<th>Nucleotide Change</th>\n<th>Amino Acid Change</th>\n<th>VAF*(%)</th>\n<th>Pathogenicity Assessment</th>\n<th>Tier**</th>\n</tr>\n"
    for(let i = 0; i < significantArray.length; i++){
        var next = significantArray[i];
        htmlText += "<tr>\n<th>"
        htmlText += next.substring(next.indexOf("<gene>") + 6, next.indexOf("</gene>"));
        htmlText += "</th>\n<th>"
        htmlText += next.substring(next.indexOf("<chromosome>") + 12, next.indexOf("</chromosome>")) + ":" + next.substring(next.indexOf("<position>") + 10, next.indexOf("</position>"));
        htmlText += "</th>\n<th>"
        var transcriptText = next.substring(next.indexOf("<transcriptchange>") + 18, next.indexOf("</transcriptchange>"));
        htmlText += transcriptText.substring(transcriptText.indexOf("<transcript>") + 12, transcriptText.indexOf("</transcript>"));
        htmlText += "</th>\n<th>"
        htmlText += transcriptText.substring(transcriptText.indexOf("<change>") + 8, transcriptText.indexOf("</change>"));
        htmlText += "</th>\n<th>"
        var proteinText = next.substring(next.indexOf("<proteinchange>") + 15, next.indexOf("</proteinchange>"));
        htmlText += proteinText.substring(proteinText.indexOf("<change>") + 8, proteinText.indexOf("</change>"));
        htmlText += "</th>\n<th>"
        htmlText += next.substring(next.indexOf("<allelefraction>") + 16, next.indexOf("</allelefraction>")) + "% (of " + next.substring(next.indexOf("<readdepth>") + 11, next.indexOf("</readdepth>")) + " reads)";
        htmlText += "</th>\n<th>\n";
        htmlText +=  next.substring(next.indexOf("<assessment>") + 12, next.indexOf("</assessment>"));
        htmlText += "</th>\n<th>\n";
        htmlText +=  "Tier " + next.substring(next.indexOf("<actionability>") + 15, next.indexOf("</actionability>"));
        htmlText += "</th>\n</tr>\n"
    }   
    htmlText += "</table>"
    htmlText += "<h2>2-VARIANTS OF UNCERTAIN CLINICAL SIGNIFICANCE</h2>"
    htmlText += "<table>\n<tr>\n<th>Gene</th>\n<th>Genomic Location</th>\n<th>Transcript</th>\n<th>Nucleotide Change</th>\n<th>Amino Acid Change</th>\n<th>VAF*(%)</th>\n"
    for(let i = 0; i < uncertainArray.length; i++){
        var next = uncertainArray[i];
        htmlText += "<tr>\n<th>"
        htmlText += next.substring(next.indexOf("<gene>") + 6, next.indexOf("</gene>"));
        htmlText += "</th>\n<th>"
        htmlText += next.substring(next.indexOf("<chromosome>") + 12, next.indexOf("</chromosome>")) + ":" + next.substring(next.indexOf("<position>") + 10, next.indexOf("</position>"));
        htmlText += "</th>\n<th>"
        var transcriptText = next.substring(next.indexOf("<transcriptchange>") + 18, next.indexOf("</transcriptchange>"));
        htmlText += transcriptText.substring(transcriptText.indexOf("<transcript>") + 12, transcriptText.indexOf("</transcript>"));
        htmlText += "</th>\n<th>"
        htmlText += transcriptText.substring(transcriptText.indexOf("<change>") + 8, transcriptText.indexOf("</change>"));
        htmlText += "</th>\n<th>"
        var proteinText = next.substring(next.indexOf("<proteinchange>") + 15, next.indexOf("</proteinchange>"));
        htmlText += proteinText.substring(proteinText.indexOf("<change>") + 8, proteinText.indexOf("</change>"));
        htmlText += "</th>\n<th>"
        htmlText += next.substring(next.indexOf("<allelefraction>") + 16, next.indexOf("</allelefraction>")) + "% (of " + next.substring(next.indexOf("<readdepth>") + 11, next.indexOf("</readdepth>")) + " reads)";
        htmlText += "</th>\n</tr>\n";
    }   
    htmlText += "</table>"
    htmlText += "<h2>3- VARIANT INTERPRETATION</h2>"
    if(significantArray.length == 1){
        htmlText += "<p style = \"font-size:24px; background-color:lightgrey; padding-top:7px; padding-bottom: 5px;\"><b>Result: </b>" + 1 + " relevant variant was detected in this study.<p>"
    }
    else{
        htmlText += "<p style = \"font-size:24px; background-color:lightgrey; padding-top:7px; padding-bottom: 5px;\"><b>Result: </b>" + significantArray.length + " relevant variants were detected in this study.<p>"
    }
    //look for significants with the same tiers
    var findTiers = {};
    for(let i = 0; i < significantArray.length; i++){
        let next = significantArray[i];
        let tier = next.substring(next.indexOf("<actionability>") + 15, next.indexOf("</actionability>"));
        if(tier in findTiers){
            findTiers[tier].push(i);
        }
        else{
            findTiers[tier] = [i]
        }
    }
    //console.log(JSON.stringify(findTiers))

    for(let tier of Object.keys(findTiers)){
        htmlText += "<h3 style = \"background-color:lightgrey; padding-top:7px; padding-bottom: 5px;\">Tier " + tier + "</h3>"
        for(let i of findTiers[tier]){
            var next = significantArray[i];
            var rcomment = next.substring(next.indexOf("<rcomment>") + 15, next.indexOf("</rcomment>"));
            htmlText += "<ul><li><b>" + rcomment.substring(rcomment.indexOf("<name>") + 6, rcomment.indexOf("</name>")) + "</b></li></ul>";
            htmlText += "<div style = \"padding-left:40px\">" + htmlDecode(rcomment.substring(rcomment.indexOf("<text>") + 6, rcomment.indexOf("</text>"))) + "</div>";

        }   
}
    htmlText +="\n</body>\n</html>"

    fs.writeFileSync( path.join(__dirname + '/test.html'), htmlText);

    /*
    for(let i = 0; i < listToFilter.length; i++){
        var tag = listToFilter[i];
        var startIndex = text.indexOf("<" + tag + ">")
        var endIndex = text.indexOf("</" + tag + ">")
        text = text.substring(0,startIndex + tag.length + 2) + text.substring(endIndex);
    }
    fs.writeFileSync(directory + '/' + file, text);
    console.log(file)
*/
}


app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

app.use(express.static(path.join('client', 'build')));

app.get('/ping', (req, res) => res.send(true));

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));

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
    console.log(req.body);
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

// app.get('/getMethylScapeQCIFile', (req, res) => {
//     logger.log('info', 'Request file download data: %j', req.query)
//     //console.log(req.body)
//     try{
//         const s3 = new AWS.S3();
//         AWS.config.update({ region: 'us-east-1' });
//         const data = req.query
//         const key = path.join(S3SamplesKey, data.sampleId)

//         const paramsList = {
//             Bucket: S3BucketName,
//             Delimiter: '',
//             Prefix:key,
//         }
//         s3.listObjects(paramsList, function(err, data){
//             if (err) {
//                 logger.error('error', '1 - DynamoDB scan fail: %s', error)
//                 res.send(error)
//             }
//             if(data){
//                 var fileName = ""
//                 for(var i = 0; i < data.Contents.length; i++){
//                     if(data.Contents[i].Key.endsWith("xml_report.txt")){
//                         fileName = data.Contents[i].Key
//                     }
//                 }
//                 if(fileName == ""){
//                     res.status(404).send('File not found');
//                 }
//                 else{
//                 const params = {
//                     Bucket: S3BucketName,
//                     Key: fileName
//                 };
//                 console.log(fileName);
//                 s3.headObject(params, function (err, metadata) {  
//                     if (err && err.code === 'NotFound') {  
//                     // Handle no object on cloud here  
//                     res.status(404).send('File not found');
//                     } else {  
//                         s3.getObject(params, (err, data) =>{
//                             if (err){
//                                 logger.log('error', 'Request file download failed: %s', err)
//                                 res.send(err)
//                             }
//                             fs.writeFileSync('test.txt', data.Body.toString());
//                             createHTML('test.txt');
//                             var fileStream = fs.createReadStream('test.html')
//                             res.sendFile(path.join(__dirname + '/test.html'));
                            
//                             fileStream.pipe(res);
//                         })
//                         //console.log(data.fileName)
//                         //fs.writeFileSync('~/test.txt', JSON.stringify(data))
                        
                        
//                     }
//                 });
//             }
//         }
//         })
        
//     }catch (e){
//         logger.log('error', 'File download failed: %s', e)
//         res.send(e)
//     }
// })

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