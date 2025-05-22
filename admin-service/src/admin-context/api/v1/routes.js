/**
 * Admin Context API Routes (v1)
 * Mounts /api/v1/admin endpoints and applies middleware
 */

import express from "express";

// Middleware
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { loggingMiddleware } from "../middlewares/logging.middleware.js";
import { errorHandlerMiddleware } from "../middlewares/errorHandler.middleware.js";

// Controllers
import { createAdminController } from "../controllers/createAdmin.controller.js";
import { deactivateAdminController } from "../controllers/deactivateAdmin.controller.js";

// Validators
import { createAdminValidator } from "../validators/createAdmin.validator.js";
import { deactivateAdminValidator } from "../validators/deactivateAdmin.validator.js";

const router = express.Router();

// Apply global middleware
router.use(loggingMiddleware);
router.use(authMiddleware);

// Admin routes
router.post(
  "/admins",
  validationMiddleware(createAdminValidator),
  createAdminController
);

router.patch(
  "/admins/:id/deactivate",
  validationMiddleware(deactivateAdminValidator),
  deactivateAdminController
);

// Apply error handler
router.use(errorHandlerMiddleware);

export default router;
