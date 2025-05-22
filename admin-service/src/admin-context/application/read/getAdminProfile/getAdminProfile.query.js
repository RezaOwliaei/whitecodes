/**
 * Get Admin Profile Query
 * Pure data object modeling the intent to retrieve an admin's profile
 */

export class GetAdminProfileQuery {
  constructor(adminId) {
    this.adminId = adminId;
    this.timestamp = new Date();
  }
}
