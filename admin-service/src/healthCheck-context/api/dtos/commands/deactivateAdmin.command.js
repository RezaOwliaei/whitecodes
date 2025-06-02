/**
 * Deactivate Admin Command DTO
 * Data Transfer Object for deactivating an admin
 */

export class DeactivateAdminCommand {
  constructor(data) {
    this.adminId = data.adminId;
    this.reason = data.reason;
    this.deactivatedBy = data.deactivatedBy;
  }
}
