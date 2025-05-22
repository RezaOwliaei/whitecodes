/**
 * Create Admin Validator
 * Ensures business-level validation rules for creating an admin
 */

export class CreateAdminValidator {
  async validate(command) {
    if (!command) {
      throw new Error("Command cannot be null");
    }

    // Business validation rules
    if (command.role === "SUPER_ADMIN" && !this.isAuthorizedForSuperAdmin()) {
      throw new Error("Unauthorized to create super admin");
    }

    // Domain invariants should be checked in the domain layer
    return true;
  }

  isAuthorizedForSuperAdmin() {
    // Implementation would check current user's permissions
    return false;
  }
}
