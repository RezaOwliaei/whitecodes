import { NotImplementedError } from "../../shared/errors/index.js";

/**
 * LoggerPort defines the contract for all logger adapters in the hexagonal architecture.
 * This is an abstract class that serves as the port (interface) between the application
 * and the logging infrastructure adapters (Winston, Pino, etc.).
 *
 * Each method should be implemented by concrete adapter subclasses.
 * Adapters may map their native methods to these standard methods as needed.
 */
export class LoggerPort {
  /**
   * Log fatal level messages (Pino-specific, mapped by other adapters)
   * @param {string} message - The log message
   * @param {Object} [meta={}] - Additional metadata
   */
  fatal(message, meta = {}) {
    throw new NotImplementedError(
      'Method "fatal" must be implemented by subclass',
      {
        methodName: "fatal",
        interfaceName: "LoggerPort",
        details: {
          expectedImplementation:
            "Logger adapter must implement fatal() method",
          logLevel: "fatal",
        },
      }
    );
  }

  /**
   * Log error level messages
   * @param {string} message - The log message
   * @param {Object} [meta={}] - Additional metadata
   */
  error(message, meta = {}) {
    throw new NotImplementedError(
      'Method "error" must be implemented by subclass',
      {
        methodName: "error",
        interfaceName: "LoggerPort",
        details: {
          expectedImplementation:
            "Logger adapter must implement error() method",
          logLevel: "error",
        },
      }
    );
  }

  /**
   * Log warn level messages
   * @param {string} message - The log message
   * @param {Object} [meta={}] - Additional metadata
   */
  warn(message, meta = {}) {
    throw new NotImplementedError(
      'Method "warn" must be implemented by subclass',
      {
        methodName: "warn",
        interfaceName: "LoggerPort",
        details: {
          expectedImplementation: "Logger adapter must implement warn() method",
          logLevel: "warn",
        },
      }
    );
  }

  /**
   * Log info level messages
   * @param {string} message - The log message
   * @param {Object} [meta={}] - Additional metadata
   */
  info(message, meta = {}) {
    throw new NotImplementedError(
      'Method "info" must be implemented by subclass',
      {
        methodName: "info",
        interfaceName: "LoggerPort",
        details: {
          expectedImplementation: "Logger adapter must implement info() method",
          logLevel: "info",
        },
      }
    );
  }

  /**
   * Log HTTP level messages (Winston-specific, mapped by other adapters)
   * @param {string} message - The log message
   * @param {Object} [meta={}] - Additional metadata
   */
  http(message, meta = {}) {
    throw new NotImplementedError(
      'Method "http" must be implemented by subclass',
      {
        methodName: "http",
        interfaceName: "LoggerPort",
        details: {
          expectedImplementation: "Logger adapter must implement http() method",
          logLevel: "http",
        },
      }
    );
  }

  /**
   * Log verbose level messages (Winston-specific, mapped by other adapters)
   * @param {string} message - The log message
   * @param {Object} [meta={}] - Additional metadata
   */
  verbose(message, meta = {}) {
    throw new NotImplementedError(
      'Method "verbose" must be implemented by subclass',
      {
        methodName: "verbose",
        interfaceName: "LoggerPort",
        details: {
          expectedImplementation:
            "Logger adapter must implement verbose() method",
          logLevel: "verbose",
        },
      }
    );
  }

  /**
   * Log debug level messages
   * @param {string} message - The log message
   * @param {Object} [meta={}] - Additional metadata
   */
  debug(message, meta = {}) {
    throw new NotImplementedError(
      'Method "debug" must be implemented by subclass',
      {
        methodName: "debug",
        interfaceName: "LoggerPort",
        details: {
          expectedImplementation:
            "Logger adapter must implement debug() method",
          logLevel: "debug",
        },
      }
    );
  }

  /**
   * Log trace level messages (Pino-specific, mapped by other adapters)
   * @param {string} message - The log message
   * @param {Object} [meta={}] - Additional metadata
   */
  trace(message, meta = {}) {
    throw new NotImplementedError(
      'Method "trace" must be implemented by subclass',
      {
        methodName: "trace",
        interfaceName: "LoggerPort",
        details: {
          expectedImplementation:
            "Logger adapter must implement trace() method",
          logLevel: "trace",
        },
      }
    );
  }
}
