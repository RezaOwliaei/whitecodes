/**
 * Health check response DTO
 * Flow:
 * 1. Formats health check results
 * 2. Provides consistent health status structure
 * 3. Used by health controller for responses
 */
export class HealthResponseDto {
  /**
   * @param {Object} data - Health check data
   * @param {string} data.service - Service name
   * @param {string} data.status - Health status (healthy/unhealthy)
   * @param {string} data.version - Service version
   * @param {Object} [data.dependencies] - Status of service dependencies
   */
  constructor({ service, status, version, dependencies = {} }) {
    this.service = service;
    this.status = status;
    this.version = version;
    this.timestamp = new Date().toISOString();

    // CONDITIONAL: Include dependencies if provided
    if (Object.keys(dependencies).length > 0) {
      this.dependencies = dependencies;
    }
  }

  /**
   * Returns a plain object representation of the health status
   * @returns {Object} Formatted health check response
   */
  toJSON() {
    return {
      service: this.service,
      status: this.status,
      version: this.version,
      timestamp: this.timestamp,
      ...(this.dependencies && { dependencies: this.dependencies }),
    };
  }
}
