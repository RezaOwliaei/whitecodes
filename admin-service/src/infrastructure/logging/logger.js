/**
 * Logging entry point for the service.
 *
 * This module exports:
 * - createLogger: A factory function to create logger instances with contextual metadata (e.g., service, module, feature).
 * - baseLogger: A pre-configured logger instance with the base service context (from SERVICE_NAME env or default).
 *
 * Usage:
 *   import createLogger, { baseLogger } from './logger.js';
 *   const logger = createLogger({ module: 'user', feature: 'auth' });
 *   logger.info('User created', { context: { feature: 'signup' } }); // dynamic context override
 *
 * @typedef {Object} LoggerContext
 * @property {string} [service] - The service name (e.g., 'admin-service')
 * @property {string} [module] - The module name (e.g., 'user', 'order')
 * @property {string} [feature] - The feature or submodule name (e.g., 'auth', 'payment')
 *
 * @function createLogger
 * @param {LoggerContext} [context] - Context to tag logs with (merged with base context)
 * @param {Object} [options] - Optional overrides: { adapterName, adapterInstance, logMethods }
 * @returns {LoggerPort} Logger instance with contextual metadata
 *
 * @const {LoggerPort} baseLogger - Pre-configured logger with base service context
 */

import loggerConfig from "../../shared/configs/logger.config.js";
import { createLoggerFactory } from "./logger.factory.js";
import WinstonLoggerAdapter from "./winston-logger.adapter.js";
import PinoLoggerAdapter from "./pino-logger.adapter.js";
import { WINSTON_LOG_METHODS, PINO_LOG_METHODS } from "./logger-methods.js";

const BASE_CONTEXT = { service: loggerConfig.serviceName || "admin-service" };

function resolveAdapterConfig(adapterName) {
  switch ((adapterName || loggerConfig.logger).toLowerCase()) {
    case "pino":
      return {
        adapter: new PinoLoggerAdapter(),
        methods: PINO_LOG_METHODS,
      };
    case "winston":
    default:
      return {
        adapter: new WinstonLoggerAdapter(),
        methods: WINSTON_LOG_METHODS,
      };
  }
}

/**
 * Factory to create a logger instance with contextual metadata and pluggable adapter.
 *
 * @param {LoggerContext} [context] - Context to tag logs with (merged with base context)
 * @param {Object} [options] - Optional overrides: { adapterName, adapterInstance, logMethods }
 * @returns {LoggerPort} Logger instance with contextual metadata
 */
const createLogger = (context = {}, options = {}) => {
  const { adapterName, adapterInstance, logMethods } = options;
  let adapter, methods;
  if (adapterInstance && logMethods) {
    adapter = adapterInstance;
    methods = logMethods;
  } else {
    const resolved = resolveAdapterConfig(adapterName);
    adapter = resolved.adapter;
    methods = resolved.methods;
  }
  return createLoggerFactory(
    {
      context: { ...BASE_CONTEXT, ...context },
    },
    adapter,
    methods
  );
};

const baseLogger = createLogger();

export default createLogger;
export { baseLogger };
