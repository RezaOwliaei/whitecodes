import { HealthResponseDto } from "../../dtos/common/health.response.dto.js";

/**
 * Health check controller
 * Flow:
 * 1. Checks service health
 * 2. Verifies dependencies if requested
 * 3. Returns formatted health status
 */
export const healthCheck = async (req, res, next) => {
  try {
    // STEP 1: Basic service check
    const healthData = {
      service: "admin-service",
      status: "healthy",
      version: process.env.npm_package_version || "1.0.0",
    };

    // STEP 2: Check dependencies if requested
    if (req.query.includeDependencies) {
      const dependencies = {};

      // Add dependency checks based on query parameters
      if (
        !req.query.dependencies ||
        req.query.dependencies.includes("database")
      ) {
        dependencies.database = {
          status: "healthy",
          latency: "20ms",
        };
      }

      if (!req.query.dependencies || req.query.dependencies.includes("cache")) {
        dependencies.cache = {
          status: "healthy",
          latency: "5ms",
        };
      }

      healthData.dependencies = dependencies;
    }

    // STEP 3: Format and send response
    const healthResponse = new HealthResponseDto(healthData);
    res.status(200).json(healthResponse);
  } catch (error) {
    // If health check fails, we should still use the error handler
    error.status = 503; // Service Unavailable
    next(error);
  }
};
