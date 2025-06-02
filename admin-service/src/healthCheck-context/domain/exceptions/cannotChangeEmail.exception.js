/**
 * Cannot Change Email Exception
 *
 * Represents a domain violation where an attempt was made to change an admin's email.
 * This is a business rule violation that is handled as a domain exception.
 */

class CannotChangeEmailException extends Error {
  /**
   * Creates a new CannotChangeEmailException
   * Flow:
   * 1. Set error message with context
   * 2. Store original and attempted emails
   *
   * @param {string} originalEmail - The admin's original email
   * @param {string} attemptedEmail - The email that was attempted to be set
   */
  constructor(originalEmail, attemptedEmail) {
    // STEP 1: Set error message with context
    super(
      `Cannot change admin email from "${originalEmail}" to "${attemptedEmail}". Email changes are not allowed.`
    );

    // Set the name for better error identification
    this.name = "CannotChangeEmailException";

    // STEP 2: Store original and attempted emails
    this.originalEmail = originalEmail;
    this.attemptedEmail = attemptedEmail;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CannotChangeEmailException);
    }
  }

  /**
   * Creates a JSON representation of the exception
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      originalEmail: this.originalEmail,
      attemptedEmail: this.attemptedEmail,
    };
  }

  /**
   * Checks if this exception is related to a specific email
   * @param {string} email - The email to check
   * @returns {boolean} True if the exception involves the given email
   */
  involvesEmail(email) {
    return this.originalEmail === email || this.attemptedEmail === email;
  }

  /**
   * Gets a user-friendly error message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    return "Email addresses cannot be changed once set. Please contact support if you need to use a different email address.";
  }
}

module.exports = CannotChangeEmailException;
