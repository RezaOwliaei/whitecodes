/**
 * Must Have Valid Role Rule
 *
 * Enforces the invariant that an admin must have at least one valid role.
 * This is a business rule that ensures admins always have proper permissions.
 */

/**
 * List of valid roles in the system
 * @type {Array<string>}
 * @private
 */
const validRoles = ["super_admin", "admin", "moderator", "support", "readonly"];

/**
 * Validates that the given roles array contains at least one valid role
 * Flow:
 * 1. Check if roles array exists and is not empty
 * 2. Check if at least one role is in the valid roles list
 *
 * @param {Array<string>} roles - Array of role names to validate
 * @throws {Error} If validation fails
 */
function validate(roles) {
  // STEP 1: Check if roles array exists and is not empty
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    throw new Error("Admin must have at least one role");
  }

  // STEP 2: Check if at least one role is in the valid roles list
  const hasValidRole = roles.some((role) => validRoles.includes(role));

  if (!hasValidRole) {
    throw new Error(
      `Admin must have at least one valid role. Valid roles are: ${validRoles.join(
        ", "
      )}`
    );
  }
}

/**
 * Checks if the roles array satisfies the rule (without throwing)
 * @param {Array<string>} roles - Array of role names to check
 * @returns {boolean} True if the rule is satisfied
 */
function isSatisfiedBy(roles) {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return false;
  }

  return roles.some((role) => validRoles.includes(role));
}

/**
 * Gets the list of valid roles
 * @returns {Array<string>} List of valid role names
 */
function getValidRoles() {
  return [...validRoles];
}

/**
 * Checks if a specific role is valid
 * @param {string} role - Role name to check
 * @returns {boolean} True if the role is valid
 */
function isValidRole(role) {
  return validRoles.includes(role);
}

module.exports = {
  validate,
  isSatisfiedBy,
  getValidRoles,
  isValidRole,
};
