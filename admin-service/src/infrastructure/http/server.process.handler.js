import shutdown  from "./server.shutdown.js";

// Centralized process event handling
export const registerProcessEvents = (server) => {
  // Handle uncaught exceptions
  const handleUncaughtException = async (error) => {
    logger.error("Uncaught Exception:", error);
    process.exitCode = 1;
    await shutdown(server);
  };
  // Handle unhandled rejections
  const handleUnhandledRejection = async (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exitCode = 1;
    await shutdown(server);
  };

  // Handle shutdown signals (e.g., SIGTERM, SIGINT)
  const handleShutdownSignal = async (signal) => {
    logger.warn(`${signal} received`);
    process.exitCode = 0;
    await shutdown(server);
  };

  server.on("error", handleUncaughtException);
  process.on("unhandledRejection", handleUnhandledRejection);
  process.on("uncaughtException", handleUncaughtException);
  process.on("SIGTERM", handleShutdownSignal);
  process.on("SIGINT", handleShutdownSignal);
  process.on("SIGUSR1", handleShutdownSignal);
  process.on("SIGUSR2", handleShutdownSignal);
  process.on("exit", (exitCode) => {
    logger.warn(`Process Exited with Code ${exitCode}`);
  });
};
