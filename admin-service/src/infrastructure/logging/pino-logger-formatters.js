import { sanitize } from "../../shared/utils/sanitizer.js";
import pino from "pino";

/**
 * Pino formatter for log level property.
 * Ensures the log level is always present as a property.
 * @param {string} label - The log level label
 * @returns {Object}
 */
export function levelFormatter(label) {
  return { level: label };
}

/**
 * Pino formatter for log object.
 * Sanitizes the log object and flattens context if present.
 * @param {Object} object - The log object
 * @returns {Object}
 */
export function logFormatter(object) {
  // Flatten context into the root if present (to align with Winston JSON format)
  let sanitized = sanitize(object);
  if (sanitized.context && typeof sanitized.context === "object") {
    sanitized = { ...sanitized, ...sanitized.context };
    delete sanitized.context;
  }
  return sanitized;
}

/**
 * Pino timestamp function (ISO format, similar to Winston's default)
 */
export const timestamp = pino.stdTimeFunctions.isoTime;
