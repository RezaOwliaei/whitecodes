/**
 * Admin Factory
 *
 * Encapsulates complex creation logic for Admin aggregates.
 * Ensures all invariants are met during admin creation.
 */

const AdminAggregate = require("../aggregates/admin.aggregate");
const AdminId = require("../valueObjects/adminId.valueObject");
const Email = require("../valueObjects/email.valueObject");
const PasswordFactory = require("./password.factory");
const mustHaveValidRoleRule = require("../invariants/admin/mustHaveValidRole.rule");

class AdminFactory {
  #passwordFactory;

  /**
   * Creates a new AdminFactory instance
   * Flow:
   * 1. Initialize password factory for password creation
   */
  constructor() {
    this.#passwordFactory = new PasswordFactory();
  }

  /**
   * Creates a new Admin aggregate with default values and validation
   * Flow:
   * 1. Generate a new AdminId if not provided
   * 2. Validate email format
   * 3. Create password using PasswordFactory
   * 4. Validate roles
   * 5. Create admin aggregate with the creation event
   *
   * @param {Object} params - Admin creation parameters
   * @param {string} [params.id] - Optional admin ID (generated if not provided)
   * @param {string} params.email - Admin email address
   * @param {string} params.password - Admin password
   * @param {Array} params.roles - Roles to assign to the admin
   * @returns {AdminAggregate} A new Admin aggregate
   * @throws {Error} If validation fails
   */
  createAdmin({ id, email, password, roles = [] }) {
    // STEP 1: Generate a new AdminId if not provided
    const adminId = id ? new AdminId(id) : AdminId.generate();

    // STEP 2: Validate email format
    const emailVO = new Email(email);

    // STEP 3: Create password using PasswordFactory (handles all password validation)
    const passwordVO = this.#passwordFactory.createPassword(password);

    // STEP 4: Validate roles
    mustHaveValidRoleRule.validate(roles);

    // STEP 5: Create admin aggregate with the creation event
    const event = {
      type: "admin.created",
      data: {
        adminId: adminId.value,
        email: emailVO.value,
        passwordHash: passwordVO.value,
        roles,
        status: "active",
        createdAt: new Date(),
      },
      timestamp: new Date(),
    };

    // Create aggregate with the event to initialize state
    return new AdminAggregate([event]);
  }

  /**
   * Creates a new Admin aggregate with detailed validation feedback
   * Flow:
   * 1. Attempt to create admin with full validation
   * 2. Return detailed result with success status and errors
   *
   * @param {Object} params - Admin creation parameters
   * @returns {Object} Result object with success flag, admin, and errors
   */
  createAdminWithFeedback({ id, email, password, roles = [] }) {
    try {
      // Use password factory for detailed password feedback
      const passwordResult =
        this.#passwordFactory.createPasswordWithFeedback(password);

      if (!passwordResult.success) {
        return {
          success: false,
          admin: null,
          errors: passwordResult.errors,
          passwordStrength: passwordResult.strength,
        };
      }

      // Create admin with validated components
      const admin = this.createAdmin({ id, email, password, roles });

      return {
        success: true,
        admin,
        errors: [],
        passwordStrength: passwordResult.strength,
      };
    } catch (error) {
      return {
        success: false,
        admin: null,
        errors: [error.message],
        passwordStrength: 0,
      };
    }
  }

  /**
   * Reconstructs an Admin aggregate from historical events
   * Flow:
   * 1. Create an empty Admin aggregate
   * 2. Apply all historical events to rebuild state
   * 3. Return the reconstructed Admin aggregate
   *
   * @param {Array} events - Array of historical domain events
   * @returns {AdminAggregate} Reconstructed Admin aggregate
   * @throws {Error} If events array is empty or invalid
   */
  reconstitute(events) {
    if (!events || !Array.isArray(events) || events.length === 0) {
      throw new Error("Cannot reconstitute Admin from empty events array");
    }

    // Create a new Admin aggregate and apply all historical events
    return new AdminAggregate(events);
  }
}

module.exports = AdminFactory;
