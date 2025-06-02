/**
 * CreateAdmin Mapper
 * Maps between DTOs, commands, aggregates, and response objects
 *
 * Flow:
 * 1. Maps data transfer objects to domain objects
 * 2. Maps domain objects to response objects
 */
class CreateAdminMapper {
  /**
   * Maps a DTO to a CreateAdmin command
   *
   * @param {Object} dto - Data transfer object from API
   * @returns {Object} Command object for the use case
   */
  toCommand(dto) {
    return {
      userId: dto.userId,
      email: dto.email,
      fullName: dto.fullName,
      roleId: dto.roleId,
      metadata: dto.metadata,
      createdBy: dto.createdBy || dto.requestingUserId,
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
      userId: aggregate.userId,
      email: aggregate.email,
      fullName: aggregate.fullName,
      roleId: aggregate.roleId,
      status: aggregate.status,
      createdAt: aggregate.createdAt,
    };
  }
}

module.exports = new CreateAdminMapper();
