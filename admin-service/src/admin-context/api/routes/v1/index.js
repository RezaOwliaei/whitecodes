import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import healthRoutes from "./health.routes.js";

/**
 * API v1 routes registry
 * Flow:
 * 1. Aggregates all v1 routes
 * 2. Mounts routes to specific paths
 * 3. Provides versioned routing
 */
const router = Router();

// MOUNT: Health check routes
router.use("/health", healthRoutes);

// MOUNT: Domain-specific routes
router.use("/admins", adminRoutes);

export default router;
