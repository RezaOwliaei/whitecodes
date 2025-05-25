/**
 * Admin Created Event
 *
 * Represents the fact that a new admin has been created in the system.
 * Contains all the initial state data for the admin.
 */

const DomainEvent = require("../../types/domainEvent.base");

class AdminCreatedEvent extends DomainEvent {
  /**
   * Event type constant for AdminCreated events
   * @type {string}
   */
  static TYPE = "admin.created";

  /**
   * Creates a new AdminCreatedEvent
   * Flow:
   * 1. Validate required fields
   * 2. Initialize event with type and data
   *
   * @param {Object} data - Admin creation data
   * @param {string} data.adminId - The ID of the created admin
   * @param {string} data.email - The email of the created admin
   * @param {string} data.passwordHash - The hashed password of the admin
   * @param {Array} data.roles - The roles assigned to the admin
   * @param {string} data.status - The initial status of the admin
   * @param {Date} data.createdAt - When the admin was created
   */
  constructor(data) {
    // STEP 1: Validate required fields
    if (!data.adminId) {
      throw new Error("Admin ID is required for AdminCreatedEvent");
    }
    if (!data.email) {
      throw new Error("Email is required for AdminCreatedEvent");
    }
    if (!data.passwordHash) {
      throw new Error("Password hash is required for AdminCreatedEvent");
    }

    // STEP 2: Initialize event with type and data
    super(AdminCreatedEvent.TYPE, {
      adminId: data.adminId,
      email: data.email,
      passwordHash: data.passwordHash,
      roles: data.roles || [],
      status: data.status,
      createdAt: data.createdAt || new Date(),
    });
  }
}

module.exports = AdminCreatedEvent;
