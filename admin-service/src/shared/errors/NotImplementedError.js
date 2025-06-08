// NotImplementedError.js
// Custom error for unimplemented methods and abstract functionality with automatic caller detection.

import { BaseError } from "./BaseError.js";

class NotImplementedError extends BaseError {
  /**
   * Creates a not implemented error with automatic caller context detection.
   *
   * Flow:
   * 1. Accepts message and optional implementation details
   * 2. Inherits automatic caller detection from BaseError
   * 3. Adds implementation-specific properties
   *
   * @param {string} message - Error message.
   * @param {object} [options] - Configuration options
   * @param {string} [options.component] - Manual component override (auto-detected if not provided)
   * @param {string} [options.operation] - Manual operation override (auto-detected if not provided)
   * @param {object} [options.details] - Additional context or details
   * @param {string} [options.methodName] - The method that is not implemented
   * @param {string} [options.className] - The class that should implement the method
   * @param {string} [options.interfaceName] - The interface/port that defines the contract
   * @param {number} [options.stackDepth] - Stack depth for caller detection (default: 1)
   */
  constructor(message, options = {}) {
    // Call BaseError constructor which handles all the stack parsing logic
    super(message, options);

    // Add implementation-specific properties
    this.methodName = options.methodName || null;
    this.className = options.className || null;
    this.interfaceName = options.interfaceName || null;
  }
}

export { NotImplementedError };
