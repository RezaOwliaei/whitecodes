import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";

import apiConfigs from "./shared/configs/api.config.js";
import middlewareConfigs from "./shared/configs/middlewares.config.js";

import responseHandlerMiddleware from "./shared/middlewares/middlewares/responseHandler.middleware.js";

import healthCheckRouter from "./healthCheck-context/api/routers/health.v1.router.js";
import registerSystemAdminRouter from "./admin-context/api/routers/admin.v1.router.js";

const app = express();

const registerRouter = (route) => {
  app.use(path.join(apiConfigs.pathPrefix, route.path), route.handler);
};

// Shared Middlewares
app.use(express.json());

app.use(cors(middlewareConfigs.cors));
app.use(helmet(middlewareConfigs.helmet));

// Register response helpers BEFORE routes
app.use(responseHandlerMiddleware);

// Register routes
registerRouter(healthCheckRouter);
registerRouter(registerSystemAdminRouter);

export default app;
