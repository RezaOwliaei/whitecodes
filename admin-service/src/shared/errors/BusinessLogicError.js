// BusinessLogicError.js
// Custom error for business logic violations with automatic caller detection.

import { BaseError } from "./BaseError.js";

class BusinessLogicError extends BaseError {
  /**
   * Creates a business logic error with automatic caller context detection.
   *
   * Flow:
   * 1. Accepts message and optional business context
   * 2. Inherits automatic caller detection from BaseError
   * 3. Adds business logic-specific properties
   *
   * @param {string} message - Error message.
   * @param {object} [options] - Configuration options
   * @param {string} [options.component] - Manual component override (auto-detected if not provided)
   * @param {string} [options.operation] - Manual operation override (auto-detected if not provided)
   * @param {object} [options.details] - Additional context or details
   * @param {string} [options.businessRule] - The business rule that was violated
   * @param {string} [options.entityType] - The type of entity involved
   * @param {string} [options.entityId] - The ID of the entity involved
   * @param {number} [options.stackDepth] - Stack depth for caller detection (default: 1)
   */
  constructor(message, options = {}) {
    // Call BaseError constructor which handles all the stack parsing logic
    super(message, options);

    // Add business logic-specific properties
    this.businessRule = options.businessRule || null;
    this.entityType = options.entityType || null;
    this.entityId = options.entityId || null;
  }
}

export { BusinessLogicError };
