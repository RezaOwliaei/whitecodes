/**
 * Create Admin Command DTO
 * Data Transfer Object for creating a new admin
 */

export class CreateAdminCommand {
  constructor(data) {
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role;
  }
}
