/**
 * Data Transfer Object for admin deactivation requests
 * Flow:
 * 1. Validates and structures incoming admin deactivation data
 * 2. Used by admin deactivation controller to validate request payload
 * 3. Passed to application service for admin deactivation
 */
export class AdminRequestDeactivateDto {
  /**
   * @param {Object} data - Raw request data
   * @param {string} data.reason - Reason for deactivation
   * @param {string} [data.notes] - Additional notes about deactivation
   * @throws {Error} If required fields are missing or invalid
   */
  constructor({ reason, notes = "" }) {
    // VALIDATION: Required fields
    if (!reason) throw new Error("Deactivation reason is required");
    if (reason.trim().length < 10) {
      throw new Error(
        "Deactivation reason must be at least 10 characters long"
      );
    }

    // ASSIGNMENT: Set validated fields
    this.reason = reason.trim();
    this.notes = notes.trim();
    this.deactivatedAt = new Date().toISOString();
  }

  /**
   * Returns a plain object representation of the DTO
   * @returns {Object} Plain object with DTO data
   */
  toJSON() {
    return {
      reason: this.reason,
      notes: this.notes,
      deactivatedAt: this.deactivatedAt,
    };
  }
}
