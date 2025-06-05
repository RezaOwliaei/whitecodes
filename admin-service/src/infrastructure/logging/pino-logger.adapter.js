import pino from "pino";
import path from "path";
import loggerConfig from "../../shared/configs/logger.config.js";
import fs from "fs";
import { LoggerPort } from "./logger.port.js";
import {
  levelFormatter,
  logFormatter,
  timestamp,
} from "./pino-logger-formatters.js";

const logDir = path.join("logs");
if (loggerConfig.storeLogs && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create Pino streams based on config
function createPinoStreams() {
  const streams = [];
  if (loggerConfig.storeLogs) {
    streams.push({
      level: "warn",
      stream: pino.destination({
        dest: path.join(logDir, "error.log"),
        mkdir: true,
        append: true,
        sync: false,
      }),
    });
    streams.push({
      level: "info",
      stream: pino.destination({
        dest: path.join(logDir, "info.log"),
        mkdir: true,
        append: true,
        sync: false,
      }),
    });
    streams.push({
      level: "debug",
      stream: pino.destination({
        dest: path.join(logDir, "all.log"),
        mkdir: true,
        append: true,
        sync: false,
      }),
    });
  }
  if (loggerConfig.logToConsole) {
    streams.push({
      level: loggerConfig.logLevel,
      stream: process.stdout,
    });
  }
  return streams;
}

// Create Pino logger using defined streams
function createPinoLogger() {
  const logger = pino(
    {
      level: loggerConfig.logLevel,
      formatters: {
        level: levelFormatter,
        log: logFormatter,
      },
      timestamp,
      base: undefined,
    },
    pino.multistream(createPinoStreams())
  );

  // Handle uncaught exceptions and unhandled rejections
  process.on("uncaughtException", (err) => {
    logger.error({ err }, "Uncaught Exception");
  });
  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled Rejection");
  });

  return logger;
}

export class PinoLoggerAdapter extends LoggerPort {
  constructor(loggerInstance = createPinoLogger()) {
    super();
    this.logger = loggerInstance;
  }
  error(message, meta = {}) {
    this.logger.error(meta, message);
  }
  warn(message, meta = {}) {
    this.logger.warn(meta, message);
  }
  info(message, meta = {}) {
    this.logger.info(meta, message);
  }
  http(message, meta = {}) {
    this.logger.info(meta, message); // Pino doesn't have 'http' level by default
  }
  verbose(message, meta = {}) {
    this.logger.debug(meta, message); // Map 'verbose' to 'debug'
  }
  debug(message, meta = {}) {
    this.logger.debug(meta, message);
  }
}

export default PinoLoggerAdapter;
