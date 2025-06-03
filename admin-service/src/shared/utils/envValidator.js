// envValidator.js
// Utility function to validate environment variables for the application.
// Ensures required variables are present, and that numeric and boolean variables are valid.

import { EnvValidationError } from "../errors/EnvValidationError.js";

/**
 * Validates environment variables.
 *
 * @param {string[]} requiredVars - List of required environment variable names.
 * @param {string[]} [numericVars=[]] - List of environment variable names that must be numeric.
 * @param {string[]} [booleanVars=[]] - List of environment variable names that must be boolean ("true" or "false").
 * @throws {EnvValidationError} If any required variable is missing, or if a variable does not match its expected type.
 */
export function validateEnvVars(
  requiredVars,
  numericVars = [],
  booleanVars = []
) {
  // Step 1: Check for missing required environment variables
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new EnvValidationError(
        `Missing required environment variable: ${varName}`,
        varName
      );
    }
  });

  // Step 2: Validate that specified variables are numeric
  numericVars.forEach((varName) => {
    if (isNaN(Number(process.env[varName]))) {
      throw new EnvValidationError(
        `Environment variable ${varName} must be a number`,
        varName,
        { receivedType: typeof process.env[varName] }
      );
    }
  });

  // Step 3: Validate that specified variables are boolean ("true" or "false")
  booleanVars.forEach((varName) => {
    if (
      process.env[varName] &&
      !["true", "false"].includes(process.env[varName].toLowerCase())
    ) {
      throw new EnvValidationError(
        `Environment variable ${varName} must be either "true" or "false"`,
        varName,
        { receivedType: typeof process.env[varName] }
      );
    }
  });
}
