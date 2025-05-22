/**
 * Create Admin Mapper
 * Maps between different representations of admin data
 */

export class CreateAdminMapper {
  toResponse(adminAggregate) {
    return {
      id: adminAggregate.id,
      email: adminAggregate.email,
      firstName: adminAggregate.firstName,
      lastName: adminAggregate.lastName,
      role: adminAggregate.role,
      status: adminAggregate.status,
      createdAt: adminAggregate.createdAt,
    };
  }

  toDomain(command) {
    return {
      email: command.email,
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role,
    };
  }
}
