/**
 * DeactivateAdmin Mapper
 * Maps between DTOs, commands, aggregates, and response objects
 *
 * Flow:
 * 1. Maps data transfer objects to domain objects
 * 2. Maps domain objects to response objects
 */
class DeactivateAdminMapper {
  /**
   * Maps a DTO to a DeactivateAdmin command
   *
   * @param {Object} dto - Data transfer object from API
   * @returns {Object} Command object for the use case
   */
  toCommand(dto) {
    return {
      adminId: dto.adminId,
      reason: dto.reason,
      deactivatedBy: dto.deactivatedBy || dto.requestingUserId,
    };
  }

  /**
   * Maps domain aggregate to response DTO
   *
   * @param {Object} aggregate - Admin aggregate
   * @returns {Object} Response DTO
   */
  toResponseDto(aggregate) {
    return {
      id: aggregate.id,
      status: aggregate.status,
      deactivatedAt: aggregate.deactivatedAt,
      deactivatedBy: aggregate.deactivatedBy,
      reason: aggregate.deactivationReason,
    };
  }
}

module.exports = new DeactivateAdminMapper();
