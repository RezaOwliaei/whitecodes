import { ConfigurationError } from "../../shared/errors/ConfigurationError.js";
import { deepMerge } from "../../shared/utils/object-merge.util.js";

import { LoggerPort } from "./logger.port.js";

/**
 * @typedef {Object} LoggerContext
 * @property {string} [service] - The service name (e.g., 'admin-service')
 * @property {string} [module] - The module name (e.g., 'user', 'order')
 * @property {string} [feature] - The feature or submodule name (e.g., 'auth', 'payment')
 *
 * @example
 * // Basic service context
 * { service: "admin-service" }
 *
 * @example
 * // Detailed hierarchical context
 * {
 *   service: "admin-service",
 *   module: "user-management",
 *   feature: "authentication"
 * }
 */

/**
 * @typedef {Object} LoggerFactoryOptions
 * @property {LoggerContext} [context] - Default context to tag all logs with
 *
 * @example
 * // Service-level context
 * { context: { service: "admin-service" } }
 *
 * @example
 * // Module-specific context
 * {
 *   context: {
 *     service: "admin-service",
 *     module: "user-management"
 *   }
 * }
 */

/**
 * Validates that logMethods parameter is an array.
 *
 * Flow:
 * 1. Checks if logMethods is an array type
 * 2. Throws TypeError with descriptive message if invalid
 *
 * @param {any} logMethods - The logMethods parameter to validate
 * @throws {TypeError} When logMethods is not an array
 *
 * @example
 * validateLogMethodsInput(["info", "error"]); // ✅ Valid
 * validateLogMethodsInput("info"); // ❌ Throws TypeError
 * validateLogMethodsInput(null); // ❌ Throws TypeError
 */
function validateLogMethodsInput(logMethods) {
  if (!Array.isArray(logMethods)) {
    throw new TypeError(
      `logMethods must be an array, received: ${typeof logMethods}`
    );
  }
}

/**
 * Validates that the logger adapter extends LoggerPort for hexagonal architecture compliance.
 *
 * Flow:
 * 1. Checks instanceof LoggerPort to ensure proper inheritance
 * 2. Throws ConfigurationError with adapter details if invalid
 * 3. Includes type information for debugging
 *
 * @param {any} loggerAdapter - The logger adapter to validate
 * @throws {ConfigurationError} When adapter doesn't extend LoggerPort
 *
 * @example
 * // ✅ Valid adapter
 * class MyAdapter extends LoggerPort { ... }
 * validateLoggerAdapter(new MyAdapter());
 *
 * @example
 * // ❌ Invalid adapter
 * validateLoggerAdapter({ info: () => {} }); // Throws ConfigurationError
 */
function validateLoggerAdapter(loggerAdapter) {
  if (!(loggerAdapter instanceof LoggerPort)) {
    throw new ConfigurationError(
      `Logger adapter must extend LoggerPort. Received: ${typeof loggerAdapter}`,
      {
        details: {
          receivedType: typeof loggerAdapter,
          expectedType: "LoggerPort",
          adapterConstructor: loggerAdapter?.constructor?.name || "unknown",
        },
      }
    );
  }
}

/**
 * Validates that all required methods are available on the adapter.
 *
 * Flow:
 * 1. Checks if any methods are missing from the adapter
 * 2. Collects available methods for debugging information
 * 3. Throws ConfigurationError with comprehensive details if methods missing
 *
 * @param {string[]} missingMethods - Array of missing method names
 * @param {string[]} logMethods - Array of requested method names
 * @param {LoggerPort} loggerAdapter - The logger adapter instance
 * @throws {ConfigurationError} When required methods are missing
 *
 * @example
 * // ✅ All methods available
 * validateRequiredMethods([], ["info", "error"], adapter);
 *
 * @example
 * // ❌ Missing methods
 * validateRequiredMethods(["warn"], ["info", "warn"], adapter); // Throws ConfigurationError
 */
