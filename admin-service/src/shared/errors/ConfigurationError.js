// ConfigurationError.js
// Custom error for component configuration failures with automatic caller detection.

import { BaseError } from "./BaseError.js";

class ConfigurationError extends BaseError {
  /**
   * Creates a configuration error with automatic caller context detection.
   *
   * Flow:
   * 1. Accepts message and optional details
   * 2. Inherits automatic caller detection from BaseError
   * 3. Sets component and operation from detected context
   * 4. Allows manual override if needed
   *
   * @param {string} message - Error message.
   * @param {object} [options] - Configuration options
   * @param {string} [options.component] - Manual component override (auto-detected if not provided)
   * @param {string} [options.operation] - Manual operation override (auto-detected if not provided)
   * @param {object} [options.details] - Additional context or details
   * @param {number} [options.stackDepth] - Stack depth for caller detection (default: 1)
   */
  constructor(message, options = {}) {
    // Call BaseError constructor which handles all the stack parsing logic
    super(message, options);
  }
}

export { ConfigurationError };
