/**
 * Admin Aggregate
 *
 * This is the aggregate root for the Admin context. It enforces business rules
 * and coordinates domain entities and value objects within its boundary.
 * Following event sourcing principles, it emits domain events instead of directly
 * applying state changes.
 */

import AdminCreatedEvent from "../events/admin/adminCreated.event.js";
import AdminDeactivatedEvent from "../events/admin/adminDeactivated.event.js";
import { validate as validateCannotChangeEmail } from "../invariants/admin/cannotChangeEmail.rule.js";
import { validate as validateMustHaveValidRole } from "../invariants/admin/mustHaveValidRole.rule.js";
import { StatusEnum } from "../types/status.enum.js";
import AdminId from "../valueObjects/adminId.valueObject.js";
import Email from "../valueObjects/email.valueObject.js";
import Password from "../valueObjects/password.valueObject.js";
import PasswordFactory from "../factories/password.factory.js";

class AdminAggregate {
  #id;
  #email;
  #password;
  #roles;
  #status;
  #lastLogin;
  #createdAt;
  #updatedAt;
  #passwordFactory;

  /**
   * Creates a new Admin instance
   * Flow:
   * 1. Initialize with default state
   * 2. Set ID to null (will be assigned when applying events)
   * 3. Initialize password factory for password operations
   *
   * @param {Array} events - Optional historical events to reconstruct state
   */
  constructor(events = []) {
    this.#id = null;
    this.#email = null;
    this.#password = null;
    this.#roles = [];
    this.#status = StatusEnum.INACTIVE;
    this.#lastLogin = null;
    this.#createdAt = null;
    this.#updatedAt = null;

    // Initialize password factory for password operations
    this.#passwordFactory = new PasswordFactory();

    // Apply historical events to rebuild state if provided
    if (events && events.length) {
      events.forEach((event) => this.#applyEvent(event));
    }
  }

  /**
   * Gets the ID of the admin
   * @returns {string|null} The admin ID
   */
  get id() {
    return this.#id ? this.#id.value : null;
  }

  /**
   * Gets the email of the admin
   * @returns {string|null} The admin email
   */
  get email() {
    return this.#email ? this.#email.value : null;
  }

  /**
   * Gets the roles of the admin
   * @returns {Array} The admin roles
   */
  get roles() {
    return [...this.#roles];
  }

  /**
   * Gets the status of the admin
   * @returns {string} The admin status
   */
  get status() {
    return this.#status;
  }

  /**
   * Verifies a password against the stored password
   * @param {string} plainPassword - The plain text password to verify
   * @returns {boolean} True if password matches
   */
  verifyPassword(plainPassword) {
    if (!this.#password) {
      return false;
    }
    return this.#password.verify(plainPassword);
  }

  /**
   * Creates a new admin
   * Flow:
   * 1. Validate input parameters
   * 2. Create and return AdminCreatedEvent
   *
   * @param {Object} params - Parameters for creating an admin
   * @param {string} params.id - The admin ID
   * @param {string} params.email - The admin email
   * @param {string} params.password - The admin password
   * @param {Array} params.roles - The admin roles
   * @returns {Object} Event representing the admin creation
   */
  createAdmin({ id, email, password, roles }) {
    // Validate inputs using value objects (which handle validation)
    const adminId = new AdminId(id);
    const emailVO = new Email(email);

    // Use password factory for password creation and validation
    const passwordVO = this.#passwordFactory.createPassword(password);

    // Validate roles using domain rule
    validateMustHaveValidRole(roles);

    // Create and return event (doesn't modify state directly)
    return new AdminCreatedEvent({
      adminId: adminId.value,
      email: emailVO.value,
      passwordHash: passwordVO.value,
      roles,
      status: StatusEnum.ACTIVE,
      createdAt: new Date(),
    });
  }

  /**
   * Changes the admin's password
   * Flow:
   * 1. Verify admin exists
   * 2. Use password factory to create and validate new password
   * 3. Create and return PasswordChangedEvent
   *
   * @param {string} newPassword - The new password
   * @returns {Object} Event representing the password change
   * @throws {Error} If admin doesn't exist or password is invalid
   */
  changePassword(newPassword) {
    // Verify admin exists
    if (!this.#id) {
      throw new Error("Cannot change password for non-existent admin");
    }

    // Use password factory to create and validate new password
    const passwordVO = this.#passwordFactory.createPassword(newPassword);

    // Create and return event (doesn't modify state directly)
    // Note: This would require creating a PasswordChangedEvent
    return {
      type: "admin.passwordChanged",
      data: {
        adminId: this.#id.value,
        passwordHash: passwordVO.value,
        changedAt: new Date(),
      },
      timestamp: new Date(),
    };
  }

  /**
   * Deactivates an admin
   * Flow:
   * 1. Verify admin exists
   * 2. Create and return AdminDeactivatedEvent
   *
   * @returns {Object} Event representing the admin deactivation
   * @throws {Error} If admin doesn't exist
   */
  deactivateAdmin() {
    // Verify admin exists
    if (!this.#id) {
      throw new Error("Cannot deactivate non-existent admin");
    }

    // Create and return event (doesn't modify state directly)
    return new AdminDeactivatedEvent({
      adminId: this.#id.value,
      deactivatedAt: new Date(),
    });
  }

  /**
   * Applies an event to update the aggregate state
   * Flow:
   * 1. Route to specific event handler based on event type
   * 2. Update internal state based on event data
   *
   * @param {Object} event - The domain event to apply
   * @private
   */
  #applyEvent(event) {
    switch (event.type) {
      case AdminCreatedEvent.TYPE:
        this.#applyAdminCreatedEvent(event);
        break;
      case AdminDeactivatedEvent.TYPE:
        this.#applyAdminDeactivatedEvent(event);
        break;
      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
  }

  /**
   * Applies an AdminCreatedEvent to update state
   * @param {AdminCreatedEvent} event - The admin created event
   * @private
   */
  #applyAdminCreatedEvent(event) {
    this.#id = new AdminId(event.data.adminId);
    this.#email = new Email(event.data.email);
    this.#password = Password.fromHash(event.data.passwordHash);
    this.#roles = [...event.data.roles];
    this.#status = event.data.status;
    this.#createdAt = event.data.createdAt;
    this.#updatedAt = event.data.createdAt;
  }

  /**
   * Applies an AdminDeactivatedEvent to update state
   * @param {AdminDeactivatedEvent} event - The admin deactivated event
   * @private
   */
  #applyAdminDeactivatedEvent(event) {
    this.#status = StatusEnum.INACTIVE;
    this.#updatedAt = event.data.deactivatedAt;
  }
}

export default AdminAggregate;
