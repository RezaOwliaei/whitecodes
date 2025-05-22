/**
 * GetAdminProfile Handler
 * Application service that orchestrates retrieving an admin profile
 *
 * Flow:
 * 1. Validates the query
 * 2. Retrieves the admin projection from read model
 * 3. Maps to response DTO
 * 4. Returns result
 *
 * @param {Object} dependencies - Injected dependencies
 * @param {Object} dependencies.adminReadRepository - Repository for Admin read models
 * @param {Object} dependencies.mapper - Mapper for query output
 */
class GetAdminProfileHandler {
  constructor(dependencies) {
    this.adminReadRepository = dependencies.adminReadRepository;
    this.mapper = dependencies.mapper;
  }

  /**
   * Handles the GetAdminProfile query
   *
   * @param {GetAdminProfileQuery} query - The query to get an admin profile
   * @returns {Object} Admin profile data
   */
  async handle(query) {
    // === Input Validation ===
    if (!query.adminId) {
      throw new Error("Admin ID is required");
    }

    // === Data Retrieval ===
    const adminProjection = await this.adminReadRepository.findById(
      query.adminId
    );
    if (!adminProjection) {
      throw new Error(`Admin with id ${query.adminId} not found`);
    }

    // === Response Mapping ===
    // Map the projection to a response DTO
    return this.mapper.toResponseDto(adminProjection, {
      includeMetadata: query.includeMetadata,
    });
  }
}

module.exports = GetAdminProfileHandler;
