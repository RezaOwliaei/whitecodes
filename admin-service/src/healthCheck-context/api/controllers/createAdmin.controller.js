/**
 * Create Admin Controller
 * Flow:
 * 1. Maps HTTP request to command DTO
 * 2. Delegates to application layer handler
 * 3. Returns appropriate HTTP response
 */

import { CreateAdminCommand } from "../dtos/commands/createAdmin.command.js";

export const createAdminController = async (req, res, next) => {
  try {
    // STEP 1: Map request to command DTO
    const command = new CreateAdminCommand({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role,
    });

    // STEP 2: Get command handler from DI container
    const commandHandler = req.container.resolve("createAdminCommandHandler");

    // STEP 3: Execute command
    const result = await commandHandler.execute(command);

    // STEP 4: Return success response
    return res.status(201).json({
      id: result.id,
      message: "Admin created successfully",
    });
  } catch (error) {
    // STEP 5: Delegate error handling to middleware
    next(error);
  }
};
