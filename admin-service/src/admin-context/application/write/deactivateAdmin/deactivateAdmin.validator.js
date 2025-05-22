/**
 * DeactivateAdmin Validator
 * Validates the deactivate admin command input
 *
 * Flow:
 * 1. Validates required fields
 * 2. Validates business rules
 * 3. Returns validation result
 */
class DeactivateAdminValidator {
  validate(command) {
    const errors = [];

    // Required field validation
    if (!command.adminId) errors.push("adminId is required");
    if (!command.deactivatedBy) errors.push("deactivatedBy is required");

    // Business rule validation
    if (command.reason && command.reason.length > 500) {
      errors.push("reason cannot exceed 500 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = new DeactivateAdminValidator();
