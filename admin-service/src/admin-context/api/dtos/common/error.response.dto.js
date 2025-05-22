/**
 * Standardized error response DTO
 * Flow:
 * 1. Used by error handling middleware to format errors
 * 2. Provides consistent error structure across API
 * 3. Maps internal errors to client-safe responses
 */
export class ErrorResponseDto {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - Error message
   * @param {Object[]} [details] - Additional error details
   * @param {string} [code] - Error code for client handling
   */
  constructor(status, message, details = [], code = null) {
    this.status = status;
    this.message = message;
    this.details = details;
    this.timestamp = new Date().toISOString();
    if (code) {
      this.code = code;
    }
  }

  /**
   * Returns a plain object representation of the error
   * @returns {Object} Formatted error response
   */
  toJSON() {
    return {
      status: this.status,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      ...(this.code && { code: this.code }),
    };
  }
}
