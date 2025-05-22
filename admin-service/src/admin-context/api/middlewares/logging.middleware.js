/**
 * Logging Middleware
 * Flow:
 * 1. Logs incoming request details
 * 2. Measures response time
 * 3. Logs outgoing response details
 */

export const loggingMiddleware = (req, res, next) => {
  // STEP 1: Capture request start time
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);

  // STEP 2: Log request details
  console.log({
    type: "REQUEST",
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // STEP 3: Capture response data
  const originalSend = res.send;
  res.send = function (body) {
    res.responseBody = body;
    return originalSend.call(this, body);
  };

  // STEP 4: Log after response is sent
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log({
      type: "RESPONSE",
      timestamp: new Date().toISOString(),
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("Content-Length") || 0,
    });
  });

  next();
};
