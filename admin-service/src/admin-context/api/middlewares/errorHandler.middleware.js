import { ErrorResponseDto } from "../dtos/common/error.response.dto.js";

/**
 * Global error handling middleware
 * Flow:
 * 1. Catches all unhandled errors
 * 2. Maps domain/application errors to HTTP responses
 * 3. Formats errors using ErrorResponseDto
 * 4. Sends consistent error response to client
 */
export const errorHandler = (err, req, res, next) => {
  // STEP 1: Determine error status and message
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  // STEP 2: Create formatted error response
  const errorResponse = new ErrorResponseDto(
    status,
    message,
    err.details || [],
    err.code
  );

  // STEP 3: Log error for debugging
  console.error("[Error]", {
    path: req.path,
    method: req.method,
    error: err,
    stack: err.stack,
  });

  // STEP 4: Send error response
  res.status(status).json(errorResponse);
};
