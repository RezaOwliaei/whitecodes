import app from "./app.js";
import createServer from "./infrastructure/http/server.create.js";
import startServer from "./infrastructure/http/server.start.js";
import serverConfigurations from "./shared/configs/server.config.js";

export const server = createServer(app);
export default await startServer(server, serverConfigurations);
