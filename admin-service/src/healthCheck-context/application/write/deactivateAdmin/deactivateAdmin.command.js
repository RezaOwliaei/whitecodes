/**
 * DeactivateAdmin Command
 * Represents the intent to deactivate an existing admin user
 */
class DeactivateAdminCommand {
  constructor(data) {
    this.adminId = data.adminId;
    this.reason = data.reason;
    this.deactivatedBy = data.deactivatedBy;
  }
}

module.exports = DeactivateAdminCommand;
