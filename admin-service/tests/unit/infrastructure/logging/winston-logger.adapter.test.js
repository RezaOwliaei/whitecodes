import { describe, it, beforeEach, afterEach, mock } from "node:test";

import { expect } from "chai";
import winston from "winston";

import { LoggerPort } from "../../../../src/infrastructure/logging/logger.port.js";
import { WinstonLoggerAdapter } from "../../../../src/infrastructure/logging/winston-logger.adapter.js";

/**
 * WinstonLoggerAdapter Tests
 *
 * Architecture: Infrastructure Adapter (Contract Compliance Testing)
 * Scope: Port contract compliance and Winston-specific behavior
 *
 * Focus: Contract behavior, not language features
 */
describe("WinstonLoggerAdapter", () => {
  let adapter;
  let mockLogger;

  beforeEach(() => {
    // Create a mock Winston logger using Node.js built-in mocks
    mockLogger = {
      error: mock.fn(),
      warn: mock.fn(),
      info: mock.fn(),
      http: mock.fn(),
      verbose: mock.fn(),
      debug: mock.fn(),
    };
    adapter = new WinstonLoggerAdapter(mockLogger);
  });

  afterEach(() => {
    // Reset all mocks to ensure test isolation
    if (mockLogger) {
      mockLogger.error.mock.reset();
      mockLogger.warn.mock.reset();
      mockLogger.info.mock.reset();
      mockLogger.http.mock.reset();
      mockLogger.verbose.mock.reset();
      mockLogger.debug.mock.reset();
    }
    adapter = null;
  });

  describe("Contract Compliance", () => {
    it("should implement LoggerPort interface", () => {
      expect(adapter).to.be.instanceOf(LoggerPort);
    });

    it("should implement all required logging methods", () => {
      const methods = [
        "error",
        "warn",
        "info",
        "debug",
        "http",
        "verbose",
        "trace",
        "fatal",
      ];

      methods.forEach((method) => {
        expect(() => {
          adapter[method]("test message", { test: "data" });
        }).to.not.throw();
      });
    });
  });

  describe("Winston-Specific Behavior", () => {
    it("should handle Winston native log levels", () => {
      const winstonMethods = [
        "error",
        "warn",
        "info",
        "http",
        "verbose",
        "debug",
      ];

      winstonMethods.forEach((method) => {
        expect(() => {
          adapter[method]("Winston native method test");
        }).to.not.throw();
      });
    });

    it("should map Pino methods to Winston equivalents", () => {
      // trace maps to debug, fatal maps to error
      expect(() => {
        adapter.trace("trace message");
        adapter.fatal("fatal message");
      }).to.not.throw();
    });

    it("should handle metadata objects", () => {
      expect(() => {
        adapter.info("test message", {
          userId: "123",
          action: "login",
          metadata: { ip: "192.168.1.1" },
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
      expect(adapter.logger).to.equal(mockLogger);
    });

    it("should create instance with default logger when none provided", () => {
      adapter = new WinstonLoggerAdapter();
      expect(adapter.logger).to.exist;
      expect(adapter.logger).to.have.property("error");
      expect(adapter.logger).to.have.property("info");
    });

    it("should inherit from LoggerPort", () => {
      expect(adapter).to.be.instanceOf(LoggerPort);
    });

    it("should have all required LoggerPort methods", () => {
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
    describe("error method", () => {
      it("should call winston logger error method", () => {
        adapter.error("Error message");

        expect(mockLogger.error.mock.callCount()).to.equal(1);
        const call = mockLogger.error.mock.calls[0];
        expect(call.arguments[0]).to.equal("Error message");
      });

      it("should pass metadata to winston error method", () => {
        const meta = { userId: "123", context: { module: "auth" } };
        adapter.error("Error message", meta);

        const call = mockLogger.error.mock.calls[0];
        expect(call.arguments[1]).to.deep.equal(meta);
      });

      it("should handle empty metadata", () => {
        adapter.error("Error message", {});

        const call = mockLogger.error.mock.calls[0];
        expect(call.arguments[1]).to.deep.equal({});
      });

      it("should use default empty metadata when none provided", () => {
        adapter.error("Error message");

        const call = mockLogger.error.mock.calls[0];
        expect(call.arguments[1]).to.deep.equal({});
      });
    });

    describe("warn method", () => {
      it("should call winston logger warn method", () => {
        adapter.warn("Warning message");

        expect(mockLogger.warn.mock.callCount()).to.equal(1);
        const call = mockLogger.warn.mock.calls[0];
        expect(call.arguments[0]).to.equal("Warning message");
      });

      it("should pass metadata to winston warn method", () => {
        const meta = { requestId: "req-456" };
        adapter.warn("Warning message", meta);

        const call = mockLogger.warn.mock.calls[0];
        expect(call.arguments[1]).to.deep.equal(meta);
      });
    });

    describe("info method", () => {
      it("should call winston logger info method", () => {
        adapter.info("Info message");

        expect(mockLogger.info.mock.callCount()).to.equal(1);
        const call = mockLogger.info.mock.calls[0];
        expect(call.arguments[0]).to.equal("Info message");
      });

      it("should pass complex metadata", () => {
        const meta = {
          context: { service: "test", module: "auth" },
          data: { items: [1, 2, 3] },
        };
        adapter.info("Info message", meta);

        const call = mockLogger.info.mock.calls[0];
        expect(call.arguments[1]).to.deep.equal(meta);
      });
    });

    describe("http method", () => {
      it("should call winston logger http method", () => {
        adapter.http("HTTP request");

        expect(mockLogger.http.mock.callCount()).to.equal(1);
        const call = mockLogger.http.mock.calls[0];
        expect(call.arguments[0]).to.equal("HTTP request");
      });

      it("should handle HTTP-specific metadata", () => {
        const meta = {
          method: "GET",
          url: "/api/users",
          statusCode: 200,
          responseTime: 150,
        };
        adapter.http("HTTP request", meta);

        const call = mockLogger.http.mock.calls[0];
        expect(call.arguments[1]).to.deep.equal(meta);
      });
    });

    describe("verbose method", () => {
      it("should call winston logger verbose method", () => {
        adapter.verbose("Verbose message");

        expect(mockLogger.verbose.mock.callCount()).to.equal(1);
        const call = mockLogger.verbose.mock.calls[0];
        expect(call.arguments[0]).to.equal("Verbose message");
      });
    });

    describe("debug method", () => {
      it("should call winston logger debug method", () => {
        adapter.debug("Debug message");

        expect(mockLogger.debug.mock.callCount()).to.equal(1);
        const call = mockLogger.debug.mock.calls[0];
        expect(call.arguments[0]).to.equal("Debug message");
      });

      it("should handle debug metadata", () => {
        const meta = {
          variables: { x: 10, y: 20 },
          stack: "debug stack trace",
        };
        adapter.debug("Debug message", meta);

        const call = mockLogger.debug.mock.calls[0];
        expect(call.arguments[1]).to.deep.equal(meta);
      });
    });
  });

  describe("Method parameter handling", () => {
    it("should handle null message", () => {
      expect(() => adapter.info(null)).to.not.throw();
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[0]).to.be.null;
    });

    it("should handle undefined message", () => {
      expect(() => adapter.info(undefined)).to.not.throw();
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[0]).to.be.undefined;
    });

    it("should handle empty string message", () => {
      adapter.info("");
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[0]).to.equal("");
    });

    it("should handle numeric message", () => {
      adapter.info(123);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[0]).to.equal(123);
    });

    it("should handle boolean message", () => {
      adapter.info(true);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[0]).to.equal(true);
    });

    it("should handle object message", () => {
      const objMessage = { error: "Something went wrong" };
      adapter.info(objMessage);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[0]).to.deep.equal(objMessage);
    });

    it("should handle null metadata", () => {
      adapter.info("message", null);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[1]).to.be.null;
    });

    it("should handle undefined metadata", () => {
      adapter.info("message", undefined);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[1]).to.be.undefined;
    });

    it("should handle array metadata", () => {
      const arrayMeta = ["item1", "item2"];
      adapter.info("message", arrayMeta);
      const call = mockLogger.info.mock.calls[0];
      expect(call.arguments[1]).to.deep.equal(arrayMeta);
    });
  });

  describe("Multiple method calls", () => {
    it("should handle multiple sequential calls", () => {
      adapter.error("Error 1");
      adapter.warn("Warning 1");
      adapter.info("Info 1");

      expect(mockLogger.error.mock.callCount()).to.equal(1);
      expect(mockLogger.warn.mock.callCount()).to.equal(1);
      expect(mockLogger.info.mock.callCount()).to.equal(1);

      expect(mockLogger.error.mock.calls[0].arguments[0]).to.equal("Error 1");
      expect(mockLogger.warn.mock.calls[0].arguments[0]).to.equal("Warning 1");
      expect(mockLogger.info.mock.calls[0].arguments[0]).to.equal("Info 1");
    });

    it("should maintain method independence", () => {
      const errorMeta = { error: true };
      const infoMeta = { info: true };

      adapter.error("Error message", errorMeta);
      adapter.info("Info message", infoMeta);

      const errorCall = mockLogger.error.mock.calls[0];
      expect(errorCall.arguments[1]).to.deep.equal(errorMeta);

      const infoCall = mockLogger.info.mock.calls[0];
      expect(infoCall.arguments[1]).to.deep.equal(infoMeta);
    });

    it("should handle rapid successive calls", () => {
      for (let i = 0; i < 10; i++) {
        adapter.info(`Message ${i}`, { iteration: i });
      }

      expect(mockLogger.info.mock.callCount()).to.equal(10);
      mockLogger.info.mock.calls.forEach((call, index) => {
        expect(call.arguments[0]).to.equal(`Message ${index}`);
        expect(call.arguments[1].iteration).to.equal(index);
      });
    });
  });

  describe("Integration with real Winston logger", () => {
    it("should work with actual winston logger instance", () => {
      const realLogger = winston.createLogger({
        level: "debug",
        format: winston.format.json(),
        transports: [new winston.transports.Console({ silent: true })],
      });

      adapter = new WinstonLoggerAdapter(realLogger);

      expect(() => {
        adapter.error("Real error");
        adapter.warn("Real warning");
        adapter.info("Real info");
        adapter.http("Real http");
        adapter.verbose("Real verbose");
        adapter.debug("Real debug");
      }).to.not.throw();
    });

    it("should handle winston transport errors gracefully", () => {
      const errorTransport = new winston.transports.Console({ silent: true });
      errorTransport.log = () => {
        throw new Error("Transport error");
      };

      const realLogger = winston.createLogger({
        level: "debug",
        transports: [errorTransport],
        exitOnError: false,
      });

      adapter = new WinstonLoggerAdapter(realLogger);

      // Should not throw even if transport fails
      expect(() => {
        adapter.info("Test message");
      }).to.not.throw();
    });
  });

  describe("Error scenarios", () => {
    it("should handle winston logger that throws errors", () => {
      const errorLogger = {
        error: () => {
          throw new Error("Logger error");
        },
        warn: () => {
          throw new Error("Logger error");
        },
        info: () => {
          throw new Error("Logger error");
        },
        http: () => {
          throw new Error("Logger error");
        },
        verbose: () => {
          throw new Error("Logger error");
        },
        debug: () => {
          throw new Error("Logger error");
        },
      };

      adapter = new WinstonLoggerAdapter(errorLogger);

      expect(() => adapter.error("message")).to.throw("Logger error");
      expect(() => adapter.warn("message")).to.throw("Logger error");
      expect(() => adapter.info("message")).to.throw("Logger error");
      expect(() => adapter.http("message")).to.throw("Logger error");
      expect(() => adapter.verbose("message")).to.throw("Logger error");
      expect(() => adapter.debug("message")).to.throw("Logger error");
    });

    it("should handle circular reference in metadata", () => {
      const circular = { name: "circular" };
      circular.self = circular;

      expect(() => {
        adapter.info("message", circular);
      }).to.not.throw();
    });

    it("should handle very large metadata objects", () => {
      const largeMeta = {};
      for (let i = 0; i < 1000; i++) {
        largeMeta[`key${i}`] = `value${i}`;
      }

      expect(() => {
        adapter.info("message", largeMeta);
      }).to.not.throw();
    });
  });

  describe("JSDoc compliance", () => {
    it("should accept string message and object meta as documented", () => {
      adapter.error("string message", { key: "value" });
      adapter.warn("string message", { key: "value" });
      adapter.info("string message", { key: "value" });
      adapter.http("string message", { key: "value" });
      adapter.verbose("string message", { key: "value" });
      adapter.debug("string message", { key: "value" });

      // Verify all methods were called with correct parameters
      expect(mockLogger.error.mock.calls[0].arguments[0]).to.equal(
        "string message"
      );
      expect(mockLogger.error.mock.calls[0].arguments[1]).to.deep.equal({
        key: "value",
      });

      expect(mockLogger.warn.mock.calls[0].arguments[0]).to.equal(
        "string message"
      );
      expect(mockLogger.warn.mock.calls[0].arguments[1]).to.deep.equal({
        key: "value",
      });

      expect(mockLogger.info.mock.calls[0].arguments[0]).to.equal(
        "string message"
      );
      expect(mockLogger.info.mock.calls[0].arguments[1]).to.deep.equal({
        key: "value",
      });

      expect(mockLogger.http.mock.calls[0].arguments[0]).to.equal(
        "string message"
      );
      expect(mockLogger.http.mock.calls[0].arguments[1]).to.deep.equal({
        key: "value",
      });

      expect(mockLogger.verbose.mock.calls[0].arguments[0]).to.equal(
        "string message"
      );
      expect(mockLogger.verbose.mock.calls[0].arguments[1]).to.deep.equal({
        key: "value",
      });

      expect(mockLogger.debug.mock.calls[0].arguments[0]).to.equal(
        "string message"
      );
      expect(mockLogger.debug.mock.calls[0].arguments[1]).to.deep.equal({
        key: "value",
      });
    });

    it("should work with optional meta parameter", () => {
      adapter.error("message");
      adapter.warn("message");
      adapter.info("message");
      adapter.http("message");
      adapter.verbose("message");
      adapter.debug("message");

      // Verify all methods were called with correct message
      expect(mockLogger.error.mock.calls[0].arguments[0]).to.equal("message");
      expect(mockLogger.warn.mock.calls[0].arguments[0]).to.equal("message");
      expect(mockLogger.info.mock.calls[0].arguments[0]).to.equal("message");
      expect(mockLogger.http.mock.calls[0].arguments[0]).to.equal("message");
      expect(mockLogger.verbose.mock.calls[0].arguments[0]).to.equal("message");
      expect(mockLogger.debug.mock.calls[0].arguments[0]).to.equal("message");
    });
  });
});
