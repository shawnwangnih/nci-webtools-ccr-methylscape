const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const { aws: config } = require('../config');

async function scanTable() {
  const client = new DynamoDBClient({ region: config.region });
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  let params = { TableName: config.dynamoDBTable },
    data = [],
    table = [];

  do {
    table = await ddbDocClient.send(new ScanCommand(params));
    data = [...data, ...table.Items];
    params.ExclusiveStartKey = table.LastEvaluatedKey;
  } while (table.LastEvaluatedKey);
  return data;
}

async function getFile(key) {
  const s3Client = new S3Client({ region: config.region });
  const bucketParams = { Bucket: config.s3Bucket, Key: key };
  console.log(bucketParams);
  // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
  return await s3Client.send(new GetObjectCommand(bucketParams));
}

async function getDataFile(key) {
  const s3Client = new S3Client({ region: config.region });
  const bucketParams = { Bucket: config.s3DataBucket, Key: key };
  console.log(bucketParams);
  // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
  return await s3Client.send(new GetObjectCommand(bucketParams));
}

async function getKey(prefix) {
  const s3Client = new S3Client({ region: config.region });
  const params = { Bucket: config.s3DataBucket, Prefix: prefix };
  console.log(params);
  const objects = await s3Client.send(new ListObjectsV2Command(params));
  return objects;
}

module.exports = {
  scanTable,
  getFile,
  getDataFile,
  getKey,
};
