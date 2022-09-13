import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";
import pickBy from "lodash/pickBy.js";
import minimist from "minimist";
import { getLogger, formatObject } from "./services/logger.js";
import { CustomTransport } from "./services/transports.js";
import { loadAwsCredentials, createConnection, createPostgresClient } from "./services/utils.js";
import { sendNotification } from "./services/notifications.js";
import { UserManager } from "./services/userManager.js";
import { importDatabase, getSourceProvider } from "./importDatabase.js";

// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

if (isMainModule) {
  const config = require("./config.json");
  loadAwsCredentials(config.aws);

  const args = minimist(process.argv.slice(2));
  const schema = require(args.schema || "./schema.json");
  const sources = require(args.sources || "./samples.json");

  const providerName = args.provider || "s3";
  const defaultProviderArgs = {
    local: ["."],
    s3: [`s3://${config.aws.s3DataBucket}/${config.aws.s3AnalysisKey}`],
  }[providerName];
  const providerArgs = args._.length ? args._ : defaultProviderArgs;
  const sourceProvider = getSourceProvider(providerName, providerArgs);

  const logger = createCustomLogger("methylscape-data-import");
  await importData(config, schema, sources, sourceProvider, logger);
  process.exit(0);
}

export async function importData(config, schema, sources, sourceProvider, logger) {
  const connection = createConnection(config.database);
  const dataConnection = await createPostgresClient(config.database);
  const logConnection = await createPostgresClient(config.database);
  const importLog = await getPendingImportLog(connection);
  const userManager = new UserManager(connection);
  const messageLevelCounts = {};
  const startDate = new Date();

  logger.info(`Started methylscape data import`);

  async function updateImportLog(params) {
    await connection("importLog")
      .where({ id: importLog.id })
      .update({ ...params, updatedAt: new Date() })
      .connection(logConnection);
  }

  async function handleLogEvent({ level, message, timestamp }) {
    messageLevelCounts[level] = (messageLevelCounts[level] || 0) + 1;
    const logMessage = `[${timestamp}] [${level}] ${formatObject(message)}`;
    const log = connection.raw(`concat("log", ?::text, '\n')`, [logMessage]);
    await updateImportLog({ log, warnings: messageLevelCounts.warn });
  }

  try {
    logger.customTransport.setHandler(handleLogEvent);
    await updateImportLog({ status: "IN PROGRESS" });
    await importDatabase(dataConnection, schema, sources, sourceProvider, logger);
    await updateImportLog({ status: "COMPLETED" });
    await sendNotification({
      userManager,
      smtpConfig: config.email.smtp,
      from: config.email.from,
      roleName: "admin",
      subject: "Methylscape Data Import Succeeded",
      templateName: "admin-import-success-email.html",
      params: {
        date: startDate,
      },
    });
  } catch (exception) {
    const error = formatObject(exception, { compact: false });
    logger.error(error);

    await updateImportLog({ status: "FAILED" });
    await sendNotification({
      userManager,
      smtpConfig: config.email.smtp,
      from: config.email.from,
      roleName: "admin",
      subject: "Methylscape Data Import Failed",
      templateName: "admin-import-failure-email.html",
      params: {
        date: startDate,
        error,
      },
    });
  } finally {
    logger.customTransport.setHandler(null);
  }

  return true;
}

export function createCustomLogger(name) {
  const logger = getLogger(name);
  logger.customTransport = new CustomTransport();
  logger.add(logger.customTransport);
  return logger;
}

export async function getPendingImportLog(connection) {
  const pendingImportLog = await connection("importLog")
    .where({ status: "PENDING" })
    .orderBy("createdAt", "asc")
    .first();
  return pendingImportLog || (await createImportLog(connection));
}

export async function createImportLog(connection) {
  await connection("importLog").insert({ status: "PENDING" });
  return await getPendingImportLog(connection);
}
