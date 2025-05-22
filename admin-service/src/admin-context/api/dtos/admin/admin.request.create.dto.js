/**
 * Data Transfer Object for admin creation requests
 * Flow:
 * 1. Validates and structures incoming admin creation data
 * 2. Used by admin creation controller to validate request payload
 * 3. Passed to application service for admin creation
 */
export class AdminRequestCreateDto {
  /**
   * @param {Object} data - Raw request data
   * @param {string} data.email - Admin's email address
   * @param {string} data.password - Admin's password (will be hashed)
   * @param {string} data.firstName - Admin's first name
   * @param {string} data.lastName - Admin's last name
   * @throws {Error} If required fields are missing or invalid
   */
  constructor({ email, password, firstName, lastName }) {
    // VALIDATION: Required fields
    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
    if (!firstName) throw new Error("First name is required");
    if (!lastName) throw new Error("Last name is required");

    // VALIDATION: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // VALIDATION: Password strength
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // ASSIGNMENT: Set validated fields
    this.email = email.toLowerCase().trim();
    this.password = password;
    this.firstName = firstName.trim();
    this.lastName = lastName.trim();
  }

  /**
   * Returns a plain object representation of the DTO
   * @returns {Object} Plain object with DTO data
   */
  toJSON() {
    return {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
    };
  }
}
