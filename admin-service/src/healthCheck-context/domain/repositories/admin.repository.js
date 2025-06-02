/**
 * Admin Repository Interface
 *
 * Defines the contract for admin aggregate persistence.
 * This is an abstract interface to be implemented in the infrastructure layer.
 */

class AdminRepository {
  /**
   * Saves an admin aggregate and its events to the repository
   * Flow:
   * 1. Persist all new events
   * 2. Update the aggregate snapshot if needed
   *
   * @param {Object} admin - The admin aggregate to save
   * @param {Array} events - The events to persist
   * @returns {Promise<void>} Promise that resolves when save is complete
   * @abstract
   */
  async save(admin, events) {
    throw new Error("Method not implemented: save");
  }

  /**
   * Finds an admin by ID
   * Flow:
   * 1. Load the aggregate or its events from storage
   * 2. Reconstitute the aggregate from events
   *
   * @param {string} id - The ID of the admin to find
   * @returns {Promise<Object|null>} Promise that resolves to the admin aggregate or null if not found
   * @abstract
   */
  async findById(id) {
    throw new Error("Method not implemented: findById");
  }

  /**
   * Finds an admin by email
   * @param {string} email - The email address to search for
   * @returns {Promise<Object|null>} Promise that resolves to the admin aggregate or null if not found
   * @abstract
   */
  async findByEmail(email) {
    throw new Error("Method not implemented: findByEmail");
  }

  /**
   * Finds all admins matching the given criteria
   * @param {Object} criteria - The search criteria
   * @returns {Promise<Array>} Promise that resolves to an array of admin aggregates
   * @abstract
   */
  async findAll(criteria = {}) {
    throw new Error("Method not implemented: findAll");
  }

  /**
   * Deletes an admin from the repository
   * @param {string} id - The ID of the admin to delete
   * @returns {Promise<boolean>} Promise that resolves to true if the admin was deleted, false otherwise
   * @abstract
   */
  async delete(id) {
    throw new Error("Method not implemented: delete");
  }

  /**
   * Gets the events for an admin aggregate
   * @param {string} id - The ID of the admin
   * @returns {Promise<Array>} Promise that resolves to an array of events
   * @abstract
   */
  async getEvents(id) {
    throw new Error("Method not implemented: getEvents");
  }

  /**
   * Checks if an admin with the given email exists
   * @param {string} email - The email address to check
   * @returns {Promise<boolean>} Promise that resolves to true if an admin with the email exists
   * @abstract
   */
  async existsByEmail(email) {
    throw new Error("Method not implemented: existsByEmail");
  }
}

module.exports = AdminRepository;
