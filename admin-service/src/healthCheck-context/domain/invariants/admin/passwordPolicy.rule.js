/**
 * Password Policy Rule
 *
 * Enforces the invariant that passwords must meet security requirements.
 * This rule encapsulates password complexity rules such as length, character variety,
 * and common password detection as mentioned in the README.
 *
 * Flow:
 * 1. Validates password format and basic requirements
 * 2. Checks character complexity requirements
 * 3. Validates against common password patterns
 * 4. Provides strength calculation delegation
 */

// === CONFIGURATION CONSTANTS ===
const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  COMMON_PASSWORDS: [
    "Password123!",
    "Admin123!",
    "Welcome1!",
    "Qwerty123!",
    "Password1!",
    "Admin1234!",
    "Welcome123!",
    "Qwerty1!",
  ],
  SEQUENTIAL_PATTERNS: [
    "abcdefghijklmnopqrstuvwxyz",
    "01234567890",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
  ],
  VALIDATION_RULES: {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    numbers: /\d/,
    specialChars: /[^A-Za-z0-9]/,
    repeatingChars: /(.)\1{2,}/,
  },
};

// === CORE VALIDATION FUNCTIONS ===

/**
 * Validates that a password meets the security policy requirements
 * Flow:
 * 1. Check if password exists and is not empty
 * 2. Validate password against all security policy rules
 * 3. Throw exception if password doesn't meet requirements
 *
 * @param {string} password - The password to validate
 * @throws {Error} If password doesn't meet security requirements
 */
export function validate(password) {
  // STEP 1: Check if password exists and is not empty
  if (!_isValidPasswordInput(password)) {
    throw new Error("Password is required and cannot be empty");
  }

  // STEP 2: Validate password against security policy
  const validationResult = getValidationDetails(password);

  // STEP 3: Throw exception if validation fails
  if (!validationResult.isValid) {
    const errorMessage = `Password does not meet security requirements: ${validationResult.errors.join(
      ", "
    )}`;
    throw new Error(errorMessage);
  }
}

/**
 * Checks if a password satisfies the policy rule (without throwing)
 * Flow:
 * 1. Perform basic validation checks
 * 2. Apply all password complexity rules efficiently
 * 3. Check for security violations
 * 4. Return boolean result
 *
 * @param {string} password - The password to check
 * @returns {boolean} True if the password meets all security requirements
 */
export function isSatisfiedBy(password) {
  // STEP 1: Basic validation
  if (!_isValidPasswordInput(password)) {
    return false;
  }

  // STEP 2: Check length requirement
  if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    return false;
  }

  // STEP 3: Check character complexity requirements efficiently
  const { uppercase, lowercase, numbers, specialChars } =
    PASSWORD_CONFIG.VALIDATION_RULES;
  if (
    !uppercase.test(password) ||
    !lowercase.test(password) ||
    !numbers.test(password) ||
    !specialChars.test(password)
  ) {
    return false;
  }

  // STEP 4: Check for security violations
  return !_hasSecurityViolations(password);
}

/**
 * Gets detailed validation information about a password
 * Flow:
 * 1. Initialize validation result object
 * 2. Perform comprehensive validation checks
 * 3. Return detailed validation results
 *
 * @param {string} password - The password to analyze
 * @returns {Object} Validation result with success flag and error messages
 */
export function getValidationDetails(password) {
  // STEP 1: Initialize result
  const result = {
    isValid: true,
    errors: [],
  };

  // STEP 2: Basic validation
  if (!_isValidPasswordInput(password)) {
    return {
      isValid: false,
      errors: ["Password is required and cannot be empty"],
    };
  }

  // STEP 3: Length validation
  if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    result.isValid = false;
    result.errors.push(
      `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`
    );
  }

  // STEP 4: Character complexity validation
  _validateCharacterRequirements(password, result);

  // STEP 5: Security violations validation
  _validateSecurityViolations(password, result);

  return result;
}

/**
 * Calculates the strength score of a password using the domain service
 * Flow:
 * 1. Delegate to password strength service
 * 2. Return calculated strength score
 *
 * @param {string} password - The password to evaluate
 * @returns {number} Password strength score (0-100)
 */
