/**
 * Error Handler Middleware
 * Flow:
 * 1. Catches errors from previous middleware or routes
 * 2. Formats errors for consistent API responses
 * 3. Logs errors for monitoring
 */

export const errorHandlerMiddleware = (err, req, res, next) => {
  // STEP 1: Determine error type and status code
  const statusCode = err.status || 500;
  const errorType =
    statusCode === 500
      ? "INTERNAL_SERVER_ERROR"
      : statusCode === 400
      ? "VALIDATION_ERROR"
      : statusCode === 401
      ? "AUTHENTICATION_ERROR"
      : statusCode === 403
      ? "AUTHORIZATION_ERROR"
      : statusCode === 404
      ? "NOT_FOUND"
      : "UNKNOWN_ERROR";

  // STEP 2: Log the error (with stack trace in development)
  console.error({
    type: "ERROR",
    timestamp: new Date().toISOString(),
    path: req.path,
    statusCode,
    errorType,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    details: err.details,
  });

  // STEP 3: Send formatted error response
  res.status(statusCode).json({
    error: {
      type: errorType,
      message: err.message,
      details: err.details || undefined,
    },
  });
};
