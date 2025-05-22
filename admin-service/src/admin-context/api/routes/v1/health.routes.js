import { Router } from "express";
import { healthCheck } from "../../controllers/common/health.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { healthCheckSchema } from "../../validators/health.validator.js";

/**
 * Health check routes
 * Flow:
 * 1. Validates health check parameters
 * 2. Routes to health check controller
 * 3. Supports dependency status checks
 */
const router = Router();

// ROUTE: Health check endpoint with optional dependency checks
router.get("/", validate(healthCheckSchema), healthCheck);

export default router;