function validateRequiredMethods(missingMethods, logMethods, loggerAdapter) {
  if (missingMethods.length > 0) {
    throw new ConfigurationError(
      `Logger adapter missing required methods: ${missingMethods.join(", ")}`,
      {
        details: {
          missingMethods,
          requestedMethods: logMethods,
          availableMethods: Object.getOwnPropertyNames(loggerAdapter).filter(
            (prop) => typeof loggerAdapter[prop] === "function"
          ),
          adapterType: loggerAdapter.constructor.name,
        },
      }
    );
  }
}

/**
 * Wraps a logger method to merge default and per-call context.
 *
 * Flow:
 * 1. Establishes safe fallback context if none provided
 * 2. Returns wrapped function that merges contexts on each call
 * 3. Uses deep merge to preserve nested context structures
 * 4. Calls original method with merged metadata
 *
 * @param {Function} method - The logger method to wrap (e.g., info, error)
 * @param {LoggerContext} context - The default context to merge into every log call
 * @returns {Function} Wrapped logger method that merges contexts
 *
 * @example
 * // Wrapping an info method with service context
 * const wrappedInfo = wrapLoggerMethod(
 *   adapter.info,
 *   { service: "admin-service" }
 * );
 *
 * // Usage with per-call context override
 * wrappedInfo("User login", {
 *   context: { feature: "auth" },
 *   userId: "123"
 * });
 * // Results in: {
 *   context: { service: "admin-service", feature: "auth" },
 *   userId: "123"
 * }
 */
function wrapLoggerMethod(method, context) {
  const safeContext =
    context && Object.keys(context).length > 0
      ? context
      : { service: "unknown-service" };

  return (message, meta = {}) => {
    const mergedMeta = {
      ...meta,
      context: deepMerge(safeContext, meta.context || {}),
    };
    method.call(this, message, mergedMeta);
  };
}

/**
 * Builds context-aware logger methods by wrapping adapter methods with context merging.
 *
 * This function transforms raw adapter methods into context-aware versions that automatically
 * merge default context with per-call context. It tracks which methods are successfully
 * wrapped and which are missing for validation purposes.
 *
 * Flow:
 * 1. Iterates through requested log method names
 * 2. For each method: checks if it exists and is callable on the adapter
 * 3. If method exists: wraps it with context merging functionality
 * 4. If method missing: tracks it for error reporting
 * 5. Returns both the wrapped methods and missing method list
 *
 * @param {LoggerPort} loggerAdapter - The logger adapter instance to wrap
 * @param {string[]} logMethods - Array of method names to make context-aware
 * @param {LoggerContext} context - Default context to inject into all log calls
 * @returns {Object} Result object containing wrapped methods and validation data
 * @returns {Object} returns.contextAwareMethods - Object with wrapped logger methods
 * @returns {string[]} returns.missingMethods - Array of method names not found on adapter
 *
 * @example
 * // Building context-aware methods for common logging operations
 * const { contextAwareMethods, missingMethods } = buildContextAwareLoggerMethods(
 *   winstonAdapter,
 *   ["info", "error", "warn", "debug"],
 *   { service: "admin-service", module: "auth" }
 * );
 *
 * // contextAwareMethods.info automatically includes service and module context
 * contextAwareMethods.info("User login attempt", {
 *   userId: "123",
 *   context: { action: "authenticate" }
 * });
 * // Results in log with merged context:
 * // { service: "admin-service", module: "auth", action: "authenticate" }
 *
 * @example
 * // Handling missing methods scenario
 * const { contextAwareMethods, missingMethods } = buildContextAwareLoggerMethods(
 *   incompleteAdapter,
 *   ["info", "error", "trace"], // trace method doesn't exist
 *   { service: "test-service" }
 * );
 * // missingMethods = ["trace"]
 * // contextAwareMethods = { info: wrappedInfoMethod, error: wrappedErrorMethod }
 */
