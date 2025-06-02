/**
 * CreateAdmin Validator
 * Validates the create admin command input
 *
 * Flow:
 * 1. Validates required fields
 * 2. Validates data formats
 * 3. Returns validation result
 */
class CreateAdminValidator {
  validate(command) {
    const errors = [];

    // Required field validation
    if (!command.userId) errors.push("userId is required");
    if (!command.email) errors.push("email is required");
    if (!command.fullName) errors.push("fullName is required");
    if (!command.roleId) errors.push("roleId is required");
    if (!command.createdBy) errors.push("createdBy is required");

    // Format validation
    if (command.email && !this.isValidEmail(command.email)) {
      errors.push("email format is invalid");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = new CreateAdminValidator();
