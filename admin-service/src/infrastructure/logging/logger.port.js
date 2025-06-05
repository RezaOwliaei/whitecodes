/**
 * LoggerPort defines the contract for all logger adapters.
 * This is an abstract class and should be extended by concrete logger adapters.
 * Each method should be implemented by the subclass.
 */
export class LoggerPort {
  error(message, meta) {
    throw new Error('Method "error" must be implemented by subclass');
  }
  warn(message, meta) {
    throw new Error('Method "warn" must be implemented by subclass');
  }
  info(message, meta) {
    throw new Error('Method "info" must be implemented by subclass');
  }
  http(message, meta) {
    throw new Error('Method "http" must be implemented by subclass');
  }
  verbose(message, meta) {
    throw new Error('Method "verbose" must be implemented by subclass');
  }
  debug(message, meta) {
    throw new Error('Method "debug" must be implemented by subclass');
  }
}
