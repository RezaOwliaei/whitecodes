/**
 * Password Strength Service
 *
 * A stateless domain service that calculates password strength scores.
 * This service provides computational logic for evaluating password quality
 * without enforcing business rules (which belong in invariants).
 *
 * Flow:
 * 1. Analyzes password characteristics (length, complexity, patterns)
 * 2. Calculates strength score based on multiple criteria
 * 3. Applies penalties for security violations
 * 4. Returns normalized score for use by other domain components
 */

// === CONFIGURATION CONSTANTS ===
const STRENGTH_CONFIG = {
  MAX_SCORE: 100,
  SCORING: {
    LENGTH_MAX_POINTS: 25,
    LENGTH_MULTIPLIER: 2,
    CHAR_TYPE_POINTS: 12.5,
    NUMBER_BONUS_MAX: 5,
    NUMBER_BONUS_MULTIPLIER: 2,
    SPECIAL_BONUS_MAX: 5,
    SPECIAL_BONUS_MULTIPLIER: 3,
    VIOLATION_PENALTY: 5,
  },
  STRENGTH_LEVELS: [
    { min: 80, level: "Very Strong" },
    { min: 60, level: "Strong" },
    { min: 40, level: "Moderate" },
    { min: 20, level: "Weak" },
    { min: 0, level: "Very Weak" },
  ],
};

// === REGEX PATTERNS (compiled once for performance) ===
const PATTERNS = {
  uppercase: /[A-Z]/g,
  lowercase: /[a-z]/g,
  numbers: /[0-9]/g,
  specialChars: /[^A-Za-z0-9]/g,
};

class PasswordStrengthService {
  /**
   * Calculates the strength score of a password
   * Flow:
   * 1. Validate input and handle edge cases
   * 2. Calculate base score from length and character diversity
   * 3. Apply bonuses for character variety
   * 4. Apply penalties for security violations
   * 5. Return normalized score (0-100)
   *
   * @param {string} password - The password to evaluate
   * @returns {Promise<number>} Password strength score (0-100)
   */
  async calculateStrength(password) {
    // STEP 1: Input validation
    if (!password || typeof password !== "string") {
      return 0;
    }

    // STEP 2: Calculate base score from length
    let score = this.#calculateLengthScore(password);

    // STEP 3: Add character diversity score
    score += this.#calculateCharacterDiversityScore(password);

    // STEP 4: Add character quantity bonuses
    score += this.#calculateCharacterQuantityBonus(password);

    // STEP 5: Apply security violation penalties
    score -= await this.#calculateSecurityViolationPenalties(password);

    // STEP 6: Normalize score to 0-100 range
    return Math.max(0, Math.min(score, STRENGTH_CONFIG.MAX_SCORE));
  }

  /**
   * Gets a descriptive strength level based on the score
   * Flow:
   * 1. Calculate strength score efficiently
   * 2. Map score to descriptive level using lookup
   * 3. Return comprehensive strength assessment
   *
   * @param {string} password - The password to evaluate
   * @returns {Promise<Object>} Strength assessment with score and level
   */
  async getStrengthAssessment(password) {
    const score = await this.calculateStrength(password);
    const level = this.#getStrengthLevel(score);

    return {
      score,
      level,
      percentage: score,
    };
  }

  // === PRIVATE CALCULATION METHODS ===

  /**
   * Calculates score based on password length
   * @param {string} password - The password to evaluate
   * @returns {number} Length-based score
   * @private
   */
  #calculateLengthScore(password) {
    const { LENGTH_MAX_POINTS, LENGTH_MULTIPLIER } = STRENGTH_CONFIG.SCORING;
    return Math.min(password.length * LENGTH_MULTIPLIER, LENGTH_MAX_POINTS);
  }

  /**
   * Calculates score based on character type diversity
   * @param {string} password - The password to evaluate
   * @returns {number} Character diversity score
   * @private
   */
  #calculateCharacterDiversityScore(password) {
    const charTypes = {
      uppercase: PATTERNS.uppercase.test(password),
      lowercase: PATTERNS.lowercase.test(password),
      numbers: PATTERNS.numbers.test(password),
      specialChars: PATTERNS.specialChars.test(password),
    };

    const diversityCount = Object.values(charTypes).filter(Boolean).length;
    return diversityCount * STRENGTH_CONFIG.SCORING.CHAR_TYPE_POINTS;
  }

  /**
   * Calculates bonus points for character quantity
   * @param {string} password - The password to evaluate
   * @returns {number} Character quantity bonus
   * @private
   */
  #calculateCharacterQuantityBonus(password) {
    const {
      NUMBER_BONUS_MAX,
      NUMBER_BONUS_MULTIPLIER,
      SPECIAL_BONUS_MAX,
      SPECIAL_BONUS_MULTIPLIER,
    } = STRENGTH_CONFIG.SCORING;

    // Count numbers and special characters efficiently
    const numberCount = (password.match(PATTERNS.numbers) || []).length;
    const specialCount = (password.match(PATTERNS.specialChars) || []).length;

    const numberBonus =
      Math.min(numberCount, NUMBER_BONUS_MAX) * NUMBER_BONUS_MULTIPLIER;
    const specialBonus =
      Math.min(specialCount, SPECIAL_BONUS_MAX) * SPECIAL_BONUS_MULTIPLIER;

    return numberBonus + specialBonus;
  }

  /**
   * Calculates penalties for security violations
   * @param {string} password - The password to evaluate
   * @returns {number} Total penalty points
   * @private
   */
  async #calculateSecurityViolationPenalties(password) {
    // Dynamic import to avoid circular dependency (ESM pattern)
    const { getValidationDetails } = await import(
      "../invariants/admin/passwordPolicy.rule.js"
    );
    const validationDetails = getValidationDetails(password);

    // Apply penalty for each security violation
    if (!validationDetails.isValid) {
      return (
        validationDetails.errors.length *
        STRENGTH_CONFIG.SCORING.VIOLATION_PENALTY
      );
    }

    return 0;
  }

  /**
   * Maps score to descriptive strength level
   * @param {number} score - The calculated strength score
   * @returns {string} Descriptive strength level
   * @private
   */
  #getStrengthLevel(score) {
    const level = STRENGTH_CONFIG.STRENGTH_LEVELS.find(
      (level) => score >= level.min
    );
    return level ? level.level : "Very Weak";
  }
}

// Export singleton instance for consistent usage
export default new PasswordStrengthService();
