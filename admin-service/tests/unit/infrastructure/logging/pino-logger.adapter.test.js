import { describe, it, beforeEach, afterEach, mock } from "node:test";
import { expect } from "chai";
import { PinoLoggerAdapter } from "../../../../src/infrastructure/logging/pino-logger.adapter.js";
import { LoggerPort } from "../../../../src/infrastructure/logging/logger.port.js";

/**
 * PinoLoggerAdapter Tests
 *
 * Architecture: Infrastructure Adapter (Contract Compliance Testing)
 * Scope: Port contract compliance and Pino-specific behavior
 *
 * Focus: Contract behavior, not language features
 */
describe("PinoLoggerAdapter", () => {
  let adapter;
  let mockLogger;

  beforeEach(() => {
    // Create a mock Pino logger using Node.js built-in mocks
    mockLogger = {
      error: mock.fn(),
      warn: mock.fn(),
      info: mock.fn(),
      debug: mock.fn(),
      trace: mock.fn(),
      fatal: mock.fn(),
    };
  });

  afterEach(() => {
    // Reset all mocks to ensure test isolation
    if (mockLogger) {
      mockLogger.error.mock.reset();
      mockLogger.warn.mock.reset();
      mockLogger.info.mock.reset();
      mockLogger.debug.mock.reset();
      mockLogger.trace.mock.reset();
      mockLogger.fatal.mock.reset();
    }
    adapter = null;
  });

  beforeEach(() => {
    adapter = new PinoLoggerAdapter();
  });

  describe("Contract Compliance", () => {
    it("should implement LoggerPort interface", () => {
      expect(adapter).to.be.instanceOf(LoggerPort);
    });

    it("should implement all required logging methods", () => {
      const methods = ["error", "warn", "info", "debug", "http", "verbose", "trace", "fatal"];

      methods.forEach(method => {
        expect(() => {
          adapter[method]("test message", { test: "data" });
        }).to.not.throw();
      });
    });
  });

  describe("Pino-Specific Behavior", () => {
    it("should handle Pino native log levels", () => {
      const pinoMethods = ["fatal", "error", "warn", "info", "debug", "trace"];

      pinoMethods.forEach(method => {
        expect(() => {
          adapter[method]("Pino native method test");
        }).to.not.throw();
      });
    });

    it("should map Winston methods to Pino equivalents", () => {
      // http maps to info, verbose maps to debug
      expect(() => {
        adapter.http("http message");
        adapter.verbose("verbose message");
      }).to.not.throw();
    });

    it("should handle structured logging", () => {
      expect(() => {
        adapter.info("structured log", {
          requestId: "req-123",
          userId: "user-456",
          performance: { duration: 150 }
        });
      }).to.not.throw();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid metadata gracefully", () => {
      expect(() => {
        adapter.info("test", null);
        adapter.error("test", undefined);
        adapter.warn("test", "invalid-metadata");
      }).to.not.throw();
    });
  });

  describe("Constructor", () => {
    it("should create instance with provided logger", () => {
      adapter = new PinoLoggerAdapter(mockLogger);
      expect(adapter).to.be.instanceOf(PinoLoggerAdapter);
      expect(adapter).to.be.instanceOf(LoggerPort);
      expect(adapter.logger).to.equal(mockLogger);
    });

    it("should create instance with default logger when none provided", () => {
      adapter = new PinoLoggerAdapter();
      expect(adapter).to.be.instanceOf(PinoLoggerAdapter);
      expect(adapter.logger).to.exist;
      expect(adapter.logger).to.have.property("error");
      expect(adapter.logger).to.have.property("info");
    });

    it("should inherit from LoggerPort", () => {
      adapter = new PinoLoggerAdapter(mockLogger);
      expect(adapter).to.be.instanceOf(LoggerPort);
    });

    it("should have all required LoggerPort methods", () => {
      adapter = new PinoLoggerAdapter(mockLogger);
      expect(adapter).to.have.property("error");
      expect(adapter).to.have.property("warn");
      expect(adapter).to.have.property("info");
      expect(adapter).to.have.property("http");
      expect(adapter).to.have.property("verbose");
      expect(adapter).to.have.property("debug");

      expect(typeof adapter.error).to.equal("function");
      expect(typeof adapter.warn).to.equal("function");
      expect(typeof adapter.info).to.equal("function");
      expect(typeof adapter.http).to.equal("function");
      expect(typeof adapter.verbose).to.equal("function");
      expect(typeof adapter.debug).to.equal("function");
    });
  });

  describe("Logging methods", () => {
    beforeEach(() => {
      adapter = new PinoLoggerAdapter(mockLogger);
    });

    describe("error method", () => {
      it("should call pino logger error method", () => {
        adapter.error("Error message");

        expect(mockLogger.error.mock.callCount()).to.equal(1);
        const call = mockLogger.error.mock.calls[0];
        expect(call.arguments[1]).to.equal("Error message");
      });

      it("should pass metadata to pino error method", () => {
        const meta = { userId: "123", context: { module: "auth" } };
        adapter.error("Error message", meta);

        const call = mockLogger.error.mock.calls[0];
        expect(call.arguments[0]).to.deep.equal(meta);
      });

      it("should handle empty metadata", () => {
        adapter.error("Error message", {});

        const call = mockLogger.error.mock.calls[0];
        expect(call.arguments[0]).to.deep.equal({});
      });

      it("should use default empty metadata when none provided", () => {
        adapter.error("Error message");

        const call = mockLogger.error.mock.calls[0];
        expect(call.arguments[0]).to.deep.equal({});
      });
    });

    describe("warn method", () => {
      it("should call pino logger warn method", () => {
        adapter.warn("Warning message");

        expect(mockLogger.warn.mock.callCount()).to.equal(1);
        const call = mockLogger.warn.mock.calls[0];
        expect(call.arguments[1]).to.equal("Warning message");
      });

      it("should pass metadata to pino warn method", () => {
        const meta = { requestId: "req-456" };
        adapter.warn("Warning message", meta);

        const call = mockLogger.warn.mock.calls[0];
        expect(call.arguments[0]).to.deep.equal(meta);
      });
    });

    describe("info method", () => {
      it("should call pino logger info method", () => {
        adapter.info("Info message");

        expect(mockLogger.info.mock.callCount()).to.equal(1);
        const call = mockLogger.info.mock.calls[0];
        expect(call.arguments[1]).to.equal("Info message");
      });

      it("should pass complex metadata", () => {
        const meta = {
          context: { service: "test", module: "auth" },
          data: { items: [1, 2, 3] },
        };
        adapter.info("Info message", meta);

        const call = mockLogger.info.mock.calls[0];
        expect(call.arguments[0]).to.deep.equal(meta);
      });
    });

    describe("http method", () => {
      it("should map http to info level in pino", () => {
        adapter.http("HTTP request");

        expect(mockLogger.info.mock.callCount()).to.equal(1);
        const call = mockLogger.info.mock.calls[0];
        expect(call.arguments[1]).to.equal("HTTP request");
      });

      it("should handle HTTP-specific metadata", () => {
        const meta = {
          method: "GET",
          url: "/api/users",
          statusCode: 200,
          responseTime: 150,
        };
        adapter.http("HTTP request", meta);

        const call = mockLogger.info.mock.calls[0];
        expect(call.arguments[0]).to.deep.equal(meta);
      });

      it("should use info method for http logging", () => {
        // Verify that http method calls the underlying info method
        adapter.http("HTTP message");

        expect(mockLogger.info.mock.callCount()).to.equal(1);
        const call = mockLogger.info.mock.calls[0];
        expect(call.arguments[1]).to.equal("HTTP message");
      });
    });

    describe("verbose method", () => {
      it("should map verbose to debug level in pino", () => {
        adapter.verbose("Verbose message");

        expect(mockLogger.debug.mock.callCount()).to.equal(1);
        const call = mockLogger.debug.mock.calls[0];
        expect(call.arguments[1]).to.equal("Verbose message");
      });

      it("should use debug method for verbose logging", () => {
        // Verify that verbose method calls the underlying debug method
        adapter.verbose("Verbose message");

        expect(mockLogger.debug.mock.callCount()).to.equal(1);
        const call = mockLogger.debug.mock.calls[0];
        expect(call.arguments[1]).to.equal("Verbose message");
      });
    });

    describe("debug method", () => {
      it("should call pino logger debug method", () => {
        adapter.debug("Debug message");

        expect(mockLogger.debug.mock.callCount()).to.equal(1);
        const call = mockLogger.debug.mock.calls[0];
        expect(call.arguments[1]).to.equal("Debug message");
      });

      it("should handle debug metadata", () => {
        const meta = {
          variables: { x: 10, y: 20 },
          stack: "debug stack trace",
        };
        adapter.debug("Debug message", meta);

        const call = mockLogger.debug.mock.calls[0];
        expect(call.arguments[0]).to.deep.equal(meta);
      });
    });
  });

  describe("Pino-specific method parameter handling", () => {
    beforeEach(() => {
      adapter = new PinoLoggerAdapter(mockLogger);
    });

    it("should pass meta as first parameter to pino methods", () => {
      const meta = { key: "value" };

      adapter.error("Error message", meta);

      expect(mockLogger.error.mock.callCount()).to.equal(1);
      const call = mockLogger.error.mock.calls[0];
      expect(call.arguments[0]).to.deep.equal(meta);
      expect(call.arguments[1]).to.equal("Error message");
    });

    it("should handle null message", () => {
      expect(() => adapter.info(null)).to.not.throw();
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[1]).to.be.null;
    });

    it("should handle undefined message", () => {
      expect(() => adapter.info(undefined)).to.not.throw();
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[1]).to.be.undefined;
    });

    it("should handle empty string message", () => {
      adapter.info("");
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[1]).to.equal("");
    });

    it("should handle numeric message", () => {
      adapter.info(123);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[1]).to.equal(123);
    });

    it("should handle boolean message", () => {
      adapter.info(true);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[1]).to.equal(true);
    });

    it("should handle object message", () => {
      const objMessage = { error: "Something went wrong" };
      adapter.info(objMessage);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[1]).to.deep.equal(objMessage);
    });

    it("should handle null metadata", () => {
      adapter.info("message", null);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[0]).to.be.null;
    });

    it("should handle undefined metadata", () => {
      adapter.info("message", undefined);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[0]).to.be.undefined;
    });

    it("should handle array metadata", () => {
      const arrayMeta = ["item1", "item2"];
      adapter.info("message", arrayMeta);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[0]).to.deep.equal(arrayMeta);
    });
  });

  describe("Method mapping verification", () => {
    beforeEach(() => {
      adapter = new PinoLoggerAdapter(mockLogger);
    });

    it("should correctly map Winston-style methods to Pino methods", () => {
      adapter.error("Error");
      adapter.warn("Warning");
      adapter.info("Info");
      adapter.http("HTTP");
      adapter.verbose("Verbose");
      adapter.debug("Debug");

      // Verify correct mapping - error -> error
      expect(mockLogger.error.mock.callCount()).to.equal(1);
      // warn -> warn
      expect(mockLogger.warn.mock.callCount()).to.equal(1);
      // info -> info, http -> info (2 calls)
      expect(mockLogger.info.mock.callCount()).to.equal(2);
      // verbose -> debug, debug -> debug (2 calls)
      expect(mockLogger.debug.mock.callCount()).to.equal(2);
    });

    it("should maintain message content through mapping", () => {
      adapter.http("HTTP request");
      adapter.verbose("Verbose log");

      const httpCall = mockLogger.info.mock.calls[0];
      expect(httpCall.arguments[1]).to.equal("HTTP request");

      const verboseCall = mockLogger.debug.mock.calls[0];
      expect(verboseCall.arguments[1]).to.equal("Verbose log");
    });

    it("should maintain metadata through mapping", () => {
      const httpMeta = { method: "GET", url: "/test" };
      const verboseMeta = { debug: true, trace: "stack" };

      adapter.http("HTTP request", httpMeta);
      adapter.verbose("Verbose log", verboseMeta);

      const httpCall = mockLogger.info.mock.calls[0];
      expect(httpCall.arguments[0]).to.deep.equal(httpMeta);

      const verboseCall = mockLogger.debug.mock.calls[0];
      expect(verboseCall.arguments[0]).to.deep.equal(verboseMeta);
    });
  });

  describe("Multiple method calls", () => {
    beforeEach(() => {
      adapter = new PinoLoggerAdapter(mockLogger);
    });

    it("should handle multiple sequential calls", () => {
      adapter.error("Error 1");
      adapter.warn("Warning 1");
      adapter.info("Info 1");

      expect(mockLogger.error.mock.callCount()).to.equal(1);
      expect(mockLogger.warn.mock.callCount()).to.equal(1);
      expect(mockLogger.info.mock.callCount()).to.equal(1);

      expect(mockLogger.error.mock.calls[0].arguments[1]).to.equal("Error 1");
      expect(mockLogger.warn.mock.calls[0].arguments[1]).to.equal("Warning 1");
      expect(mockLogger.info.mock.calls[0].arguments[1]).to.equal("Info 1");
    });

    it("should maintain method independence", () => {
      const errorMeta = { error: true };
      const infoMeta = { info: true };

      adapter.error("Error message", errorMeta);
      adapter.info("Info message", infoMeta);

      const errorCall = mockLogger.error.mock.calls[0];
      expect(errorCall.arguments[0]).to.deep.equal(errorMeta);

      const infoCall = mockLogger.info.mock.calls[0];
      expect(infoCall.arguments[0]).to.deep.equal(infoMeta);
    });

    it("should handle rapid successive calls", () => {
      for (let i = 0; i < 10; i++) {
        adapter.info(`