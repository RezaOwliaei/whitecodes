/**
 * GetAdminProfile Mapper
 * Maps between read models and response DTOs
 *
 * Flow:
 * 1. Maps read model projections to response DTOs
 * 2. Applies transformations for response formatting
 */
class GetAdminProfileMapper {
  /**
   * Maps admin projection to response DTO
   *
   * @param {Object} projection - Admin read model projection
   * @param {Object} options - Mapping options
   * @param {boolean} options.includeMetadata - Whether to include metadata in response
   * @returns {Object} Response DTO
   */
  toResponseDto(projection, options = {}) {
    const response = {
      id: projection.id,
      userId: projection.userId,
      email: projection.email,
      fullName: projection.fullName,
      roleId: projection.roleId,
      roleName: projection.roleName,
      status: projection.status,
      createdAt: projection.createdAt,
      createdBy: projection.createdBy,
    };

    // Add optional fields based on options
    if (options.includeMetadata && projection.metadata) {
      response.metadata = projection.metadata;
    }

    // Add deactivation info if admin is deactivated
    if (projection.status === "DEACTIVATED") {
      response.deactivatedAt = projection.deactivatedAt;
      response.deactivatedBy = projection.deactivatedBy;
      response.deactivationReason = projection.deactivationReason;
    }

    return response;
  }
}

module.exports = new GetAdminProfileMapper();
