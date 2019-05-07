const AWS = require('aws-sdk');
var s3tree = require('s3-tree');

getS3tree = async() => {
  var generator = s3tree({bucket: 'cbiit-tools-data'});
  const s3Tree = await generator.generate('/methylscape/');
  const tree = await createMethylTree(s3Tree);
  console.log(JSON.stringify(tree, null, 4))
}

createMethylTree = async(s3Tree) => {
  var methylTree = {}
  for(folder in s3Tree){
    methylTree[folder] = {}
    methylTree[folder]["files"] = {}
    for(file in s3Tree[folder]){
      if(file === "Metadata.csv"){
        methylTree[folder]["metaData"] = await parseMetaFile(s3Tree[folder][file], folder)
      }else{
        methylTree[folder]["files"][file] = s3Tree[folder][file]
      }
    }
  }
  return methylTree
}

parseMetaFile = async(metaFileKey, folder) => {
  var metaData = await getMetaData(metaFileKey).then(res => {
    var data = {}
    data["header"] = res[7]
    data["data"] = []
    var i = 0;
    for(i = 8; i < res.length; i++){
      data["data"] = [...data["data"], res[i]]
    }
    return {
      "investigator"    : res[1][1],
      "project"         : res[2][1],
      "experiment"      : res[3][1],
      "date"            : res[4][1], 
      "data"            : data
    }
  })
  return metaData
  
}

getMetaData = (metaFileKey) => new Promise( resolve => {
  var params = {
    Bucket    : 'cbiit-tools-data',
    Key       : metaFileKey
  };
  var s3 = new AWS.S3();
  const s3Stream = s3.getObject(params).createReadStream()
  var metaFileArray = []
  require('fast-csv').fromStream(s3Stream)
    .on('data', (data) => {
      metaFileArray = [...metaFileArray, data]
    })
    .on('end', () => {
      resolve(metaFileArray)
    }
  )
})


getS3tree()