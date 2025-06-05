/**
 * Wraps a logger method to merge default and per-call context.
 * Ensures a safe fallback for context (defaults to { service: "unknown-service" }).
 * @param {Function} method - The logger method to wrap (e.g., info, error)
 * @param {Object} context - The default context to merge into every log call
 * @returns {Function} Wrapped logger method
 */
function wrapLoggerMethod(method, context) {
  const safeContext =
    context && Object.keys(context).length > 0
      ? context
      : { service: "unknown-service" };
  return (message, meta = {}) => {
    const mergedMeta = {
      ...meta,
      context: {
        ...safeContext,
        ...meta.context,
      },
    };
    method.call(this, message, mergedMeta);
  };
}

/**
 * Creates a logger instance with optional default context tagging.
 * Only standard log methods for the selected adapter are wrapped.
 * Allows per-call context override via meta.context.
 *
 * @param {Object} options - Logger factory options
 * @param {LoggerContext} [options.context] - Default context to tag logs with { service, module, feature }
 * @param {Object} loggerAdapter - Logger adapter instance (already constructed)
 * @param {string[]} logMethods - List of log method names to expose
 * @returns {LoggerPort} Logger instance with wrapped methods
 */
export function createLoggerFactory({ context }, loggerAdapter, logMethods) {
  const loggerProxy = {};
  const missingMethods = [];

  for (const key of logMethods) {
    if (typeof loggerAdapter[key] === "function") {
      loggerProxy[key] = wrapLoggerMethod.call(
        loggerAdapter,
        loggerAdapter[key],
        context
      );
    } else {
      missingMethods.push(key);
    }
  }

  // Fail fast if any required methods are missing
  if (missingMethods.length > 0) {
    throw new Error(
      `Logger adapter missing required methods: ${missingMethods.join(
        ", "
      )}. ` + `Adapter: ${loggerAdapter.constructor.name}`
    );
  }

  return loggerProxy;
}
