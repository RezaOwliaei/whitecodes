/**
 * Authentication Middleware
 * Flow:
 * 1. Extracts token from request
 * 2. Verifies token authenticity
 * 3. Attaches user to request
 * 4. Rejects if invalid
 */

export const authMiddleware = (req, res, next) => {
  try {
    // STEP 1: Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const err = new Error("Authorization header missing or invalid");
      err.status = 401;
      throw err;
    }

    const token = authHeader.split(" ")[1];

    // STEP 2: Verify token (simplified for example)
    // In a real implementation, this would use JWT verification
    const isValid = token && token.length > 10;
    if (!isValid) {
      const err = new Error("Invalid token");
      err.status = 401;
      throw err;
    }

    // STEP 3: Attach user to request
    // In a real implementation, this would decode the JWT payload
    req.user = {
      id: "sample-user-id",
      role: "ADMIN",
    };

    next();
  } catch (error) {
    next(error);
  }
};
