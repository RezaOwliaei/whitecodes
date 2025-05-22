/**
 * Data Transfer Object for admin profile responses
 * Flow:
 * 1. Transforms internal admin entity to client-safe format
 * 2. Used by admin controllers to format response data
 * 3. Ensures consistent admin profile representation across API
 */
export class AdminResponseProfileDto {
  /**
   * @param {Object} admin - Internal admin entity
   * @param {string} admin.id - Admin's unique identifier
   * @param {string} admin.email - Admin's email address
   * @param {string} admin.firstName - Admin's first name
   * @param {string} admin.lastName - Admin's last name
   * @param {Date} admin.createdAt - Admin creation timestamp
   * @param {Date} [admin.lastLoginAt] - Last login timestamp
   * @param {boolean} admin.isActive - Admin active status
   * @param {Object} [admin.deactivationInfo] - Deactivation information if admin is inactive
   */
  constructor(admin) {
    // TRANSFORM: Map entity to DTO fields
    this.id = admin.id;
    this.email = admin.email;
    this.fullName = `${admin.firstName} ${admin.lastName}`;
    this.createdAt = admin.createdAt.toISOString();
    this.lastLoginAt = admin.lastLoginAt
      ? admin.lastLoginAt.toISOString()
      : null;
    this.isActive = admin.isActive;

    // CONDITIONAL: Include deactivation info if present
    if (admin.deactivationInfo) {
      this.deactivationInfo = {
        reason: admin.deactivationInfo.reason,
        deactivatedAt: admin.deactivationInfo.deactivatedAt.toISOString(),
      };
    }
  }

  /**
   * Returns a plain object representation of the DTO
   * @returns {Object} Plain object with DTO data
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
      isActive: this.isActive,
      ...(this.deactivationInfo && { deactivationInfo: this.deactivationInfo }),
    };
  }
}
