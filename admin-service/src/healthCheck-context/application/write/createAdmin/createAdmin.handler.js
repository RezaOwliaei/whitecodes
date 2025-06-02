/**
 * CreateAdmin Handler
 * Application service that orchestrates the creation of a new admin
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
class CreateAdminHandler {
  constructor(dependencies) {
    this.adminRepository = dependencies.adminRepository;
    this.validator = dependencies.validator;
  }

  /**
   * Handles the CreateAdmin command
   *
   * @param {CreateAdminCommand} command - The command to create an admin
   * @returns {Object} Result of the operation
   */
  async handle(command) {
    // === Input Validation ===
    const validationResult = this.validator.validate(command);
    if (!validationResult.isValid) {
      throw new Error(`Invalid command: ${validationResult.errors.join(", ")}`);
    }

    // === Domain Operations ===
    // Check if admin already exists
    const existingAdmin = await this.adminRepository.findByUserId(
      command.userId
    );
    if (existingAdmin) {
      throw new Error(`Admin with userId ${command.userId} already exists`);
    }

    // Create new admin aggregate through factory
    const adminAggregate = await this.adminRepository.createAdmin({
      userId: command.userId,
      email: command.email,
      fullName: command.fullName,
      roleId: command.roleId,
      metadata: command.metadata,
      createdBy: command.createdBy,
    });

    // === Persistence ===
    // Save the aggregate (which persists events)
    await this.adminRepository.save(adminAggregate);

    // === Response Generation ===
    return {
      success: true,
      adminId: adminAggregate.id,
    };
  }
}

module.exports = CreateAdminHandler;
