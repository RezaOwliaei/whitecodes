import {
  HTTP_STATUS,
  getHttpStatusByCode,
} from "../constants/http.constants.js";
import logger from "../utils/logger.js";
import serverConfig from "../configs/server.config.js";

/**
 * Middleware to add standardized response helpers to the res object.
 * Provides: res.sendSuccess, res.sendCreated, res.sendError
 */
function responseHandlerMiddleware(req, res, next) {
  /**
   * Send a successful response.
   * @param {*} data - Response data
   * @param {string} [message] - Optional message
   * @param {object|number} [status=HTTP_STATUS.OK] - HTTP status object or code
   */
  res.sendSuccess = (data, message, status = HTTP_STATUS.OK) => {
    const statusObj =
      typeof status === "number" ? getHttpStatusByCode(status) : status;
    res.status(statusObj?.code || HTTP_STATUS.OK.code).json({
      success: true,
      message: message || statusObj?.message || HTTP_STATUS.OK.message,
      data,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Send a created response.
   * @param {*} data - Response data
   * @param {string} [message] - Optional message
   * @param {object|number} [status=HTTP_STATUS.CREATED] - HTTP status object or code
   */
  res.sendCreated = (data, message, status = HTTP_STATUS.CREATED) => {
    const statusObj =
      typeof status === "number" ? getHttpStatusByCode(status) : status;
    res.status(statusObj?.code || HTTP_STATUS.CREATED.code).json({
      success: true,
      message: message || statusObj?.message || HTTP_STATUS.CREATED.message,
      data,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Send an error response.
   * @param {Error} error - Error object
   * @param {object|number} [status=HTTP_STATUS.INTERNAL_SERVER_ERROR] - HTTP status object or code
   */
  res.sendError = (error, status = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
    const statusObj =
      typeof status === "number" ? getHttpStatusByCode(status) : status;
    logger.error(
      `[responseMiddleware.js] ${error?.message || "Unknown error"}`,
      error
    );
    const errorResponse = {
      success: false,
      error: {
        message:
          error?.message ||
          statusObj?.message ||
          HTTP_STATUS.INTERNAL_SERVER_ERROR.message,
        name: error?.name || "Error",
      },
      timestamp: new Date().toISOString(),
    };
    if (serverConfig.environment === "development" && error?.stack) {
      errorResponse.error.stack = error.stack;
    }
    res
      .status(statusObj?.code || HTTP_STATUS.INTERNAL_SERVER_ERROR.code)
      .json(errorResponse);
  };

  next();
}

/**
 * 404 Not Found handler for use in app.js
 */
export const notFoundHandler = (req, res) => {
  if (typeof res.sendError === "function") {
    res.sendError(new Error("Resource not found"), HTTP_STATUS.NOT_FOUND);
  } else {
    res.status(HTTP_STATUS.NOT_FOUND.code).json({
      success: false,
      error: {
        message: HTTP_STATUS.NOT_FOUND.message,
        name: "NotFoundError",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Generic error handler for use in app.js
 */
export const genericErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.sendError(err);
};

export default responseHandlerMiddleware;
