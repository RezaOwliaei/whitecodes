/**
 * GetAdminProfile Query
 * Represents the intent to retrieve an admin's profile
 */
class GetAdminProfileQuery {
  constructor(data) {
    this.adminId = data.adminId;
    this.includeMetadata = data.includeMetadata || false;
  }
}

module.exports = GetAdminProfileQuery;
