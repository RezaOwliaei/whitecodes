/**
 * Authentication and Authorization middleware
 * Flow:
 * 1. Extracts JWT token from request
 * 2. Verifies token validity
 * 3. Attaches user info to request
 * 4. Optionally checks role permissions
 */

// STEP 1: Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Invalid token format");
    }

    // NOTE: Actual token verification will be implemented later
    // This is a placeholder for the JWT verification logic
    const user = { id: "placeholder", roles: ["admin"] };

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    error.status = 401;
    next(error);
  }
};

// STEP 2: Authorization middleware factory
export const authorize = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      if (!req.user.roles.includes(requiredRole)) {
        throw new Error("Insufficient permissions");
      }

      next();
    } catch (error) {
      error.status = 403;
      next(error);
    }
  };
};
