const { enqueue } = require("./queue");

async function createImportRequest(connection, queueName, params = {}) {
  const ids = await connection("importLog").returning("id").insert({ status: "PENDING" });
  const message = {
    timestamp: Date.now(),
    importLogId: ids[0].id,
    type: "importData",
    ...params,
  };
  return await enqueue(queueName, message);
}

module.exports = {
  createImportRequest,
};
