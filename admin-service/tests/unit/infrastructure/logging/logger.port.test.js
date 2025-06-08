import { describe, it, beforeEach } from "node:test";

import { expect } from "chai";

import { LoggerPort } from "../../../../src/infrastructure/logging/logger.port.js";
import { NotImplementedError } from "../../../../src/shared/errors/index.js";

/**
 * LoggerPort Tests
 *
 * Architecture: Abstract Port Interface (Contract Testing)
 * Scope: Essential contract compliance and error behavior validation
 *
 * Focus: Tests only what can break functionality, not language features
 */
describe("LoggerPort", () => {
  let loggerPort;

  beforeEach(() => {
    loggerPort = new LoggerPort();
  });

  describe("Abstract Method Contract", () => {
    it("should throw NotImplementedError for all logging methods", () => {
      const methods = [
        "fatal",
        "error",
        "warn",
        "info",
        "http",
        "verbose",
        "debug",
        "trace",
      ];

      methods.forEach((method) => {
        expect(() => {
          loggerPort[method]("test message");
        }).to.throw(
          NotImplementedError,
          `Method "${method}" must be implemented by subclass`
        );
      });
    });

    it("should provide helpful error metadata for developers", () => {
      try {
        loggerPort.info("test message");
      } catch (error) {
        expect(error).to.be.instanceOf(NotImplementedError);
        expect(error.methodName).to.equal("info");
        expect(error.interfaceName).to.equal("LoggerPort");
        expect(error.details.logLevel).to.equal("info");
        expect(error.details.expectedImplementation).to.include(
          "Logger adapter must implement info() method"
        );
      }
    });
  });

  describe("Inheritance Contract", () => {
    it("should allow concrete implementations to override methods", () => {
      class ConcreteLogger extends LoggerPort {
        info(message, meta = {}) {
          return `INFO: ${message}`;
        }
      }

      const concreteLogger = new ConcreteLogger();
      expect(concreteLogger.info("test")).to.equal("INFO: test");

      // Unimplemented methods should still throw
      expect(() => concreteLogger.error("test")).to.throw(NotImplementedError);
    });
  });
});
