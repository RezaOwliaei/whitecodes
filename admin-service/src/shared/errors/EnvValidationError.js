// EnvValidationError.js
// Custom error for environment variable validation failures.

class EnvValidationError extends Error {
  /**
   * @param {string} message - Error message.
   * @param {string} [variable] - Name of the environment variable that caused the error.
   * @param {object} [details] - Additional context or details.
   */
  constructor(message, variable, details = {}) {
    super(message);
    this.name = "EnvValidationError";
    this.variable = variable ?? null;
    this.details = Object.keys(details).length ? details : null;
    Error.captureStackTrace?.(this, EnvValidationError);
  }
}

export { EnvValidationError };
