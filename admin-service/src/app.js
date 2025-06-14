// External dependencies
import path from "path";

import cors from "cors";
import express from "express";
import helmet from "helmet";


// Internal configs
import healthCheckRouter from "./healthCheck-context/api/routers/health.v1.router.js";
import apiConfigs from "./shared/configs/api.config.js";
import middlewareConfigs from "./shared/configs/middlewares.config.js";

// Middlewares
import responseHandlerMiddleware from "./shared/middlewares/responseHandler.middleware.js";
import {
  notFoundHandler,
  genericErrorHandler,
} from "./shared/middlewares/responseHandler.middleware.js";

// Routers
// TODO: import registerSystemAdminRouter from "./admin-context/api/routers/admin.v1.router.js";

const app = express();

// Helper to register routers with prefix
const registerRouter = (router) => {
  app.use(path.join(apiConfigs.pathPrefix, router.path), router.handler);
};

// --- Global Middlewares ---
app.use(express.json());
app.use(cors(middlewareConfigs.cors));
app.use(helmet(middlewareConfigs.helmet));
app.use(responseHandlerMiddleware); // Attach response helpers

// --- API Routes ---
registerRouter(healthCheckRouter);
registerRouter(registerSystemAdminRouter);

// --- 404 Handler ---
app.use(notFoundHandler);

// --- Generic Error Handler ---
app.use(genericErrorHandler);

export default app;
