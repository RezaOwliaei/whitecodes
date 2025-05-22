/**
 * Create Admin Command
 * Pure data object modeling the intent to create a new admin
 */

export class CreateAdminCommand {
  constructor(data) {
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role;
    this.timestamp = new Date();
  }
}
