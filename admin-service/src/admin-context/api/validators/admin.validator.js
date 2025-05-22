import Joi from "joi";

/**
 * Validation schemas for admin-related requests
 * Flow:
 * 1. Define validation rules
 * 2. Used by validation middleware
 * 3. Ensures data integrity before reaching controllers
 */

// SCHEMA: Create admin request validation
export const createAdminSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        "any.required": "Password is required",
      }),
    firstName: Joi.string().required().messages({
      "any.required": "First name is required",
    }),
    lastName: Joi.string().required().messages({
      "any.required": "Last name is required",
    }),
  }),
});

// SCHEMA: Get admin by ID request validation
export const getAdminByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required().messages({
      "any.required": "Admin ID is required",
    }),
  }),
});

// SCHEMA: Deactivate admin request validation
export const deactivateAdminSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required().messages({
      "any.required": "Admin ID is required",
    }),
  }),
  body: Joi.object({
    reason: Joi.string().min(10).required().messages({
      "string.min": "Deactivation reason must be at least 10 characters long",
      "any.required": "Deactivation reason is required",
    }),
    notes: Joi.string().optional().allow(""),
  }),
});
