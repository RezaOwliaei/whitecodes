/**
 * Admin Routes - API v1
 */
import { Router } from "express";
import * as adminController from "../../controllers/admin.js";
import { validate } from "../../middlewares/genericValidationMiddleware.js";
import { createAdminSchema } from "../../validators/admin.validator.js";
import { authenticate, authorize } from "../../middlewares/authMiddleware.js";

const router = Router();

// Admin routes
router.post("/admins", validate(createAdminSchema), adminController.create);
router.get("/admins/:id", authenticate, adminController.getById);
router.patch(
  "/admins/:id/deactivate",
  authenticate,
  authorize("admin"),
  adminController.deactivate
);

export default router;
