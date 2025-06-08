/**
 * @fileoverview Logging composition root for the admin-service.
 *
 * Implements hexagonal architecture with pluggable adapters (Winston/Pino)
 * and automatic context merging for hierarchical logging.
 *
 * @example
 * import createLogger, { baseLogger } from './logger.js';
 *
 * const logger = createLogger({ module: 'user', feature: 'auth' });
 * logger.info('User authenticated', { userId: '123' });
 *
 * baseLogger.info('Service started');
 */

import loggerConfig from "../../shared/configs/logger.config.js";

import { BASE_CONTEXT } from "./logger-base-context.js";
import { WINSTON_LOG_METHODS, PINO_LOG_METHODS } from "./logger-methods.js";
import { createLoggerFactory } from "./logger.factory.js";
import PinoLoggerAdapter from "./pino-logger.adapter.js";
import WinstonLoggerAdapter from "./winston-logger.adapter.js";


/**
 * @typedef {import('./logger.port.js').LoggerPort} LoggerPort
 */

/**
 * @typedef {Object} LoggerContext
 * @property {string} [service] - Service name (e.g., 'admin-service')
 * @property {string} [module] - Module name (e.g., 'user', 'order')
 * @property {string} [feature] - Feature name (e.g., 'auth', 'payment')
 */

/**
 * @typedef {Object} LoggerOptions
 * @property {string} [adapterName] - Adapter to use ('winston' | 'pino')
 * @property {LoggerPort} [adapterInstance] - Custom adapter for testing
 * @property {string[]} [logMethods] - Methods to expose (required with adapterInstance)
 */

/**
 * Resolves logger adapter configuration.
 *
 * Flow:
 * 1. Determines target adapter from parameter or config default
 * 2. Instantiates appropriate adapter class
 * 3. Returns adapter with its supported method set
 *
 * @private
 * @param {string} [adapterName] - Adapter name or uses config default
 * @returns {{adapter: LoggerPort, methods: string[]}} Adapter config
 */
function resolveLoggerAdapterConfig(adapterName) {
  // STEP 1: Determine which adapter to use
  const targetAdapter = (adapterName ?? loggerConfig.logger).toLowerCase();

  // STEP 2: Instantiate adapter and map to methods
  switch (targetAdapter) {
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
 * Builds context by merging base context with given context.
 *
 * Flow:
 * 1. Takes BASE_CONTEXT as foundation
 * 2. Overlays given context
 * 3. Returns merged context
 *
 * @private
 * @param {LoggerContext} [context={}] - Context to merge with base
 * @returns {LoggerContext} Merged context
 */
function buildContext(context = {}) {
  // STEP 1: Merge base context with given context
  // NOTE: Object spread allows given context to override base keys
  return { ...BASE_CONTEXT, ...context };
}

/**
 * Creates a context-aware logger with pluggable adapters.
 *
 * Flow:
 * 1. Extracts adapter configuration options
 * 2. Resolves adapter (custom instance or config-based)
 * 3. Builds merged context
 * 4. Delegates to factory for context-aware method wrapping
 *
 * Context hierarchy: BASE_CONTEXT → context param → meta.context in calls
 *
 * @param {LoggerContext} [context={}] - Module/feature context
 * @param {LoggerOptions} [options={}] - Adapter configuration
 * @returns {LoggerPort} Context-aware logger instance
 *
 * @example
 * // Basic usage
 * const userLogger = createLogger({ module: 'user', feature: 'auth' });
 * userLogger.info('Login attempt', { userId: '123' });
 *
 * @example
 * // Custom adapter
 * const testLogger = createLogger(
 *   { module: 'test' },
 *   { adapterInstance: mockAdapter, logMethods: ['info', 'error'] }
 * );
 */
const createLogger = (context = {}, options = {}) => {
  // STEP 1: Extract adapter configuration options
  const { adapterName, adapterInstance, logMethods } = options;

  // STEP 2: Resolve adapter configuration
  const adapterConfig =
    adapterInstance && logMethods
      ? // BRANCH: Use custom adapter for testing/DI
        { adapter: adapterInstance, methods: logMethods }
      : // BRANCH: Use config-based adapter resolution
        resolveLoggerAdapterConfig(adapterName);

  // STEP 3: Build merged context
  const mergedContext = buildContext(context);

  // STEP 4: Create context-aware logger via factory
  return createLoggerFactory(
    { context: mergedContext },
    adapterConfig.adapter,
    adapterConfig.methods
  );
};

/**
 * Pre-configured logger with base service context.
 *
 * Use for service-level logging: startup, errors, health checks.
 *
 * @type {LoggerPort}
 *
 * @example
 * import { baseLogger } from './logger.js';
 *
 * baseLogger.info('Service starting', { port: 3000 });
 * baseLogger.error('Uncaught exception', { error: err.message });
 */
const baseLogger = createLogger();

export default createLogger;
export { baseLogger };
