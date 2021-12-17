const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const { aws: config } = require("../config");

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

module.exports = {
  scanTable,
  getFile,
};
