/**
 * Request/Response logging middleware
 * Flow:
 * 1. Logs incoming request details
 * 2. Tracks response time
 * 3. Logs outgoing response details
 */
export const requestLogger = (req, res, next) => {
  // STEP 1: Generate request ID and start time
  req.id = crypto.randomUUID();
  const startTime = Date.now();

  // STEP 2: Log request details
  console.info("[Request]", {
    id: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? "[REDACTED]" : undefined,
    },
    body: req.body,
  });

  // STEP 3: Capture response using response event
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.info("[Response]", {
      id: req.id,
      status: res.statusCode,
      duration: `${duration}ms`,
      headers: res.getHeaders(),
    });
  });

  next();
};
