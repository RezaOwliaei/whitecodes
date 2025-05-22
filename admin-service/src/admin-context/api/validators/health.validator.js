import Joi from "joi";

/**
 * Validation schemas for health check requests
 * Flow:
 * 1. Define validation rules for health check parameters
 * 2. Used by validation middleware
 * 3. Ensures valid health check requests
 */

// SCHEMA: Health check query parameters validation
export const healthCheckSchema = Joi.object({
  query: Joi.object({
    // Optional parameter to include dependency checks
    includeDependencies: Joi.boolean().optional().default(false).messages({
      "boolean.base": "includeDependencies must be a boolean",
    }),
    // Optional parameter to specify which dependencies to check
    dependencies: Joi.string()
      .optional()
      .pattern(/^[a-zA-Z,]+$/)
      .messages({
        "string.pattern.base":
          "dependencies must be a comma-separated list of alphanumeric names",
      }),
  }),
});
