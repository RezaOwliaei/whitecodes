/**
 * Get Admin Profile Query DTO
 * Data Transfer Object for retrieving an admin's profile
 */

export class GetAdminProfileQuery {
  constructor(adminId) {
    this.adminId = adminId;
  }
}
