import { describe, it, beforeEach, mock } from "node:test";
import { expect } from "chai";
import { createLoggerFactory } from "../../../../src/infrastructure/logging/logger.factory.js";

describe("Logger Factory", () => {
  let mockAdapter;

  beforeEach(() => {
    // Create a mock adapter using Node.js built-in mocks
    mockAdapter = {
      info: mock.fn(),
      error: mock.fn(),
      warn: mock.fn(),
      debug: mock.fn(),
    };
  });

  afterEach(() => {
    // Reset all mocks to ensure test isolation
    mockAdapter.info.mock.reset();
    mockAdapter.error.mock.reset();
    mockAdapter.warn.mock.reset();
    mockAdapter.debug.mock.reset();
  });

  describe("createLoggerFactory", () => {
    it("should create a logger with all specified methods", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockAdapter,
        ["info", "error", "warn", "debug"]
      );

      expect(logger).to.have.property("info");
      expect(logger).to.have.property("error");
      expect(logger).to.have.property("warn");
      expect(logger).to.have.property("debug");
      expect(typeof logger.info).to.equal("function");
      expect(typeof logger.error).to.equal("function");
    });

    it("should throw error when adapter missing required methods", () => {
      const incompleteAdapter = {
        info: () => {},
        // missing error, warn, debug methods
      };

      expect(() => {
        createLoggerFactory(
          { context: { service: "test-service" } },
          incompleteAdapter,
          ["info", "error", "warn", "debug"]
        );
      }).to.throw(
        /Logger adapter missing required methods: error, warn, debug/
      );
    });

    it("should include adapter name in error message when methods are missing", () => {
      class TestAdapter {
        info() {}
        // missing other methods
      }
      const incompleteAdapter = new TestAdapter();

      expect(() => {
        createLoggerFactory(
          { context: { service: "test-service" } },
          incompleteAdapter,
          ["info", "error"]
        );
      }).to.throw(/Adapter: TestAdapter/);
    });

    it("should merge default context with per-call context", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service", module: "auth" } },
        mockAdapter,
        ["info"]
      );

      logger.info("test message", {
        context: { feature: "login" },
        additionalData: "extra",
      });

      expect(mockAdapter.info.mock.callCount()).to.equal(1);
      const call = mockAdapter.info.mock.calls[0];
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
        mockAdapter,
        ["info"]
      );

      logger.info("test message", {
        context: { module: "user", feature: "registration" },
      });

      const call = mockAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
        module: "user",
        feature: "registration",
      });
    });

    it("should use fallback context when no context provided", () => {
      const logger = createLoggerFactory({ context: {} }, mockAdapter, [
        "info",
      ]);

      logger.info("test message");

      const call = mockAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "unknown-service",
      });
    });

    it("should use fallback context when undefined context provided", () => {
      const logger = createLoggerFactory({ context: undefined }, mockAdapter, [
        "info",
      ]);

      logger.info("test message");

      const call = mockAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "unknown-service",
      });
    });

    it("should use fallback context when null context provided", () => {
      const logger = createLoggerFactory({ context: null }, mockAdapter, [
        "info",
      ]);

      logger.info("test message");

      const call = mockAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "unknown-service",
      });
    });

    it("should handle empty meta object", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockAdapter,
        ["info"]
      );

      logger.info("test message");

      const call = mockAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
      });
      expect(call.arguments[0]).to.equal("test message");
    });

    it("should preserve existing meta properties while adding context", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockAdapter,
        ["info"]
      );

      const originalMeta = {
        userId: "123",
        requestId: "req-456",
        timestamp: new Date(),
      };

      logger.info("test message", originalMeta);

      const call = mockAdapter.info.mock.calls[0];
      expect(call.arguments[1]).to.include(originalMeta);
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
      });
    });

    it("should call adapter method with correct context binding", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockAdapter,
        ["info"]
      );

      logger.info("test message");

      const call = mockAdapter.info.mock.calls[0];
      expect(call.this).to.equal(mockAdapter);
    });

    it("should handle multiple method calls independently", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockAdapter,
        ["info", "error"]
      );

      logger.info("info message", { context: { feature: "login" } });
      logger.error("error message", { context: { feature: "validation" } });

      expect(mockAdapter.info.mock.callCount()).to.equal(1);
      expect(mockAdapter.error.mock.callCount()).to.equal(1);

      const infoCall = mockAdapter.info.mock.calls[0];
      expect(infoCall.arguments[0]).to.equal("info message");
      expect(infoCall.arguments[1].context.feature).to.equal("login");

      const errorCall = mockAdapter.error.mock.calls[0];
      expect(errorCall.arguments[0]).to.equal("error message");
      expect(errorCall.arguments[1].context.feature).to.equal("validation");
    });

    it("should only wrap methods specified in logMethods array", () => {
      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        mockAdapter,
        ["info", "error"] // Only these two methods
      );

      expect(logger).to.have.property("info");
      expect(logger).to.have.property("error");
      expect(logger).to.not.have.property("warn");
      expect(logger).to.not.have.property("debug");
    });

    it("should handle complex nested context merging", () => {
      const logger = createLoggerFactory(
        {
          context: {
            service: "test-service",
            module: "auth",
            metadata: { version: "1.0" },
          },
        },
        mockAdapter,
        ["info"]
      );

      logger.info("test message", {
        context: {
          feature: "login",
          metadata: { requestId: "123" },
        },
        extraData: "value",
      });

      const call = mockAdapter.info.mock.calls[0];
      expect(call.arguments[1].context).to.deep.equal({
        service: "test-service",
        module: "auth",
        feature: "login",
        metadata: { requestId: "123" }, // per-call context should override
      });
      expect(call.arguments[1].extraData).to.equal("value");
    });
  });

  describe("Error handling", () => {
    it("should handle adapter methods that throw errors", () => {
      const errorAdapter = {
        info: () => {
          throw new Error("Adapter error");
        },
      };

      const logger = createLoggerFactory(
        { context: { service: "test-service" } },
        errorAdapter,
        ["info"]
      );

      expect(() => {
        logger.info("test message");
      }).to.throw("Adapter error");
    });

    it("should validate that logMethods is an array", () => {
      expect(() => {
        createLoggerFactory(
          { context: { service: "test-service" } },
          mockAdapter,
          "info" // Should be an array
        );
      }).to.throw();
    });
  });
});
