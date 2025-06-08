// Handle server startup
import logger from "../../shared/utils/logger.js";
export const start = async (server, serverConfig) => {
  // Get the port and environment from the configuration
  const { port, environment } = serverConfig;
  return new Promise((resolve, reject) => {
    server.listen(port, async (error) => {
      if (error) {
        logger.error(`Error starting server: ${error.message}`);
        reject(error);
      } else {
        logger.info(`Server Running in ${environment} mode on port ${port}`);
        resolve(server);
      }
    });
  });
};
