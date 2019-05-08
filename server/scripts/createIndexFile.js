const AWS = require('aws-sdk');
var s3tree = require('s3-tree');

getTree = async () => {
    const s3Tree = await s3tree({bucket: 'cbiit-tools-data'}).generate('/methylscape/');
    const tree = await createMethylTree(s3Tree);
    return tree
}

createMethylTree = async (s3Tree) => {
    var methylTree = {}
    for (folder in s3Tree) {
      if(folder === "indexFile.json"){
        continue;
      }
        methylTree[folder] = {}
        methylTree[folder]["files"] = {}
        for (file in s3Tree[folder]) {
            if (file === "Metadata.csv") {
                methylTree[folder]["metaData"] = await parseMetaFile(s3Tree[folder][file], folder)
            } else {
                methylTree[folder]["files"][file] = s3Tree[folder][file]
            }
        }
    }
    return methylTree
}

parseMetaFile = async (metaFileKey, folder) => {
    var metaData = await getMetaData(metaFileKey).then(res => {
        var data = {}
        data["header"] = res[7]
        data["data"] = []
        var i = 0;
        for (i = 8; i < res.length; i++) {
            data["data"] = [...data["data"], res[i]]
        }
        return {
            "investigator": res[1][1],
            "project": res[2][1],
            "experiment": res[3][1],
            "date": res[4][1],
            "data": data
        }
    })
    return metaData

}

getMetaData = (metaFileKey) => new Promise(resolve => {
    var params = {
        Bucket: 'cbiit-tools-data',
        Key: metaFileKey
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
        })
})

uploadDataAsJSON = async(data) => {
  return new Promise(function(resolve, reject) {
  var s3 = new AWS.S3()
  var params = {
    Bucket: 'cbiit-tools-data/methylscape',
    Key: 'indexFile.json',
    Body: JSON.stringify(data),
    ContentType: "application/json"
  }
  s3.putObject(params , (err,data) => {
      if(err) reject(err)
      else resolve(data)
    }
  );
  })
}

createIndexFile = async () => {
  const data = await getTree()
  uploadDataAsJSON(data).then(res => console.log(res))
  return data 
}

createIndexFile.prototype.getIndexFile = async () => {
    const data = await createIndexFile()
    return data
}

exports.Request = createIndexFile