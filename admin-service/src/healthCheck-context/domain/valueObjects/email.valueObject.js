/**
 * Email Value Object
 *
 * Represents an email address in the domain.
 * As a value object, it is immutable and provides validation and equality by value.
 */

class Email {
  #value;

  /**
   * Creates a new Email value object
   * Flow:
   * 1. Validates the email format
   * 2. Normalizes and stores the email
   *
   * @param {string} email - The email address
   * @throws {Error} If email format is invalid
   */
  constructor(email) {
    // STEP 1: Validate email format
    if (!email) {
      throw new Error("Email cannot be empty");
    }

    // Use regex to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // STEP 2: Normalize and store the email
    // Store as lowercase to ensure case-insensitive comparisons
    this.#value = email.toLowerCase();

    // Freeze the object to enforce immutability
    Object.freeze(this);
  }

  /**
   * Gets the email value
   * @returns {string} The email address
   */
  get value() {
    return this.#value;
  }

  /**
   * Checks if this email equals another email
   * @param {Email} other - Another Email value object to compare
   * @returns {boolean} True if emails are equal, false otherwise
   */
  equals(other) {
    if (!(other instanceof Email)) {
      return false;
    }

    return this.#value === other.value;
  }

  /**
   * Returns the domain part of the email
   * @returns {string} The domain part of the email
   */
  getDomain() {
    return this.#value.split("@")[1];
  }

  /**
   * Returns the local part of the email (before @)
   * @returns {string} The local part of the email
   */
  getLocalPart() {
    return this.#value.split("@")[0];
  }

  /**
   * Creates a string representation of the email
   * @returns {string} The email address
   */
  toString() {
    return this.#value;
  }

  /**
   * Factory method to create an Email from a string if valid
   * @param {string} email - The email address
   * @returns {Email|null} A new Email instance or null if invalid
   */
  static create(email) {
    try {
      return new Email(email);
    } catch (error) {
      return null;
    }
  }
}

module.exports = Email;
