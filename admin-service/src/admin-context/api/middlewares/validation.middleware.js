/**
 * Request validation middleware
 * Flow:
 * 1. Takes a Joi schema as input
 * 2. Validates request data against schema
 * 3. Passes validated data to next middleware
 * 4. Returns validation errors if invalid
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // STEP 1: Determine what to validate
      const dataToValidate = {
        ...(Object.keys(req.body).length && { body: req.body }),
        ...(Object.keys(req.query).length && { query: req.query }),
        ...(Object.keys(req.params).length && { params: req.params }),
      };

      // STEP 2: Validate against schema
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        // BRANCH: Validation failed
        const details = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));

        const err = new Error("Validation failed");
        err.status = 400;
        err.details = details;
        throw err;
      }

      // STEP 3: Attach validated data
      if (value.body) req.body = value.body;
      if (value.query) req.query = value.query;
      if (value.params) req.params = value.params;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validation Middleware
 * Validates request data against provided Joi schema
 */

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
        })),
      });
    }

    next();
  };
};
