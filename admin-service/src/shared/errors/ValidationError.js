// ValidationError.js
// Custom error for validation failures with automatic caller detection.

import { BaseError } from "./BaseError.js";

class ValidationError extends BaseError {
  /**
   * Creates a validation error with automatic caller context detection.
   *
   * Flow:
   * 1. Accepts message and optional validation details
   * 2. Inherits automatic caller detection from BaseError
   * 3. Adds validation-specific properties
   *
   * @param {string} message - Error message.
   * @param {object} [options] - Configuration options
   * @param {string} [options.component] - Manual component override (auto-detected if not provided)
   * @param {string} [options.operation] - Manual operation override (auto-detected if not provided)
   * @param {object} [options.details] - Additional context or details
   * @param {string} [options.field] - The field that failed validation
   * @param {*} [options.value] - The invalid value
   * @param {string} [options.rule] - The validation rule that failed
   * @param {number} [options.stackDepth] - Stack depth for caller detection (default: 1)
   */
  constructor(message, options = {}) {
    // Call BaseError constructor which handles all the stack parsing logic
    super(message, options);

    // Add validation-specific properties
    this.field = options.field || null;
    this.value = options.value !== undefined ? options.value : null;
    this.rule = options.rule || null;
  }
}

export { ValidationError };
