import { describe, it } from "node:test";
import { expect } from "chai";
import { LoggerPort } from "../../../../src/infrastructure/logging/logger.port.js";

describe("LoggerPort", () => {
  let loggerPort;

  describe("Abstract class behavior", () => {
    it("should throw error when error method is called without implementation", () => {
      loggerPort = new LoggerPort();
      expect(() => loggerPort.error("test message")).to.throw(
        'Method "error" must be implemented by subclass'
      );
    });

    it("should throw error when warn method is called without implementation", () => {
      loggerPort = new LoggerPort();
      expect(() => loggerPort.warn("test message")).to.throw(
        'Method "warn" must be implemented by subclass'
      );
    });

    it("should throw error when info method is called without implementation", () => {
      loggerPort = new LoggerPort();
      expect(() => loggerPort.info("test message")).to.throw(
        'Method "info" must be implemented by subclass'
      );
    });

    it("should throw error when http method is called without implementation", () => {
      loggerPort = new LoggerPort();
      expect(() => loggerPort.http("test message")).to.throw(
        'Method "http" must be implemented by subclass'
      );
    });

    it("should throw error when verbose method is called without implementation", () => {
      loggerPort = new LoggerPort();
      expect(() => loggerPort.verbose("test message")).to.throw(
        'Method "verbose" must be implemented by subclass'
      );
    });

    it("should throw error when debug method is called without implementation", () => {
      loggerPort = new LoggerPort();
      expect(() => loggerPort.debug("test message")).to.throw(
        'Method "debug" must be implemented by subclass'
      );
    });

    it("should be instantiable", () => {
      loggerPort = new LoggerPort();
      expect(loggerPort).to.be.instanceOf(LoggerPort);
    });

    it("should allow inheritance", () => {
      class TestLogger extends LoggerPort {
        error() {
          return "error implemented";
        }
      }
      const testLogger = new TestLogger();
      expect(testLogger).to.be.instanceOf(LoggerPort);
      expect(testLogger.error()).to.equal("error implemented");
    });
  });
});
