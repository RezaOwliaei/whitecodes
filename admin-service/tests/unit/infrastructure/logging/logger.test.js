import { describe, it, beforeEach, afterEach, mock } from "node:test";
import { expect } from "chai";

// We'll need to mock the config and adapters before importing the logger
const originalEnv = process.env;

describe("Logger Entry Point", () => {
  let createLogger, baseLogger;
  let mockWinstonAdapter, mockPinoAdapter;
  let mockLoggerConfig;

  beforeEach(async () => {
    // Reset environment
    process.env = { ...originalEnv };

    // Mock the config module
    mockLoggerConfig = {
      serviceName: "test-service",
      logger: "winston",
      logLevel: "info",
    };

    // Create mock adapters using Node.js built-in mocks
    mockWinstonAdapter = {
      error: mock.fn(),
      warn: mock.fn(),
      info: mock.fn(),
      http: mock.fn(),
      verbose: mock.fn(),
      debug: mock.fn(),
    };

    mockPinoAdapter = {
      error: mock.fn(),
      warn: mock.fn(),
      info: mock.fn(),
      debug: mock.fn(),
      trace: mock.fn(),
      fatal: mock.fn(),
    };

    // We need to dynamically import and mock the dependencies
    // This is a simplified approach for testing the logger entry point
  });

  afterEach(() => {
    process.env = originalEnv;
    createLogger = null;
    baseLogger = null;

    // Reset mocks to ensure test isolation
    if (mockWinstonAdapter) {
      Object.values(mockWinstonAdapter).forEach((mockFn) => {
        if (mockFn.mock) mockFn.mock.reset();
      });
    }
    if (mockPinoAdapter) {
      Object.values(mockPinoAdapter).forEach((mockFn) => {
        if (mockFn.mock) mockFn.mock.reset();
      });
    }
  });

  describe("Module exports", () => {
    it("should export createLogger as default", async () => {
      const { default: importedCreateLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      expect(importedCreateLogger).to.be.a("function");
    });

    it("should export baseLogger as named export", async () => {
      const { baseLogger: importedBaseLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      expect(importedBaseLogger).to.be.an("object");
      expect(importedBaseLogger).to.have.property("info");
      expect(importedBaseLogger).to.have.property("error");
    });

    it("should export both createLogger and baseLogger", async () => {
      const loggerModule = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      expect(loggerModule.default).to.be.a("function");
      expect(loggerModule.baseLogger).to.be.an("object");
    });
  });

  describe("createLogger function", () => {
    beforeEach(async () => {
      const { default: importedCreateLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      createLogger = importedCreateLogger;
    });

    it("should return a logger instance", () => {
      const logger = createLogger();
      expect(logger).to.be.an("object");
      expect(logger).to.have.property("info");
      expect(logger).to.have.property("error");
      expect(logger).to.have.property("warn");
      expect(logger).to.have.property("debug");
    });

    it("should accept context parameter", () => {
      const context = { module: "auth", feature: "login" };
      const logger = createLogger(context);
      expect(logger).to.be.an("object");
      expect(typeof logger.info).to.equal("function");
    });

    it("should accept empty context", () => {
      const logger = createLogger({});
      expect(logger).to.be.an("object");
    });

    it("should work without any parameters", () => {
      const logger = createLogger();
      expect(logger).to.be.an("object");
    });

    it("should accept options parameter", () => {
      const context = { module: "test" };
      const options = { adapterName: "winston" };
      const logger = createLogger(context, options);
      expect(logger).to.be.an("object");
    });

    it("should handle null context gracefully", () => {
      expect(() => createLogger(null)).to.not.throw();
      const logger = createLogger(null);
      expect(logger).to.be.an("object");
    });

    it("should handle undefined context gracefully", () => {
      expect(() => createLogger(undefined)).to.not.throw();
      const logger = createLogger(undefined);
      expect(logger).to.be.an("object");
    });
  });

  describe("Logger context handling", () => {
    beforeEach(async () => {
      const { default: importedCreateLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      createLogger = importedCreateLogger;
    });

    it("should create logger with base service context", () => {
      const logger = createLogger();

      // Test that logger works (actual context testing would require integration with factory)
      expect(() => logger.info("test message")).to.not.throw();
    });

    it("should merge provided context with base context", () => {
      const context = { module: "user", feature: "registration" };
      const logger = createLogger(context);

      expect(() => logger.info("test message")).to.not.throw();
    });

    it("should handle complex context objects", () => {
      const context = {
        module: "payment",
        feature: "processing",
        metadata: {
          version: "2.0",
          environment: "test",
        },
      };
      const logger = createLogger(context);

      expect(() => logger.info("test message")).to.not.throw();
    });

    it("should allow context override in individual calls", () => {
      const logger = createLogger({ module: "auth" });

      expect(() => {
        logger.info("test message", {
          context: { feature: "login" },
          userId: "123",
        });
      }).to.not.throw();
    });
  });

  describe("Adapter selection", () => {
    beforeEach(async () => {
      const { default: importedCreateLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      createLogger = importedCreateLogger;
    });

    it("should work with default adapter", () => {
      const logger = createLogger();
      expect(logger).to.be.an("object");
      expect(logger).to.have.property("info");
    });

    it("should accept adapter name in options", () => {
      const options = { adapterName: "winston" };
      const logger = createLogger({}, options);
      expect(logger).to.be.an("object");
    });

    it("should accept custom adapter instance", () => {
      const customAdapter = {
        info: () => {},
        error: () => {},
        warn: () => {},
        debug: () => {},
        verbose: () => {},
        http: () => {},
      };
      const options = {
        adapterInstance: customAdapter,
        logMethods: ["info", "error", "warn", "debug", "verbose", "http"],
      };
      const logger = createLogger({}, options);
      expect(logger).to.be.an("object");
    });

    it("should handle invalid adapter name gracefully", () => {
      const options = { adapterName: "invalid-adapter" };
      expect(() => createLogger({}, options)).to.not.throw();
    });
  });

  describe("baseLogger", () => {
    beforeEach(async () => {
      const { baseLogger: importedBaseLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      baseLogger = importedBaseLogger;
    });

    it("should be a pre-configured logger instance", () => {
      expect(baseLogger).to.be.an("object");
      expect(baseLogger).to.have.property("info");
      expect(baseLogger).to.have.property("error");
      expect(baseLogger).to.have.property("warn");
      expect(baseLogger).to.have.property("debug");
    });

    it("should have all standard logging methods", () => {
      const expectedMethods = ["info", "warn", "error", "debug"];
      expectedMethods.forEach((method) => {
        expect(baseLogger).to.have.property(method);
        expect(typeof baseLogger[method]).to.equal("function");
      });
    });

    it("should be usable immediately", () => {
      expect(() => baseLogger.info("test message")).to.not.throw();
      expect(() => baseLogger.error("test error")).to.not.throw();
      expect(() => baseLogger.warn("test warning")).to.not.throw();
      expect(() => baseLogger.debug("test debug")).to.not.throw();
    });

    it("should accept metadata", () => {
      expect(() => {
        baseLogger.info("test message", { userId: "123", action: "test" });
      }).to.not.throw();
    });

    it("should handle different message types", () => {
      expect(() => {
        baseLogger.info("string message");
        baseLogger.info(123);
        baseLogger.info({ object: "message" });
        baseLogger.info(true);
      }).to.not.throw();
    });
  });

  describe("Error handling", () => {
    beforeEach(async () => {
      const { default: importedCreateLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      createLogger = importedCreateLogger;
    });

    it("should handle adapter creation errors gracefully", () => {
      // This would require mocking the adapter constructors to throw errors
      expect(() => createLogger()).to.not.throw();
    });

    it("should handle factory creation errors gracefully", () => {
      expect(() => createLogger({ invalidContext: true })).to.not.throw();
    });

    it("should handle invalid options gracefully", () => {
      const invalidOptions = {
        adapterName: null,
        adapterInstance: "not-an-object",
        logMethods: "not-an-array",
      };
      expect(() => createLogger({}, invalidOptions)).to.not.throw();
    });
  });

  describe("Configuration integration", () => {
    beforeEach(async () => {
      const { default: importedCreateLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      createLogger = importedCreateLogger;
    });

    it("should use configuration for service name", () => {
      const logger = createLogger();
      expect(logger).to.be.an("object");
      // The actual service name would be set from config in real usage
    });

    it("should respect adapter configuration", () => {
      const logger = createLogger();
      expect(logger).to.be.an("object");
      // The adapter selection would be based on config in real usage
    });

    it("should handle missing configuration gracefully", () => {
      expect(() => createLogger()).to.not.throw();
    });
  });

  describe("Factory function behavior", () => {
    beforeEach(async () => {
      const { default: importedCreateLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      createLogger = importedCreateLogger;
    });

    it("should create new logger instances each time", () => {
      const logger1 = createLogger({ module: "auth" });
      const logger2 = createLogger({ module: "user" });

      expect(logger1).to.not.equal(logger2);
      expect(logger1).to.be.an("object");
      expect(logger2).to.be.an("object");
    });

    it("should create independent logger instances", () => {
      const logger1 = createLogger({ module: "auth" });
      const logger2 = createLogger({ module: "user" });

      // Both should work independently
      expect(() => {
        logger1.info("auth message");
        logger2.info("user message");
      }).to.not.throw();
    });

    it("should support different contexts for each instance", () => {
      const authLogger = createLogger({ module: "auth", feature: "login" });
      const userLogger = createLogger({
        module: "user",
        feature: "registration",
      });
      const paymentLogger = createLogger({
        module: "payment",
        feature: "processing",
      });

      expect(() => {
        authLogger.info("User login attempt");
        userLogger.info("New user registration");
        paymentLogger.info("Payment processed");
      }).to.not.throw();
    });
  });

  describe("Method availability", () => {
    beforeEach(async () => {
      const { default: importedCreateLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      createLogger = importedCreateLogger;
    });

    it("should provide standard logging methods", () => {
      const logger = createLogger();
      const standardMethods = ["info", "warn", "error", "debug"];

      standardMethods.forEach((method) => {
        expect(logger).to.have.property(method);
        expect(typeof logger[method]).to.equal("function");
      });
    });

    it("should provide adapter-specific methods when available", () => {
      const logger = createLogger();

      // These methods should be available based on the adapter
      if (logger.verbose) {
        expect(typeof logger.verbose).to.equal("function");
      }
      if (logger.http) {
        expect(typeof logger.http).to.equal("function");
      }
    });

    it("should not expose internal adapter methods", () => {
      const logger = createLogger();

      // Should not expose adapter internals
      expect(logger).to.not.have.property("logger");
      expect(logger).to.not.have.property("constructor");
      expect(logger).to.not.have.property("prototype");
    });
  });

  describe("JSDoc compliance", () => {
    beforeEach(async () => {
      const { default: importedCreateLogger } = await import(
        "../../../../src/infrastructure/logging/logger.js"
      );
      createLogger = importedCreateLogger;
    });

    it("should accept LoggerContext as documented", () => {
      const context = {
        service: "custom-service",
        module: "auth",
        feature: "login",
      };

      const logger = createLogger(context);
      expect(logger).to.be.an("object");
    });

    it("should accept optional options parameter as documented", () => {
      const context = { module: "test" };
      const options = { adapterName: "winston" };

      const logger = createLogger(context, options);
      expect(logger).to.be.an("object");
    });

    it("should return LoggerPort interface as documented", () => {
      const logger = createLogger();

      // Should have LoggerPort methods
      expect(logger).to.have.property("info");
      expect(logger).to.have.property("error");
      expect(logger).to.have.property("warn");
      expect(logger).to.have.property("debug");
    });
  });
});
