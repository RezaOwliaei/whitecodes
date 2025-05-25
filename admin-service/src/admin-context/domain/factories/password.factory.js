/**
 * Password Factory
 *
 * Encapsulates complex creation logic for Password value objects.
 * Ensures all password policy invariants are met during creation.
 */

import Password from "../valueObjects/password.valueObject.js";
import {
  validate,
  getValidationDetails,
  calculateStrength,
} from "../invariants/admin/passwordPolicy.rule.js";

class PasswordFactory {
  /**
   * Creates a new Password value object with full validation
   * Flow:
   * 1. Validate password using password policy rule
   * 2. Create and return Password value object
   *
   * @param {string} plainPassword - The plain text password to create
   * @returns {Password} A new Password value object
   * @throws {Error} If password doesn't meet policy requirements
   */
  createPassword(plainPassword) {
    // STEP 1: Validate password using password policy rule
    validate(plainPassword);

    // STEP 2: Create and return Password value object
    return new Password(plainPassword);
  }

  /**
   * Creates a Password value object safely (returns null if invalid)
   * Flow:
   * 1. Attempt to create password with validation
   * 2. Return null if validation fails
   *
   * @param {string} plainPassword - The plain text password to create
   * @returns {Password|null} A new Password instance or null if invalid
   */
  createPasswordSafely(plainPassword) {
    try {
      return this.createPassword(plainPassword);
    } catch (error) {
      return null;
    }
  }

  /**
   * Creates a Password value object with detailed validation feedback
   * Flow:
   * 1. Get detailed validation results
   * 2. Calculate password strength
   * 3. Return result object with password or errors
   *
   * @param {string} plainPassword - The plain text password to create
   * @returns {Promise<Object>} Result object with success flag, password, and errors
   */
  async createPasswordWithFeedback(plainPassword) {
    const validationResult = getValidationDetails(plainPassword);

    if (validationResult.isValid) {
      return {
        success: true,
        password: new Password(plainPassword),
        errors: [],
        strength: await calculateStrength(plainPassword),
      };
    }

    return {
      success: false,
      password: null,
      errors: validationResult.errors,
      strength: await calculateStrength(plainPassword),
    };
  }

  /**
   * Reconstructs a Password value object from stored hash
   * Used when loading from persistence layer
   * Flow:
   * 1. Validate hash exists
   * 2. Create Password from hash
   *
   * @param {string} hashedPassword - The already hashed password
   * @param {Date} [createdAt] - When the password was created
   * @returns {Password} A reconstructed Password instance
   * @throws {Error} If hash is invalid
   */
  fromHash(hashedPassword, createdAt = new Date()) {
    if (!hashedPassword || typeof hashedPassword !== "string") {
      throw new Error("Password hash is required for reconstruction");
    }

    return Password.fromHash(hashedPassword, createdAt);
  }

  /**
   * Validates a password without creating the value object
   * @param {string} plainPassword - The plain text password to validate
   * @returns {Object} Validation result with success flag and error messages
   */
  validatePassword(plainPassword) {
    return getValidationDetails(plainPassword);
  }

  /**
   * Calculates the strength of a password
   * @param {string} plainPassword - The plain text password to evaluate
   * @returns {Promise<number>} Password strength score (0-100)
   */
  async calculatePasswordStrength(plainPassword) {
    return await calculateStrength(plainPassword);
  }
}

export default PasswordFactory;
