/**
 * CreateAdmin Command
 * Represents the intent to create a new admin user
 */
class CreateAdminCommand {
  constructor(data) {
    this.userId = data.userId;
    this.email = data.email;
    this.fullName = data.fullName;
    this.roleId = data.roleId;
    this.metadata = data.metadata || {};
    this.createdBy = data.createdBy;
  }
}

module.exports = CreateAdminCommand;