export async function calculateStrength(password) {
  // Dynamic import to avoid circular dependency (ESM pattern)
  const { default: passwordStrengthService } = await import(
    "../../services/passwordStrength.service.js"
  );
  return passwordStrengthService.calculateStrength(password);
}

// === PRIVATE HELPER FUNCTIONS ===

/**
 * Validates password input format
 * @param {string} password - The password to check
 * @returns {boolean} True if input is valid
 * @private
 */
function _isValidPasswordInput(password) {
  return password && typeof password === "string" && password.trim() !== "";
}

/**
 * Validates character complexity requirements
 * @param {string} password - The password to validate
 * @param {Object} result - The validation result object to update
 * @private
 */
function _validateCharacterRequirements(password, result) {
  const requirements = [
    {
      regex: PASSWORD_CONFIG.VALIDATION_RULES.uppercase,
      message: "Password must contain at least one uppercase letter",
    },
    {
      regex: PASSWORD_CONFIG.VALIDATION_RULES.lowercase,
      message: "Password must contain at least one lowercase letter",
    },
    {
      regex: PASSWORD_CONFIG.VALIDATION_RULES.numbers,
      message: "Password must contain at least one number",
    },
    {
      regex: PASSWORD_CONFIG.VALIDATION_RULES.specialChars,
      message: "Password must contain at least one special character",
    },
  ];

  requirements.forEach(({ regex, message }) => {
    if (!regex.test(password)) {
      result.isValid = false;
      result.errors.push(message);
    }
  });
}

/**
 * Validates security violations
 * @param {string} password - The password to validate
 * @param {Object} result - The validation result object to update
 * @private
 */
function _validateSecurityViolations(password, result) {
  const violations = [
    {
      check: () => _isCommonPassword(password),
      message: "Password is too common and easily guessable",
    },
    {
      check: () => _containsSequentialChars(password),
      message:
        "Password must not contain sequential characters (e.g., abc, 123, qwe)",
    },
    {
      check: () => _containsRepeatingChars(password),
      message:
        "Password must not contain repeating characters (e.g., aaa, 111)",
    },
  ];

  violations.forEach(({ check, message }) => {
    if (check()) {
      result.isValid = false;
      result.errors.push(message);
    }
  });
}

/**
 * Checks for any security violations
 * @param {string} password - The password to check
 * @returns {boolean} True if password has security violations
 * @private
 */
function _hasSecurityViolations(password) {
  return (
    _isCommonPassword(password) ||
    _containsSequentialChars(password) ||
    _containsRepeatingChars(password)
  );
}

/**
 * Checks if a password is in the list of common passwords
 * @param {string} password - The password to check
 * @returns {boolean} True if the password is common
 * @private
 */
function _isCommonPassword(password) {
  return PASSWORD_CONFIG.COMMON_PASSWORDS.includes(password);
}

/**
 * Checks if a password contains sequential characters (security violation)
 * Flow:
 * 1. Check against predefined sequential patterns that are security risks
 * 2. Return true if any prohibited sequential pattern is found
 *
 * @param {string} password - The password to check
 * @returns {boolean} True if sequential characters are found (security violation)
 * @private
 */
function _containsSequentialChars(password) {
  const lowerPassword = password.toLowerCase();

  return PASSWORD_CONFIG.SEQUENTIAL_PATTERNS.some((sequence) => {
    // Check for 3+ character sequences
    for (let i = 0; i <= sequence.length - 3; i++) {
      const sequentialChars = sequence.substring(i, i + 3);
      if (lowerPassword.includes(sequentialChars)) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Checks if a password contains repeating characters (security violation)
 * Flow:
 * 1. Use optimized regex to detect 3+ consecutive identical characters
 * 2. Return true if prohibited repeating pattern is found
 *
 * @param {string} password - The password to check
 * @returns {boolean} True if repeating characters are found (security violation)
 * @private
 */
function _containsRepeatingChars(password) {
  return PASSWORD_CONFIG.VALIDATION_RULES.repeatingChars.test(password);
}
