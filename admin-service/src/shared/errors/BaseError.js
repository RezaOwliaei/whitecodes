// BaseError.js
// Base class for all custom errors with automatic caller detection capabilities.

class BaseError extends Error {
  /**
   * Creates a base error with automatic caller context detection.
   *
   * Flow:
   * 1. Accepts message and optional configuration
   * 2. Automatically detects caller context from own stack trace
   * 3. Sets component and operation from detected context
   * 4. Allows manual override if needed
   *
   * @param {string} message - Error message.
   * @param {object} [options] - Configuration options
   * @param {string} [options.component] - Manual component override (auto-detected if not provided)
   * @param {string} [options.operation] - Manual operation override (auto-detected if not provided)
   * @param {object} [options.details] - Additional context or details
   * @param {number} [options.stackDepth] - Stack depth for caller detection (default: 1)
   */
  constructor(message, options = {}) {
    super(message);

    // Set error name to the actual class name (ConfigurationError, ValidationError, etc.)
    this.name = this.constructor.name;

    // Capture stack trace for this error
    Error.captureStackTrace?.(this, this.constructor);

    // Auto-detect caller context from this error's stack trace if not manually provided
    const detectedContext = this.#parseCallerFromStack(options.stackDepth || 1);

    this.component = options.component ?? detectedContext.component;
    this.operation = options.operation ?? detectedContext.operation;
    this.details = Object.keys(options.details || {}).length
      ? options.details
      : null;
  }

  /**
   * Parses caller context from this error's stack trace.
   *
   * @param {number} depth - Stack depth to extract (1 = caller of constructor)
   * @returns {Object} Caller context with component and operation
   * @private
   */
  #parseCallerFromStack(depth = 1) {
    try {
      if (!this.stack) return this.#createFallbackContext();

      const stackLines = this.stack.split("\n");

      if (stackLines.length <= depth) return this.#createFallbackContext();

      const targetLine = stackLines[depth].trim();

      return this.#parseStackLine(targetLine);
    } catch (error) {
      return this.#createFallbackContext();
    }
  }

  /**
   * Parses a single stack trace line to extract caller information.
   *
   * @param {string} stackLine - A single line from the stack trace
   * @returns {Object} Parsed caller context
   * @private
   */
  #parseStackLine(stackLine) {
    // Try to extract Class.method pattern
    const classMethodMatch = stackLine.match(/at\s+(\w+)\.([^(\s]+)\s*\(/);
    if (classMethodMatch) {
      return {
        component: classMethodMatch[1].toLowerCase(),
        operation: classMethodMatch[2],
      };
    }

    // Try to extract Object.method pattern
    const objectMethodMatch = stackLine.match(/at\s+Object\.([^(\s]+)\s*\(/);
    if (objectMethodMatch) {
      return {
        component: "object",
        operation: objectMethodMatch[1],
      };
    }

    // Try to extract simple function name
    const functionMatch = stackLine.match(/at\s+([^(\s]+)\s*\(/);
    if (functionMatch) {
      const functionName = functionMatch[1];
      return this.#inferContextFromFunctionName(functionName);
    }

    return this.#createFallbackContext();
  }

  /**
   * Infers component context from function name patterns.
   *
   * @param {string} functionName - The extracted function name
   * @returns {Object} Inferred caller context
   * @private
   */
  #inferContextFromFunctionName(functionName) {
    // Infer component from function name patterns
    if (functionName.includes("Factory") || functionName.includes("factory")) {
      return {
        component: "factory",
        operation: "factory-operation",
      };
    }

    if (functionName.includes("create") || functionName.includes("Create")) {
      return {
        component: "factory",
        operation: "creation",
      };
    }

    if (functionName.includes("Service") || functionName.includes("service")) {
      return {
        component: functionName.toLowerCase().replace("service", ""),
        operation: "service-operation",
      };
    }

    return {
      component: functionName.toLowerCase(),
      operation: "function-call",
    };
  }

  /**
   * Creates a fallback context when stack parsing fails.
   *
   * @returns {Object} Default fallback context
   * @private
   */
  #createFallbackContext() {
    return {
      component: "unknown",
      operation: "unknown",
    };
  }
}

export { BaseError };
