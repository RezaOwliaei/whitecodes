/**
 * Deactivate Admin Command
 * Pure data object modeling the intent to deactivate an admin
 */

export class DeactivateAdminCommand {
  constructor(data) {
    this.adminId = data.adminId;
    this.reason = data.reason;
    this.deactivatedBy = data.deactivatedBy;
    this.timestamp = new Date();
  }
}
