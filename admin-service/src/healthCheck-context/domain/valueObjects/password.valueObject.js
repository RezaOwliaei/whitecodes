/**
 * Password Value Object
 *
 * Represents a password in the domain.
 * As a value object, it is immutable and provides validation using the password policy rule.
 * Stores the hashed password for security.
 *
 * Note: Complex creation logic is handled by PasswordFactory as per README requirements.
 */

import { validate } from "../invariants/admin/passwordPolicy.rule.js";
import { createHash } from "crypto";

class Password {
  #hashedValue;
  #createdAt;

  /**
   * Creates a new Password value object
   * Flow:
   * 1. Validates the password using password policy rule
   * 2. Hashes the password for secure storage
   * 3. Stores the hashed password
   *
   * @param {string} plainPassword - The plain text password
   * @throws {Error} If password doesn't meet policy requirements
   */
  constructor(plainPassword) {
    // STEP 1: Validate password using password policy rule
    validate(plainPassword);

    // STEP 2: Hash the password for secure storage
    this.#hashedValue = this.#hashPassword(plainPassword);

    // STEP 3: Store metadata
    this.#createdAt = new Date();

    // Freeze the object to enforce immutability
    Object.freeze(this);
  }

  /**
   * Gets the hashed password value
   * @returns {string} The hashed password
   */
  get value() {
    return this.#hashedValue;
  }

  /**
   * Gets the creation timestamp
   * @returns {Date} When the password was created
   */
  get createdAt() {
    return this.#createdAt;
  }

  /**
   * Verifies if a plain text password matches this password
   * @param {string} plainPassword - The plain text password to verify
   * @returns {boolean} True if passwords match, false otherwise
   */
  verify(plainPassword) {
    if (!plainPassword) {
      return false;
    }

    // Hash the provided password and compare with stored hash
    const hashedInput = this.#hashPassword(plainPassword);
    return hashedInput === this.#hashedValue;
  }

  /**
   * Checks if this password equals another password
   * @param {Password} other - Another Password value object to compare
   * @returns {boolean} True if passwords are equal, false otherwise
   */
  equals(other) {
    if (!(other instanceof Password)) {
      return false;
    }

    return this.#hashedValue === other.value;
  }

  /**
   * Creates a Password instance from an already hashed password
   * Used when reconstructing from stored data
   * @param {string} hashedPassword - The already hashed password
   * @param {Date} [createdAt] - When the password was created
   * @returns {Password} A new Password instance
   */
  static fromHash(hashedPassword, createdAt = new Date()) {
    const password = Object.create(Password.prototype);
    password.#hashedValue = hashedPassword;
    password.#createdAt = createdAt;
    Object.freeze(password);
    return password;
  }

  /**
   * Hashes a plain text password
   * @param {string} plainPassword - The plain text password
   * @returns {string} The hashed password
   * @private
   */
  #hashPassword(plainPassword) {
    // Simple hash implementation for example purposes
    // In production, use a proper hashing library like bcrypt
    return createHash("sha256")
      .update(plainPassword + "salt")
      .digest("hex");
  }

  /**
   * Creates a string representation (masked for security)
   * @returns {string} Masked password representation
   */
  toString() {
    return "[PROTECTED]";
  }
}

export default Password;
