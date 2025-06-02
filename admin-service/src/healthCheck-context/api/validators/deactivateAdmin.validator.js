/**
 * Deactivate Admin Validator
 * Validates input for deactivating an admin
 */

import Joi from "joi";

export const deactivateAdminValidator = Joi.object({
  params: Joi.object({
    id: Joi.string().required().description("Admin ID to deactivate"),
  }),

  body: Joi.object({
    reason: Joi.string()
      .min(5)
      .max(200)
      .required()
      .description("Reason for deactivation"),
  }),
});
