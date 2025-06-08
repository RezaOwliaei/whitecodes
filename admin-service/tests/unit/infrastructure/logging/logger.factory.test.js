import { describe, it, beforeEach, afterEach, mock } from "node:test";

import { expect } from "chai";

import { createLoggerFactory } from "../../../../src/infrastructure/logging/logger.factory.js";
import { LoggerPort } from "../../../../src/infrastructure/logging/logger.port.js";
import { ConfigurationError } from "../../../../src/shared/errors/ConfigurationError.js";

/**
 * Logger Factory Tests
 *
 * Architecture: Infrastructure Component (Comprehensive Behavior Testing)
 * Scope: Critical infrastructure with method wrapping, context merging, and error handling
 *
 * Flow:
 * 1. Validates adapter contracts and method availability
 * 2. Tests context merging behavior (default + per-call)
 * 3. Verifies fallback safety mechanisms
 * 4. Ensures proper error handling and propagation
 */
describe("Logger Factory", () => {
  let mockLoggerPortAdapter;

  beforeEach(() => {
    // Mock adapter that extends LoggerPort
    class MockLoggerPortAdapter extends LoggerPort {
      constructor() {
        super();
        this.info = mock.fn();
        this.error = mock.fn();
        this.warn = mock.fn();
        this.debug = mock.fn();
      }
    }
    mockLoggerPortAdapter = new MockLoggerPortAdapter();
  });

  afterEach(() => {
    // Reset all mocks to ensure test isolation
    if (mockLoggerPortAdapter) {
      Object.values(mockLoggerPortAdapter).forEach((mockFn) => {
        if (mockFn && mockFn.mock) {
          mockFn.mock.resetCalls();
        }
      });
    }
  });

  describe("Factory Creation", () => {
    it("should create logger with specified methods", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockLoggerPortAdapter,
        ["info", "error", "warn", "debug"]
      );

      const expectedMethods = ["info", "error", "warn", "debug"];
      expectedMethods.forEach(method => {
        expect(logger).to.have.property(method);
        expect(() => logger[method]("test")).to.not.throw();
      });
    });

    it("should only wrap methods specified in logMethods array", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockLoggerPortAdapter,
        ["info", "error"]
      );

      expect(logger).to.have.property("info");
      expect(logger).to.have.property("error");
      expect(logger).to.not.have.property("warn");
      expect(logger).to.not.have.property("debug");
    });
  });

  describe("LoggerPort Validation", () => {
    it("should work with adapters that extend LoggerPort", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockLoggerPortAdapter,
        ["info"]
      );

      expect(logger).to.have.property("info");
      expect(typeof logger.info).to.equal("function");
    });

    it("should throw error when adapter does not extend LoggerPort", () => {
      const nonLoggerPortAdapter = {
        info: () => {},
        error: () => {},
      };

      expect(() => {
        createLoggerFactory(
          { context: { service: "test-service" } },
          nonLoggerPortAdapter,
          ["info"]
        );
      }).to.throw(
        ConfigurationError,
        /Logger adapter must extend LoggerPort. Received: object/
      );
    });

    it("should reject adapters that don't extend LoggerPort", () => {
      const invalidAdapters = [
        { name: "plain object", adapter: { info: () => {} } },
        {
          name: "class instance",
          adapter: new (class CustomAdapter {
            info() {}
          })(),
        },
        { name: "null", adapter: null },
        { name: "primitive", adapter: "string" },
      ];

      invalidAdapters.forEach(({ name, adapter }) => {
        expect(() => {
          createLoggerFactory(
            { context: { service: "test-service" } },
            adapter,
            ["info"]
          );
        }, `should reject ${name}`).to.throw(
          ConfigurationError,
          /Logger adapter must extend LoggerPort/
        );
      });
    });
  });

  describe("Adapter Contract Validation", () => {
    it("should throw error when adapter missing required methods", () => {
      class IncompleteAdapter extends LoggerPort {
        info() {
          // Only implements info method
        }
        // Override inherited methods with non-function values to simulate missing methods
        error = undefined;
        warn = null;
        debug = "not a function";
      }
      const incompleteAdapter = new IncompleteAdapter();

      expect(() => {
        createLoggerFactory(
          { context: { service: "test-service" } },
          incompleteAdapter,
          ["info", "error", "warn", "debug"]
        );
      }).to.throw(
        ConfigurationError,
        /Logger adapter missing required methods: error, warn, debug/
      );
    });

    it("should pass factory validation but fail at runtime for unimplemented LoggerPort methods", () => {
      class PartiallyImplementedAdapter extends LoggerPort {
        info(message, meta) {
          // Properly implemented
          return `logged: ${message}`;
        }
        // error, warn, debug inherit base class error-throwing behavior
      }

      const partialAdapter = new PartiallyImplementedAdapter();

      // Factory creation should succeed (methods exist as functions)
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        partialAdapter,
        ["info", "error"]
      );

      // Implemented method should work
      expect(() => {
        logger.info("test message");
      }).to.not.throw();

      // Unimplemented method should throw at runtime
      expect(() => {
        logger.error("test error");
      }).to.throw('Method "error" must be implemented by subclass');
    });
  });

  describe("Context Merging Behavior", () => {
    it("should merge default context with per-call context", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service", module: "auth" } },
        mockLoggerPortAdapter,
        ["info"]
      );

      logger.info("test message", {
        context: { feature: "login" },
        additionalData: "extra",
      });

      expect(mockLoggerPortAdapter.info.mock.callCount()).to.equal(1);
      const call = mockLoggerPortAdapter.info.mock.calls[0];
      expect(call.arguments[0]).to.equal("test message");
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
        module: "auth",
        feature: "login",
      });
      expect(call.arguments[1].additionalData).to.equal("extra");
    });

    it("should override default context with per-call context", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service", module: "auth" } },
        mockLoggerPortAdapter,
        ["info"]
      );

      logger.info("test message", {
        context: { module: "user", feature: "registration" },
      });

      const call = mockLoggerPortAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
        module: "user",
        feature: "registration",
      });
    });

    it("should handle nested context merging correctly", () => {
      const logger = createLoggerFactory(
        {
          context: {
            service: "test-service",
            module: "auth",
            metadata: { version: "1.0" },
          },
        },
        mockLoggerPortAdapter,
        ["info"]
      );

      logger.info("test message", {
        context: {
          feature: "login",
          metadata: { requestId: "123" },
        },
        extraData: "value",
      });

      const call = mockLoggerPortAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
        module: "auth",
        feature: "login",
        metadata: { version: "1.0", requestId: "123" }, // deep merge preserves version
      });
      expect(call.arguments[1].extraData).to.equal("value");
    });

    it("should preserve existing meta properties", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockLoggerPortAdapter,
        ["info"]
      );

      const originalMeta = {
        userId: "123",
        requestId: "req-456",
        timestamp: new Date(),
      };

      logger.info("test message", originalMeta);

      const call = mockLoggerPortAdapter.info.mock.calls[0];
      expect(call.arguments[1]).to.include(originalMeta);
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
      });
    });
  });

  describe("Fallback Safety Mechanisms", () => {
    it("should use fallback context when no context provided", () => {
      const logger = createLoggerFactory(
        { context: {} },
        mockLoggerPortAdapter,
        ["info"]
      );

      logger.info("test message");

      const call = mockLoggerPortAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "unknown-service",
      });
    });

    it("should use fallback context for invalid context values", () => {
      // Test critical fallback behavior for various invalid contexts
      const invalidContexts = [undefined, null];

      invalidContexts.forEach((invalidContext, index) => {
        // Create isolated mock for each iteration
        class IsolatedMockAdapter extends LoggerPort {
          constructor() {
            super();
            this.info = mock.fn();
          }
        }
        const isolatedMockAdapter = new IsolatedMockAdapter();

        const logger = createLoggerFactory(
          { context: invalidContext },
          isolatedMockAdapter,
          ["info"]
        );

        logger.info("test message");

        expect(isolatedMockAdapter.info.mock.callCount()).to.equal(1);
        const call = isolatedMockAdapter.info.mock.calls[0];
        expect(call.arguments[1].context).to.deep.equal({
          service: "unknown-service",
        });
      });
    });
  });

  describe("Multi-Method Behavior", () => {
    it("should handle multiple method calls independently", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockLoggerPortAdapter,
        ["info", "error"]
      );

      logger.info("info message", { context: { feature: "login" } });
      logger.error("error message", { context: { feature: "validation" } });

      expect(mockLoggerPortAdapter.info.mock.callCount()).to.equal(1);
      expect(mockLoggerPortAdapter.error.mock.callCount()).to.equal(1);

      const infoCall = mockLoggerPortAdapter.info.mock.calls[0];
      expect(infoCall.arguments[0]).to.equal("info message");
      expect(infoCall.arguments[1].context.feature).to.equal("login");

      const errorCall = mockLoggerPortAdapter.error.mock.calls[0];
      expect(errorCall.arguments[0]).to.equal("error message");
      expect(errorCall.arguments[1].context.feature).to.equal("validation");
    });
  });

  describe("Error Handling", () => {
    it("should propagate adapter method errors", () => {
      class ErrorAdapter extends LoggerPort {
        info() {
          throw new Error("Adapter error");
        }
      }
      const errorAdapter = new ErrorAdapter();

      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        errorAdapter,
        ["info"]
      );

      expect(() => {
        logger.info("test message");
      }).to.throw("Adapter error");
    });

    it("should validate logMethods parameter type", () => {
      expect(() => {
        createLoggerFactory(
          { context: { service: "test-service" } },
          mockLoggerPortAdapter,
          "info" // Should be an array
        );
      }).to.throw(TypeError, /logMethods must be an array/);
    });
  });

  describe("Advanced Context Merging", () => {
    it("should handle deeply nested context merging with arrays and complex objects", () => {
      const complexDefaultContext = {
        service: "test-service",
        metadata: {
          version: "1.0",
          features: ["auth", "logging"],
          config: {
            timeout: 5000,
            retries: 3,
          },
        },
        tags: ["production", "critical"],
      };

      const logger = createLoggerFactory(
        { context: complexDefaultContext },
        mockLoggerPortAdapter,
        ["info"]
      );

      const complexCallContext = {
        metadata: {
          requestId: "req-123",
          features: ["auth", "validation"], // Should override array
          config: {
            timeout: 10000, // Should override nested property
            maxSize: 1024, // Should add new property
          },
        },
        tags: ["debug"], // Should override array
        userId: "user-456", // Should add new property
      };

      logger.info("complex test", { context: complexCallContext });

      const call = mockLoggerPortAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service", // Preserved from default
        metadata: {
          version: "1.0", // Preserved from default
          requestId: "req-123", // Added from call context
          features: ["auth", "validation"], // Overridden by call context
          config: {
            timeout: 10000, // Overridden by call context
            retries: 3, // Preserved from default
            maxSize: 1024, // Added from call context
          },
        },
        tags: ["debug"], // Overridden by call context
        userId: "user-456", // Added from call context
      });
    });
  });

  describe("Performance Characteristics", () => {
    it("should not significantly impact performance when wrapping methods", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockLoggerPortAdapter,
        ["info"]
      );

      // Measure wrapped method performance
      const iterations = 1000;
      const startTime = process.hrtime.bigint();

      for (let i = 0; i < iterations; i++) {
        logger.info(`test message ${i}`, { context: { iteration: i } });
      }

      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      // Verify all calls were made
      expect(mockLoggerPortAdapter.info.mock.callCount()).to.equal(iterations);

      // Performance assertion - should complete 1000 calls in reasonable time
      // This is a loose check to catch major performance regressions
      expect(duration).to.be.lessThan(10); // Less than 10ms for 1000 calls
    });
  });

  describe("Memory Management", () => {
    it("should not create memory leaks with repeated factory calls", () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const loggers = [];

      // Create many logger instances
      for (let i = 0; i < 100; i++) {
        const logger = createLoggerFactory(
          { context: { service: `test-service-${i}` } },
          mockLoggerPortAdapter,
          ["info", "error"]
        );
        loggers.push(logger);

        // Use each logger to ensure it's not optimized away
        logger.info(`test message ${i}`);
      }

      // Force garbage collection if available (Node.js with --expose-gc flag)
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB for 100 loggers)
      // This is a loose check to catch major memory leaks
      expect(memoryIncrease).to.be.lessThan(10 * 1024 * 1024); // 10MB

      // Verify all loggers work correctly
      expect(mockLoggerPortAdapter.info.mock.callCount()).to.equal(100);
    });
  });

  describe("Context Immutability", () => {
    it("should not mutate original context objects", () => {
      const originalDefaultContext = {
        service: "test-service",
        metadata: { version: "1.0" },
        tags: ["production"],
      };

      const originalCallContext = {
        feature: "login",
        metadata: { requestId: "123" },
        tags: ["auth"],
      };

      // Create deep copies to compare against
      const defaultContextCopy = JSON.parse(
        JSON.stringify(originalDefaultContext)
      );
      const callContextCopy = JSON.parse(JSON.stringify(originalCallContext));

      const logger = createLoggerFactory(
        { context: originalDefaultContext },
        mockLoggerPortAdapter,
        ["info"]
      );

      logger.info("test message", { context: originalCallContext });

      // Verify original objects were not mutated
      expect(originalDefaultContext).to.deep.equal(defaultContextCopy);
      expect(originalCallContext).to.deep.equal(callContextCopy);

      // Verify the merged context was created correctly
      const call = mockLoggerPortAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
        feature: "login",
        metadata: { version: "1.0", requestId: "123" }, // Deep merge preserves version
        tags: ["auth"], // Arrays are replaced entirely
      });
    });

    it("should handle frozen and sealed context objects", () => {
      const frozenContext = Object.freeze({
        service: "test-service",
        metadata: Object.freeze({ version: "1.0" }),
      });

      const sealedContext = Object.seal({
        feature: "login",
        metadata: { requestId: "123" },
      });

      const logger = createLoggerFactory(
        { context: frozenContext },
        mockLoggerPortAdapter,
        ["info"]
      );

      // Should not throw errors with frozen/sealed objects
      expect(() => {
        logger.info("test message", { context: sealedContext });
      }).to.not.throw();

      const call = mockLoggerPortAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
        feature: "login",
        metadata: { version: "1.0", requestId: "123" }, // Deep merge preserves version
      });
    });
  });

  describe("Error Boundary Testing", () => {
    it("should handle various types of adapter method exceptions", () => {
      class ExceptionAdapter extends LoggerPort {
        info(message) {
          if (message.includes("type-error")) {
            throw new TypeError("Type error in adapter");
          }
          if (message.includes("reference-error")) {
            throw new ReferenceError("Reference error in adapter");
          }
          if (message.includes("custom-error")) {
            const error = new Error("Custom error");
            error.code = "CUSTOM_ERROR";
            error.details = { timestamp: Date.now() };
            throw error;
          }
          // Normal operation
        }
      }

      const exceptionAdapter = new ExceptionAdapter();
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        exceptionAdapter,
        ["info"]
      );

      // Test TypeError propagation
      expect(() => {
        logger.info("type-error message");
      }).to.throw(TypeError, "Type error in adapter");

      // Test ReferenceError propagation
      expect(() => {
        logger.info("reference-error message");
      }).to.throw(ReferenceError, "Reference error in adapter");

      // Test custom error propagation with properties
      let thrownError;
      try {
        logger.info("custom-error message");
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).to.be.instanceOf(Error);
      expect(thrownError.message).to.equal("Custom error");
      expect(thrownError.code).to.equal("CUSTOM_ERROR");
      expect(thrownError.details).to.have.property("timestamp");

      // Test normal operation still works
      expect(() => {
        logger.info("normal message");
      }).to.not.throw();
    });

    it("should handle adapter methods that return unexpected values", () => {
      class UnexpectedReturnAdapter extends LoggerPort {
        info() {
          return "unexpected string return";
        }
        error() {
          return { unexpected: "object return" };
        }
        warn() {
          return 42;
        }
        debug() {
          return null;
        }
      }

      const unexpectedAdapter = new UnexpectedReturnAdapter();
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        unexpectedAdapter,
        ["info", "error", "warn", "debug"]
      );

      // Should not throw errors even with unexpected return values
      expect(() => {
        logger.info("test message");
        logger.error("test error");
        logger.warn("test warning");
        logger.debug("test debug");
      }).to.not.throw();
    });
  });
});
