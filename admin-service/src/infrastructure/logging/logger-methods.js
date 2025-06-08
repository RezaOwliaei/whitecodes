export const WINSTON_LOG_METHODS = Object.freeze([
  "info",
  "warn",
  "error",
  "debug",
  "verbose",
  "http",
  "trace", // Mapped to debug
  "fatal", // Mapped to error
]);

export const PINO_LOG_METHODS = Object.freeze([
  "info",
  "warn",
  "error",
  "debug",
  "trace",
  "fatal",
  "verbose", // Mapped to debug
  "http", // Mapped to info
]);
