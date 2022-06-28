const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { aws: config } = require("../config");

function loadAwsCredentials(config) {
  const { region, accessKeyId, secretAccessKey } = config;

  if (region) {
    process.env.AWS_REGION = region;
    process.env.AWS_DEFAULT_REGION = region;
  }

  if (accessKeyId) {
    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
  }

  if (secretAccessKey) {
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
  }
}

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

// queue bucket
async function getFile(key) {
  const s3Client = new S3Client({ region: config.region });
  const bucketParams = { Bucket: config.s3Bucket, Key: key };
  console.log(bucketParams);
  // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
  return await s3Client.send(new GetObjectCommand(bucketParams));
}

// data bucket
async function getAnalysisFile(key) {
  const s3Client = new S3Client({ region: config.region });
  const bucketParams = { Bucket: config.s3DataBucket, Key: config.s3AnalysisKey + key };
  console.log(bucketParams);
  // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
  return await s3Client.send(new GetObjectCommand(bucketParams));
}

// data bucket
async function getReportsFile(key) {
  const s3Client = new S3Client({ region: config.region });
  const bucketParams = { Bucket: config.s3DataBucket, Key: config.s3ReportsKey + key };
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
  loadAwsCredentials,
  scanTable,
  getFile,
  getAnalysisFile,
  getReportsFile,
  getKey,
};
