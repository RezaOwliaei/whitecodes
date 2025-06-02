/**
 * Role Entity
 *
 * Represents a role that can be assigned to an admin.
 * As an entity, it has identity and lifecycle within the Admin aggregate boundary.
 */

class RoleEntity {
  #id;
  #name;
  #permissions;
  #createdAt;

  /**
   * Creates a new Role entity
   * Flow:
   * 1. Validates required properties
   * 2. Initializes the role with the provided values
   *
   * @param {Object} props - Role properties
   * @param {string} props.id - Unique identifier for the role
   * @param {string} props.name - Name of the role
   * @param {Array<string>} props.permissions - List of permissions associated with the role
   */
  constructor({ id, name, permissions = [] }) {
    // STEP 1: Validate required properties
    if (!id) throw new Error("Role ID is required");
    if (!name) throw new Error("Role name is required");

    // STEP 2: Initialize the role with the provided values
    this.#id = id;
    this.#name = name;
    this.#permissions = [...permissions];
    this.#createdAt = new Date();
  }

  /**
   * Gets the ID of the role
   * @returns {string} The role ID
   */
  get id() {
    return this.#id;
  }

  /**
   * Gets the name of the role
   * @returns {string} The role name
   */
  get name() {
    return this.#name;
  }

  /**
   * Gets the permissions of the role
   * @returns {Array<string>} The role permissions
   */
  get permissions() {
    return [...this.#permissions];
  }

  /**
   * Gets the creation date of the role
   * @returns {Date} The creation date
   */
  get createdAt() {
    return this.#createdAt;
  }

  /**
   * Adds a permission to the role
   * Flow:
   * 1. Validate the permission exists
   * 2. Check if role already has the permission
   * 3. Add the permission if not already present
   *
   * @param {string} permission - Permission to add
   * @returns {boolean} True if permission was added, false if already present
   */
  addPermission(permission) {
    // STEP 1: Validate the permission exists
    if (!permission) {
      throw new Error("Permission cannot be empty");
    }

    // STEP 2: Check if role already has the permission
    if (this.#permissions.includes(permission)) {
      return false;
    }

    // STEP 3: Add the permission if not already present
    this.#permissions.push(permission);
    return true;
  }

  /**
   * Removes a permission from the role
   * Flow:
   * 1. Check if role has the permission
   * 2. Remove the permission if present
   *
   * @param {string} permission - Permission to remove
   * @returns {boolean} True if permission was removed, false if not present
   */
  removePermission(permission) {
    const index = this.#permissions.indexOf(permission);

    // STEP 1: Check if role has the permission
    if (index === -1) {
      return false;
    }

    // STEP 2: Remove the permission if present
    this.#permissions.splice(index, 1);
    return true;
  }

  /**
   * Checks if the role has a specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} True if role has the permission, false otherwise
   */
  hasPermission(permission) {
    return this.#permissions.includes(permission);
  }

  /**
   * Creates a plain object representation of the role
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.#id,
      name: this.#name,
      permissions: [...this.#permissions],
      createdAt: this.#createdAt,
    };
  }
}

module.exports = RoleEntity;
