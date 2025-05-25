/**
 * Status Enum
 *
 * Defines the possible status values for entities in the admin context.
 * Using an enum ensures consistent status values throughout the domain.
 */

const StatusEnum = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  LOCKED: "locked",
  DELETED: "deleted",
});

module.exports = { StatusEnum };
