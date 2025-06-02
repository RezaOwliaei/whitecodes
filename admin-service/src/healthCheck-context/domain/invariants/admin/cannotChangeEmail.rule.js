/**
 * Cannot Change Email Rule
 *
 * Enforces the invariant that an admin's email cannot be changed once set.
 * This is a business rule that ensures email addresses remain immutable.
 */

const CannotChangeEmailException = require("../../exceptions/cannotChangeEmail.exception");

/**
 * Validates that an admin's email is not being changed
 * Flow:
 * 1. Compare current email with proposed new email
 * 2. Throw exception if emails don't match
 *
 * @param {string} currentEmail - The admin's current email
 * @param {string} newEmail - The proposed new email
 * @throws {CannotChangeEmailException} If emails don't match (indicating an attempt to change)
 */
function validate(currentEmail, newEmail) {
  // If current email doesn't exist yet (new admin), allow setting it
  if (!currentEmail) {
    return;
  }

  // If emails don't match, throw exception
  if (currentEmail.toLowerCase() !== newEmail.toLowerCase()) {
    throw new CannotChangeEmailException(currentEmail, newEmail);
  }
}

/**
 * Checks if an admin's email would be changed (without throwing)
 * @param {string} currentEmail - The admin's current email
 * @param {string} newEmail - The proposed new email
 * @returns {boolean} True if the rule is satisfied (emails match or current is null)
 */
function isSatisfiedBy(currentEmail, newEmail) {
  // If current email doesn't exist yet (new admin), rule is satisfied
  if (!currentEmail) {
    return true;
  }

  // Rule is satisfied if emails match
  return currentEmail.toLowerCase() === newEmail.toLowerCase();
}

module.exports = {
  validate,
  isSatisfiedBy,
};
