import { validateEnvVars } from "../utils/envValidator.js";

// Helper to parse boolean values from env variables
function parseBool(str) {
  return String(str).toLowerCase() === "true";
}

const requiredVars = [
  "LOGGER_CONFIGS_ADAPTER",
  "LOGGER_CONFIGS_LOG_LEVEL",
  "LOGGER_CONFIGS_STORE_LOGS",
  "LOGGER_CONFIGS_LOG_TO_CONSOLE",
];
const numericVars = [];
const booleanVars = [
  "LOGGER_CONFIGS_STORE_LOGS",
  "LOGGER_CONFIGS_LOG_TO_CONSOLE",
];

validateEnvVars(requiredVars, numericVars, booleanVars);

export default {
  environment: process.env.NODE_ENV || "development",
  serviceName: process.env.SERVICE_NAME || "admin-service",
  logger: process.env.LOGGER_CONFIGS_ADAPTER,
  storeLogs: parseBool(process.env.LOGGER_CONFIGS_STORE_LOGS),
  logToConsole: parseBool(process.env.LOGGER_CONFIGS_LOG_TO_CONSOLE),
  logLevel: process.env.LOGGER_CONFIGS_LOG_LEVEL,
};
