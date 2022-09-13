import util from "util";
import { createLogger, format, transports } from "winston";

export function formatObject(obj, opts = {}) {
  return ["string", "number"].includes(typeof obj)
    ? obj
    : util.inspect(obj, { depth: null, compact: true, breakLength: Infinity, ...opts });
}

export function formatLogMessage({ label, timestamp, level, message }) {
  return [
    [label, process.pid, timestamp, level]
      .filter(Boolean)
      .map((s) => `[${s}]`)
      .join(" "),
    formatObject(message),
  ].join(" - ");
}

export const defaultLogTransports = [new transports.Console()];

export function getLogger(name, level = "info", transports = defaultLogTransports) {
  return new createLogger({
    level,
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.label({ label: name }),
      format.printf(formatLogMessage)
    ),
    transports,
    exitOnError: false,
  });
}
