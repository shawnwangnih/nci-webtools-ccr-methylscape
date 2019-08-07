const AWS = require('aws-sdk');

exports.getS3File = async params => {
    console.log("PARAMS", params)
    var s3 = new AWS.S3();
    AWS.config.update({ region: 'us-east-1' });
    s3.getObject(params, function(err, res) {
        console.log("INSIDE S#",err, res)
        if (err === null) {
            return res
        } else {
            // res.status(500).send(err);
            return err
        }
    });
};
