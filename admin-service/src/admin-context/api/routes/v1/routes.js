/**
 * Admin Context API Routes (v1)
 * Mounts /api/v1/admin endpoints and applies necessary middleware
 */

import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { loggingMiddleware } from "../../middlewares/logging.middleware";
import { errorHandlerMiddleware } from "../../middlewares/errorHandler.middleware";

// Controllers
import { createAdminController } from "../controllers/createAdmin.controller";
import { deactivateAdminController } from "../controllers/deactivateAdmin.controller";
import { getAdminProfileController } from "../controllers/getAdminProfile.controller";

// Validators
import { createAdminValidator } from "../validators/createAdmin.validator";
import { deactivateAdminValidator } from "../validators/deactivateAdmin.validator";

const router = express.Router();

// Apply common middleware
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

router.get("/admins/:id/profile", getAdminProfileController);

// Apply error handler
router.use(errorHandlerMiddleware);

export default router;
