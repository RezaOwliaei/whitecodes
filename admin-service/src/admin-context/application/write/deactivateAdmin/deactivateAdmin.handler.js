/**
 * DeactivateAdmin Handler
 * Application service that orchestrates the deactivation of an admin
 *
 * Flow:
 * 1. Validates the command
 * 2. Loads the Admin aggregate
 * 3. Calls domain methods
 * 4. Persists events via repository
 * 5. Returns result
 *
 * @param {Object} dependencies - Injected dependencies
 * @param {Object} dependencies.adminRepository - Repository for Admin aggregate
 * @param {Object} dependencies.validator - Validator for command input
 */
class DeactivateAdminHandler {
  constructor(dependencies) {
    this.adminRepository = dependencies.adminRepository;
    this.validator = dependencies.validator;
  }

  /**
   * Handles the DeactivateAdmin command
   *
   * @param {DeactivateAdminCommand} command - The command to deactivate an admin
   * @returns {Object} Result of the operation
   */
  async handle(command) {
    // === Input Validation ===
    const validationResult = this.validator.validate(command);
    if (!validationResult.isValid) {
      throw new Error(`Invalid command: ${validationResult.errors.join(", ")}`);
    }

    // === Domain Operations ===
    // Load the admin aggregate
    const adminAggregate = await this.adminRepository.findById(command.adminId);
    if (!adminAggregate) {
      throw new Error(`Admin with id ${command.adminId} not found`);
    }

    // Execute domain logic
    adminAggregate.deactivate(command.reason, command.deactivatedBy);

    // === Persistence ===
    // Save the updated aggregate (which persists events)
    await this.adminRepository.save(adminAggregate);

    // === Response Generation ===
    return {
      success: true,
      adminId: adminAggregate.id,
      status: adminAggregate.status,
    };
  }
}

module.exports = DeactivateAdminHandler;
