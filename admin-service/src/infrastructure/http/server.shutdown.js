import serverConfig from "../../shared/configs/serverConfig.js";
import logger from "../../shared/utils/logger.js";
import eventStore from "../database/eventstore.js";
import { mongodb } from "../database/mongodb.js";
import { postgres } from "../database/postgres.js";

// Shutdown server and clean up resources
export const shutdown = async (server) => {
  logger.warn("[shutdown.js] Initiating server shutdown...");

  // Shutdown databases
  await shutdownDatabases();

  // Check if the server is already closed
  if (!server.listening) {
    logger.warn("Server is not listening, skipping shutdown.");

    // Exiting the process with a warning code
    process.exit(1);
  }

  // Attempt to gracefully close the server
  try {
    await new Promise((resolve) => {
      server.close((error) => {
        if (error) {
          logger.error("[shutdown.js] Error during server shutdown:", {
            error,
          });
          process.exit(1);
        } else {
          logger.info("[shutdown.js] Server closed gracefully.");
          resolve();
        }
      });
    });

    // Delay to allow all processes to finalize if needed
    setTimeout(() => {
      logger.info("[shutdown.js] Shutdown completed. Exiting process.");
      process.exit(); // Successful shutdown
    }, serverConfig.shutdownTimeout);
  } catch (error) {
    logger.error("[shutdown.js] Error during server shutdown process:", error);
    // Exiting the process with an error code
    process.exit(1);
  }
};

async function shutdownDatabases() {
  logger.warn("[shutdown.js] Shutting down databases...");
  await Promise.all([
    shutdownPostgres(),
    shutdownEventStore(),
    shutdownMongoDB(),
  ]);
  logger.info("[shutdown.js] Databases shutdown successfully.");
}

async function shutdownPostgres() {
  try {
    // Check and shutdown the database if not already closed
    if (!postgres.pool.ended) {
      await postgres.shutdown();
      logger.info("[shutdown.js] Postgres connection closed successfully.");
    } else {
      logger.info("[shutdown.js] Postgres connection is already closed.");
    }
  } catch (error) {
    logger.error("[shutdown.js] Error during Postgres shutdown:", error);
  }
}

async function shutdownEventStore() {
  try {
    await eventStore.shutdown();
    logger.info("[shutdown.js] EventStore connection closed successfully.");
  } catch (error) {
    logger.error("[shutdown.js] Error during EventStore shutdown:", error);
  }
}

async function shutdownMongoDB() {
  try {
    await mongodb.shutdown();
    logger.info("[shutdown.js] MongoDB connection closed successfully.");
  } catch (error) {
    logger.error("[shutdown.js] Error during MongoDB shutdown:", error);
  }
}
