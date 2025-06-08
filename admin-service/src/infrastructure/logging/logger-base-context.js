import loggerConfig from "../../shared/configs/logger.config.js";

/**
 * Base context configuration for this microservice.
 *
 * This is the primary configuration point for service-level logging context.
 * When deploying this logging subsystem to other microservices, update this file
 * with the appropriate service name and domain context.
 *
 * Flow:
 * 1. Reads service name from logger configuration (with fallback)
 * 2. Provides domain context for better log categorization
 * 3. Exports frozen object to prevent accidental mutations
 *
 * @typedef {Object} BaseContext
 * @property {string} service - The microservice name (from config or fallback)
 * @property {string} domain - The business domain this service belongs to
 */
export const BASE_CONTEXT = Object.freeze({
  service: loggerConfig.serviceName || "admin-service"
});
