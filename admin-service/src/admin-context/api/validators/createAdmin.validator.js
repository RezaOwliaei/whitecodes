/**
 * Create Admin Validator
 * Validates input for creating a new admin user
 */

import * as Joi from "joi";

export const createAdminValidator = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .description("Admin user email address"),

  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .description("Admin first name"),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .description("Admin last name"),

  role: Joi.string()
    .valid("SUPER_ADMIN", "ADMIN", "SUPPORT")
    .required()
    .description("Admin role type"),
});
