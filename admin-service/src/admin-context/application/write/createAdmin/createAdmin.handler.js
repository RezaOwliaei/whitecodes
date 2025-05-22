/**
 * Create Admin Command Handler
 * Application service that orchestrates the creation of a new admin
 * Flow:
 * 1. Validates command
 * 2. Loads admin aggregate
 * 3. Executes domain logic
 * 4. Persists events
 */

import { AdminAggregate } from "../../../domain/admin.aggregate";
import { AdminRepository } from "../../../domain/admin.repository";
import { CreateAdminValidator } from "./createAdmin.validator";
import { CreateAdminMapper } from "./createAdmin.mapper";

export class CreateAdminCommandHandler {
  constructor(adminRepository, validator, mapper) {
    this.adminRepository = adminRepository;
    this.validator = validator;
    this.mapper = mapper;
  }

  async execute(command) {
    // STEP 1: Validate command
    await this.validator.validate(command);

    // STEP 2: Create new admin aggregate
    const admin = AdminAggregate.create({
      email: command.email,
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role,
    });

    // STEP 3: Save aggregate (which persists events)
    await this.adminRepository.save(admin);

    // STEP 4: Map to response
    return this.mapper.toResponse(admin);
  }
}
