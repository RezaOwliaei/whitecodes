import { createServer } from "node:http";

import { registerProcessEvents } from "./server.process.handler";

export const create = (app) => {
  const server = createServer(app);
  registerProcessEvents(server);
  return server;
};
