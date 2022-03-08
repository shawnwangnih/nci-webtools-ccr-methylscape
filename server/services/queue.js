const { randomBytes } = require("crypto");
const {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} = require("@aws-sdk/client-sqs");

/**
 * Helper function to enqueue a message given a queue name
 * @param {*} param0
 * @param {*} message
 * @returns
 */
async function enqueue(queueName, message) {
  const sqs = new SQSClient();
  const id = randomBytes(16).toString("hex");

  const { QueueUrl: queueUrl } = await sqs.send(
    new GetQueueUrlCommand({
      QueueName: queueName,
    }),
  );

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageDeduplicationId: id,
      MessageGroupId: id,
      MessageBody: JSON.stringify(message),
    }),
  );

  return id;
}

/**
 * Processes large messages from a SQS queue which uses S3 as the storage mechanism.
 * @param {*} config
 */
async function processMessages({
  queueName,
  visibilityTimeout = 60,
  pollInterval = 60,
  waitTime = 20,
  messageHandler,
  errorHandler = console.error,
}) {
  const sqs = new SQSClient();

  try {
    const { QueueUrl: queueUrl } = await sqs.send(
      new GetQueueUrlCommand({
        QueueName: queueName,
      }),
    );

    // to simplify running multiple workers in parallel,
    // fetch one message at a time
    const data = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: visibilityTimeout,
        WaitTimeSeconds: waitTime,
      }),
    );

    if (data.Messages && data.Messages.length > 0) {
      const message = data.Messages[0];
      const messageBody = JSON.parse(message.Body);

      // while processing is not complete, update the message's visibilityTimeout
      const intervalId = setInterval(async () => {
        await sqs.send(
          new ChangeMessageVisibilityCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle,
            VisibilityTimeout: visibilityTimeout,
          }),
        );
      }, 1000 * (visibilityTimeout / 2));

      try {
        await messageHandler(messageBody);
      } catch (e) {
        await errorHandler(e, message);
      } finally {
        // remove original message from queue/bucket once processed
        clearInterval(intervalId);
        await sqs.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          }),
        );
      }
    }
  } catch (e) {
    await errorHandler(e);
  } finally {
    // schedule processing next message
    setTimeout(
      () =>
        processMessages({
          queueName,
          visibilityTimeout,
          pollInterval,
          waitTime,
          messageHandler,
          errorHandler,
        }),
      1000 * pollInterval,
    );
  }
}

module.exports = {
  enqueue,
  processMessages,
}
