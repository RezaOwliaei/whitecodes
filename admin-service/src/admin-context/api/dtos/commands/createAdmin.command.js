/**
 * Create Admin Command DTO
 * Represents the command to create a new admin user
 */

export class CreateAdminCommand {
  constructor(data) {
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role;
    this.timestamp = new Date();
  }

  validate() {
    if (!this.email || !this.firstName || !this.lastName || !this.role) {
      throw new Error("Missing required fields");
    }
  }
}
