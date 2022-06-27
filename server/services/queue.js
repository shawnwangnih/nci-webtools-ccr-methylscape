const { randomBytes } = require("crypto");
const { GetQueueUrlCommand, SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");
const config = require("../config");

/**
 * Helper function to enqueue a message given a queue name
 * @param {*} param0
 * @param {*} message
 * @returns
 */
async function enqueue(queueName, message) {
  const sqs = new SQSClient({ region: config.aws.region });
  const id = randomBytes(16).toString("hex");

  const { QueueUrl: queueUrl } = await sqs.send(
    new GetQueueUrlCommand({
      QueueName: queueName,
    })
  );

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageDeduplicationId: id,
      MessageGroupId: id,
      MessageBody: JSON.stringify(message),
    })
  );

  return id;
}
module.exports = {
  enqueue,
};
