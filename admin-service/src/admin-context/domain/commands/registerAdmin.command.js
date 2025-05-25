/**
 * Register Admin Command
 *
 * Represents the intent to register a new admin in the system.
 * Contains all the data needed to create a new admin.
 */

class RegisterAdminCommand {
  /**
   * Creates a new RegisterAdminCommand
   * Flow:
   * 1. Validate required fields
   * 2. Store command data
   *
   * @param {Object} data - Command data
   * @param {string} data.email - The email of the admin to register
   * @param {string} data.password - The password for the admin
   * @param {Array} data.roles - The roles to assign to the admin
   * @param {string} [data.firstName] - The first name of the admin
   * @param {string} [data.lastName] - The last name of the admin
   */
  constructor(data) {
    // STEP 1: Validate required fields
    if (!data.email) {
      throw new Error("Email is required for RegisterAdminCommand");
    }

    if (!data.password) {
      throw new Error("Password is required for RegisterAdminCommand");
    }

    // STEP 2: Store command data
    this.email = data.email;
    this.password = data.password;
    this.roles = data.roles || [];
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.metadata = {
      timestamp: new Date(),
      commandId: this.#generateCommandId(),
    };

    // Freeze the object to enforce immutability
    Object.freeze(this);
  }

  /**
   * Validates the command data
   * @returns {boolean} True if the command is valid, throws otherwise
   * @throws {Error} If validation fails
   */
  validate() {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error("Invalid email format");
    }

    // Password validation (basic check - detailed validation happens in value object)
    if (
      !this.password ||
      typeof this.password !== "string" ||
      this.password.trim() === ""
    ) {
      throw new Error("Password cannot be empty");
    }

    // Roles validation
    if (!Array.isArray(this.roles) || this.roles.length === 0) {
      throw new Error("At least one role must be specified");
    }

    return true;
  }

  /**
   * Generates a unique ID for this command
   * @returns {string} A unique command ID
   * @private
   */
  #generateCommandId() {
    // Simple implementation for example purposes
    return `cmd-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Creates a plain object representation of the command
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      email: this.email,
      roles: [...this.roles],
      firstName: this.firstName,
      lastName: this.lastName,
      metadata: { ...this.metadata },
    };
  }
}

module.exports = RegisterAdminCommand;
