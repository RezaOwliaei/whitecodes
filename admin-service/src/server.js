import expressApp from "./infrastructure/http/expressApp.js";
import serverConfigurations from "./shared/configs/server.config.js";
import createServer from "./infrastructure/http/server.create.js";
import startServer from "./infrastructure/http/server.start.js";

export const server = createServer(expressApp);
export default await startServer(server, serverConfigurations);
