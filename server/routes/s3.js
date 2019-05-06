const AWS = require('aws-sdk');
var express = require('express');

// const fs = require('fs');
// const path = require('path');


var s3 = new AWS.S3();

var options = {
    Bucket    : 'cbiit-tools-data',
    Folder    : "methylscape",
};


function test(){
  var allKeys = [];
  var metafiles = [];

  s3.listObjects(
    {
    Bucket: 'cbiit-tools-data',
    Prefix: "methylscape"
    }, 
    function(err, data){
      if (err){console.log(err, err.stack)};
      console.log("***** ------- Retriving all data");
      // console.log(data);
      allKeys.push(data.Contents);      
      allKeys[0].map(
        item => {
          if(item.Key.endsWith("Metadata.csv")){
            console.log(item.Key)
            metafiles.push(item.Key)
          }
        }
      )      
    }
  );
  console.log(metafiles)
  metafiles.map(item => {
    console.log("getting item: ", item)
    var params = {Bucket: 'cbiit-tools-data', Key: item};
    s3.getObject({params}, (err, data) => {
      console.log("getting item: ", item)
      if (err) console.log(err, err.stack); // an error occurred
      else{
        console.log('--------', data.Body.toString());
      }              // successful response
    });
  })
  
}





test();