const AWS = require('aws-sdk');
var s3tree = require('s3-tree');


var generator = s3tree({bucket: 'cbiit-tools-data'});


generator.generate('/methylscape/')
.then(function (tree) {
  console.log(JSON.stringify(tree, null, 2));
});


// const fs = require('fs');
// const path = require('path');


// var s3 = new AWS.S3();

// var params = {
//   Bucket    : 'cbiit-tools-data',
//   Prefix    : 'methylscape/result-bbbb',
//   Delimiter : '/'
// };

// var s3DataContents = [];    // Single array of all combined S3 data.Contents

// function s3ReadMetaFiles() {
//   console.log("*******************************************");
//   console.log(JSON.stringify(s3DataContents, null, "    "));
  
// }

// function s3ListObjects(params, cb) {
//   s3.listObjects(params, function(err, data) {
//       if (err) {
//           console.log("listS3Objects Error:", err);
//       } else {
//           var contents = data.Contents;
//           s3DataContents = s3DataContents.concat(contents);
//           if (data.IsTruncated) {
//               // Set Marker to last returned key
//               params.Marker = contents[contents.length-1].Key;
//               s3ListObjects(params, cb);
//           } else {
//               cb();
//           }
//       }
//   });
// }

// s3ListObjects(params, s3ReadMetaFiles);