import { validateEnvVars } from "../utils/envValidator.js";

const requiredVars = [
  "NODE_ENV",
  "SERVER_CONFIGS_PORT",
  "SERVER_CONFIGS_SHUTDOWN_TIMEOUT"
];
const numericVars = ["SERVER_CONFIGS_PORT", "SERVER_CONFIGS_SHUTDOWN_TIMEOUT"];

validateEnvVars(requiredVars, numericVars);

export default {
  environment: process.env.NODE_ENV,
  port: Number(process.env.SERVER_CONFIGS_PORT),
  shutdownTimeout: Number(process.env.SERVER_CONFIGS_SHUTDOWN_TIMEOUT),
};