function buildContextAwareLoggerMethods(loggerAdapter, logMethods, context) {
  const contextAwareMethods = {};
  const missingMethods = [];

  for (const methodName of logMethods) {
    if (typeof loggerAdapter[methodName] === "function") {
      contextAwareMethods[methodName] = wrapLoggerMethod.call(
        loggerAdapter,
        loggerAdapter[methodName],
        context
      );
    } else {
      missingMethods.push(methodName);
    }
  }

  return { contextAwareMethods, missingMethods };
}

/**
 * Creates a logger instance with optional default context tagging.
 *
 * This factory function creates a LoggerPort-compliant proxy that wraps adapter methods
 * with automatic context merging capabilities. It ensures hexagonal architecture compliance
 * by validating that adapters extend LoggerPort and implement required methods.
 *
 * Flow:
 * 1. Validates input parameters (logMethods array, LoggerPort compliance)
 * 2. Creates wrapped methods with context merging functionality
 * 3. Validates all requested methods are available on adapter
 * 4. Returns proxy object with wrapped logger methods
 *
 * Context Merging Behavior:
 * - Default context is merged with per-call context
 * - Per-call context overrides default context for same keys
 * - Deep merging preserves nested object structures
 * - Fallback to { service: "unknown-service" } if no context provided
 *
 * @param {LoggerFactoryOptions} options - Logger factory configuration options
 * @param {LoggerContext} [options.context] - Default context to tag logs with { service, module, feature }
 * @param {LoggerPort} loggerAdapter - Logger adapter instance (must extend LoggerPort)
 * @param {string[]} logMethods - List of log method names to expose on the logger
 * @returns {Object} Logger instance with wrapped methods for context merging
 *
 * @throws {TypeError} When logMethods is not an array
 * @throws {ConfigurationError} When adapter doesn't extend LoggerPort
 * @throws {ConfigurationError} When adapter missing required methods
 *
 * @example
 * // Basic usage with service context
 * import { WinstonLoggerAdapter } from './winston-logger.adapter.js';
 *
 * const adapter = new WinstonLoggerAdapter();
 * const logger = createLoggerFactory(
 *   { context: { service: "admin-service" } },
 *   adapter,
 *   ["info", "error", "warn", "debug"]
 * );
 *
 * // All logs will include service context
 * logger.info("User created", { userId: "123" });
 * // Logs: { context: { service: "admin-service" }, userId: "123" }
 *
 * @example
 * // Advanced usage with hierarchical context
 * const logger = createLoggerFactory(
 *   {
 *     context: {
 *       service: "admin-service",
 *       module: "user-management"
 *     }
 *   },
 *   adapter,
 *   ["info", "error"]
 * );
 *
 * // Per-call context merging
 * logger.info("Authentication attempt", {
 *   context: { feature: "login", action: "validate" },
 *   userId: "user-123",
 *   ip: "192.168.1.1"
 * });
 * // Results in merged context:
 * // {
 * //   context: {
 * //     service: "admin-service",
 * //     module: "user-management",
 * //     feature: "login",
 * //     action: "validate"
 * //   },
 * //   userId: "user-123",
 * //   ip: "192.168.1.1"
 * // }
 *
 * @example
 * // Error handling scenarios
 * try {
 *   const logger = createLoggerFactory(
 *     { context: { service: "test" } },
 *     invalidAdapter, // Not extending LoggerPort
 *     ["info"]
 *   );
 * } catch (error) {
 *   console.error(error.message); // "Logger adapter must extend LoggerPort"
 *   console.error(error.details.receivedType); // "object"
 * }
 */
export function createLoggerFactory({ context }, loggerAdapter, logMethods) {
  // Input Validation
  validateLogMethodsInput(logMethods);
  validateLoggerAdapter(loggerAdapter);

  // Context-Aware Method Creation
  const { contextAwareMethods, missingMethods } =
    buildContextAwareLoggerMethods(loggerAdapter, logMethods, context);

  // Final Validation
  validateRequiredMethods(missingMethods, logMethods, loggerAdapter);

  return contextAwareMethods;
}
