import winston from "winston";
import { sanitize } from "../../shared/utils/sanitizer.js";

/**
 * @typedef {Object} LoggerContext
 * @property {string} [service] - The service name (e.g., 'admin-service')
 * @property {string} [module] - The module name (e.g., 'user', 'order')
 * @property {string} [feature] - The feature or submodule name (e.g., 'auth', 'payment')
 */

/**
 * Create a logger instance with optional context tagging.
 * @param {Object} [options]
 * @param {LoggerContext} [options.context] - Context to tag logs with { service, module, feature }
 * @returns {LoggerPort}
 */

export const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : "";
    return `${timestamp} [${level}] ${message} ${metaString}`;
  })
);

export const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format((info) => sanitize(info))(),
  winston.format.json({ level: true, space: 2 })
);
