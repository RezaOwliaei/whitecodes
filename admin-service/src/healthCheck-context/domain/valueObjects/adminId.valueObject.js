/**
 * AdminId Value Object
 *
 * Represents a unique identifier for an Admin in the domain.
 * As a value object, it is immutable and provides validation and equality by value.
 */

class AdminId {
  #value;

  /**
   * Creates a new AdminId value object
   * Flow:
   * 1. Validates the ID format
   * 2. Stores the ID
   *
   * @param {string} id - The admin identifier
   * @throws {Error} If ID format is invalid
   */
  constructor(id) {
    // STEP 1: Validate ID format
    if (!id) {
      throw new Error("Admin ID cannot be empty");
    }

    // Additional validation can be added here (UUID format, etc.)
    // For example, UUID validation regex:
    // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // if (!uuidRegex.test(id)) {
    //   throw new Error('Invalid Admin ID format, must be a valid UUID');
    // }

    // STEP 2: Store the ID
    this.#value = id;

    // Freeze the object to enforce immutability
    Object.freeze(this);
  }

  /**
   * Gets the ID value
   * @returns {string} The admin ID
   */
  get value() {
    return this.#value;
  }

  /**
   * Checks if this ID equals another ID
   * @param {AdminId} other - Another AdminId value object to compare
   * @returns {boolean} True if IDs are equal, false otherwise
   */
  equals(other) {
    if (!(other instanceof AdminId)) {
      return false;
    }

    return this.#value === other.value;
  }

  /**
   * Creates a string representation of the ID
   * @returns {string} The admin ID
   */
  toString() {
    return this.#value;
  }

  /**
   * Factory method to create an AdminId from a string if valid
   * @param {string} id - The admin identifier
   * @returns {AdminId|null} A new AdminId instance or null if invalid
   */
  static create(id) {
    try {
      return new AdminId(id);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generates a new random ID (implementation would depend on your ID strategy)
   * @returns {AdminId} A new AdminId instance with a random value
   */
  static generate() {
    // This is a placeholder. In a real implementation, you would:
    // 1. Generate a UUID or other unique identifier
    // 2. Return a new AdminId with that value

    // Example using node's crypto module (not included here)
    // const { randomUUID } = require('crypto');
    // return new AdminId(randomUUID());

    // For this example, we'll return a timestamp-based ID
    const timestamp = Date.now().toString();
    return new AdminId(`admin-${timestamp}`);
  }
}

module.exports = AdminId;
