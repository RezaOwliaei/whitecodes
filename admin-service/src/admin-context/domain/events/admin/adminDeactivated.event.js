/**
 * Admin Deactivated Event
 *
 * Represents the fact that an admin has been deactivated in the system.
 * Contains the ID of the deactivated admin and when the deactivation occurred.
 */

const DomainEvent = require("../../types/domainEvent.base");

class AdminDeactivatedEvent extends DomainEvent {
  /**
   * Event type constant for AdminDeactivated events
   * @type {string}
   */
  static TYPE = "admin.deactivated";

  /**
   * Creates a new AdminDeactivatedEvent
   * Flow:
   * 1. Validate required fields
   * 2. Initialize event with type and data
   *
   * @param {Object} data - Admin deactivation data
   * @param {string} data.adminId - The ID of the deactivated admin
   * @param {Date} data.deactivatedAt - When the admin was deactivated
   */
  constructor(data) {
    // STEP 1: Validate required fields
    if (!data.adminId) {
      throw new Error("Admin ID is required for AdminDeactivatedEvent");
    }

    // STEP 2: Initialize event with type and data
    super(AdminDeactivatedEvent.TYPE, {
      adminId: data.adminId,
      deactivatedAt: data.deactivatedAt || new Date(),
      reason: data.reason || "Manual deactivation", // Optional reason field
    });
  }
}

module.exports = AdminDeactivatedEvent;
