/**
 * Health Check Router
 *
 * Flow:
 * 1. Provides basic health status endpoint
 * 2. Returns system status and timestamp
 * 3. Can be extended with database connectivity checks
 *
 * @description Basic health check endpoint for Docker and monitoring systems
 */

import { Router } from "express";

const router = Router();

/**
 * GET /api/v1/health
 *
 * Flow:
 * 1. Returns basic health status
 * 2. Includes timestamp and service information
 * 3. Always returns 200 OK for basic liveness check
 *
 * @returns {Object} Health status response
 */
router.get("/api/v1/health", (req, res) => {
  const healthStatus = {
    status: "healthy",
    service: "admin-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "development"
  };

  res.status(200).json(healthStatus);
});

/**
 * GET /api/v1/health/detailed
 *
 * Flow:
 * 1. Returns detailed health information
 * 2. Includes memory usage and system metrics
 * 3. Can be extended with database connection status
 *
 * @returns {Object} Detailed health status response
 */
router.get("/api/v1/health/detailed", (req, res) => {
  const memoryUsage = process.memoryUsage();

  const detailedHealth = {
    status: "healthy",
    service: "admin-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    system: {
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
    // TODO: Add database connectivity checks
    // TODO: Add external service dependency checks
  };

  res.status(200).json(detailedHealth);
});

export default router;
