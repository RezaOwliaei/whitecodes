/**
 * Deactivate Admin Controller
 * Flow:
 * 1. Maps HTTP request to command DTO
 * 2. Delegates to application layer handler
 * 3. Returns appropriate HTTP response
 */

import { DeactivateAdminCommand } from "../dtos/commands/deactivateAdmin.command.js";

export const deactivateAdminController = async (req, res, next) => {
  try {
    // STEP 1: Map request to command DTO
    const command = new DeactivateAdminCommand({
      adminId: req.params.id,
      reason: req.body.reason,
      deactivatedBy: req.user.id, // Assuming auth middleware attaches user
    });

    // STEP 2: Get command handler from DI container
    const commandHandler = req.container.resolve(
      "deactivateAdminCommandHandler"
    );

    // STEP 3: Execute command
    const result = await commandHandler.execute(command);

    // STEP 4: Return success response
    return res.status(200).json({
      id: result.id,
      status: result.status,
      message: "Admin deactivated successfully",
    });
  } catch (error) {
    // STEP 5: Delegate error handling to middleware
    next(error);
  }
};
