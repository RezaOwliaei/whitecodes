/**
 * Get Admin Profile Query Handler
 * Application service that retrieves an admin's profile
 * Flow:
 * 1. Validates query
 * 2. Retrieves from read model
 * 3. Maps to response
 */

import { AdminReadModel } from "../../../infrastructure/persistence/mongodb/adminReadModel";
import { GetAdminProfileMapper } from "./getAdminProfile.mapper";

export class GetAdminProfileQueryHandler {
  constructor(adminReadModel, mapper) {
    this.adminReadModel = adminReadModel;
    this.mapper = mapper;
  }

  async execute(query) {
    // STEP 1: Validate query
    if (!query.adminId) {
      throw new Error("Admin ID is required");
    }

    // STEP 2: Get from read model
    const adminProfile = await this.adminReadModel.findById(query.adminId);

    if (!adminProfile) {
      throw new Error("Admin not found");
    }

    // STEP 3: Map to response
    return this.mapper.toResponse(adminProfile);
  }
}
