// WinstonLoggerAdapter: Winston-based implementation of LoggerPort.
// Handles log rotation, console/file output, and failover for exceptions.

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import loggerConfig from "../../shared/configs/logger.config.js";
import { logLevels, logColors } from "./logger-levels.js";
import { consoleFormat, jsonFormat } from "./winston-logger-formats.js";
import { LoggerPort } from "./logger.port.js";

// Add custom colors for Winston log levels
winston.addColors(logColors);

/**
 * Creates Winston transports for file rotation and console output.
 * - File transports use daily rotation and JSON formatting.
 * - Console transport uses colorized formatting.
 * - Exception handling is enabled for error and console transports.
 * @returns {Array} Array of Winston transport instances
 */
function createWinstonTransports() {
  // Helper to create a rotating file transport for a given log level
  const jsonRotateTransport = (filename, level) =>
    new DailyRotateFile({
      format: jsonFormat,
      filename: path.join("logs", `${filename}-%DATE%.log`),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      level,
      handleExceptions: filename === "error", // Only error log handles exceptions
    });

  // Console transport for human-readable output
  const consoleTransports = [
    new winston.transports.Console({
      format: consoleFormat,
      level: loggerConfig.logLevel,
      handleExceptions: true, // Console should always handle exceptions
    }),
  ];

  // File transports for error, info, and all logs
  const jsonTransports = [
    jsonRotateTransport("error", "warn"),
    jsonRotateTransport("info", "info"),
    jsonRotateTransport("all", "debug"),
  ];

  const transports = [];
  if (loggerConfig.storeLogs) {
    transports.push(...jsonTransports);
  }
  if (loggerConfig.logToConsole) {
    transports.push(...consoleTransports);
  }
  return transports;
}

/**
 * Factory for creating a Winston logger instance with configured transports.
 * @returns {winston.Logger} Winston logger instance
 */
function createWinstonLogger() {
  return winston.createLogger({
    level: loggerConfig.logLevel,
    levels: logLevels,
    transports: createWinstonTransports(),
    exitOnError: false, // Prevent Winston from exiting on handled exceptions
  });
}

/**
 * WinstonLoggerAdapter implements LoggerPort using Winston.
 * Only whitelisted log methods are exposed via the logger factory.
 *
 * @class WinstonLoggerAdapter
 * @extends LoggerPort
 * @param {winston.Logger} [loggerInstance] - Optional custom Winston logger instance
 */
export class WinstonLoggerAdapter extends LoggerPort {
  constructor(loggerInstance) {
    super();
    // Use provided logger or create a default one
    this.logger = loggerInstance || createWinstonLogger();
  }
  /**
   * Log an error message.
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }
  /**
   * Log a warning message.
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }
  /**
   * Log an info message.
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }
  /**
   * Log an HTTP message (Winston-specific).
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  http(message, meta = {}) {
    this.logger.http(message, meta);
  }
  /**
   * Log a verbose message.
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  verbose(message, meta = {}) {
    this.logger.verbose(message, meta);
  }
  /**
   * Log a debug message.
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
}

export default WinstonLoggerAdapter;
