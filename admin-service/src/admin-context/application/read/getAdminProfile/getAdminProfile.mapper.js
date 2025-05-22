/**
 * Get Admin Profile Mapper
 * Maps between read model and response DTOs
 */

export class GetAdminProfileMapper {
  toResponse(adminReadModel) {
    return {
      id: adminReadModel.id,
      email: adminReadModel.email,
      firstName: adminReadModel.firstName,
      lastName: adminReadModel.lastName,
      role: adminReadModel.role,
      status: adminReadModel.status,
      createdAt: adminReadModel.createdAt,
      lastLoginAt: adminReadModel.lastLoginAt,
    };
  }
}
