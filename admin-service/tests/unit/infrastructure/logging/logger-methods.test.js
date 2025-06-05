import { describe, it } from "node:test";
import { expect } from "chai";
import {
  WINSTON_LOG_METHODS,
  PINO_LOG_METHODS,
} from "../../../../src/infrastructure/logging/logger-methods.js";

describe("Logger Methods", () => {
  describe("WINSTON_LOG_METHODS", () => {
    it("should export winston log methods as an array", () => {
      expect(WINSTON_LOG_METHODS).to.be.an("array");
    });

    it("should contain the correct winston log methods", () => {
      const expectedMethods = [
        "info",
        "warn",
        "error",
        "debug",
        "verbose",
        "http",
      ];
      expect(WINSTON_LOG_METHODS).to.have.members(expectedMethods);
    });

    it("should have 6 methods", () => {
      expect(WINSTON_LOG_METHODS).to.have.length(6);
    });

    it("should contain only string values", () => {
      WINSTON_LOG_METHODS.forEach((method) => {
        expect(method).to.be.a("string");
      });
    });

    it("should not contain any duplicate methods", () => {
      const uniqueMethods = [...new Set(WINSTON_LOG_METHODS)];
      expect(uniqueMethods).to.have.length(WINSTON_LOG_METHODS.length);
    });

    it("should not contain empty strings", () => {
      WINSTON_LOG_METHODS.forEach((method) => {
        expect(method).to.not.equal("");
        expect(method.trim()).to.equal(method);
      });
    });
  });

  describe("PINO_LOG_METHODS", () => {
    it("should export pino log methods as an array", () => {
      expect(PINO_LOG_METHODS).to.be.an("array");
    });

    it("should contain the correct pino log methods", () => {
      const expectedMethods = [
        "info",
        "warn",
        "error",
        "debug",
        "trace",
        "fatal",
      ];
      expect(PINO_LOG_METHODS).to.have.members(expectedMethods);
    });

    it("should have 6 methods", () => {
      expect(PINO_LOG_METHODS).to.have.length(6);
    });

    it("should contain only string values", () => {
      PINO_LOG_METHODS.forEach((method) => {
        expect(method).to.be.a("string");
      });
    });

    it("should not contain any duplicate methods", () => {
      const uniqueMethods = [...new Set(PINO_LOG_METHODS)];
      expect(uniqueMethods).to.have.length(PINO_LOG_METHODS.length);
    });

    it("should not contain empty strings", () => {
      PINO_LOG_METHODS.forEach((method) => {
        expect(method).to.not.equal("");
        expect(method.trim()).to.equal(method);
      });
    });
  });

  describe("Method comparison", () => {
    it("should have some common methods between winston and pino", () => {
      const commonMethods = WINSTON_LOG_METHODS.filter((method) =>
        PINO_LOG_METHODS.includes(method)
      );
      expect(commonMethods).to.include.members([
        "info",
        "warn",
        "error",
        "debug",
      ]);
    });

    it("should have winston-specific methods", () => {
      const winstonSpecific = WINSTON_LOG_METHODS.filter(
        (method) => !PINO_LOG_METHODS.includes(method)
      );
      expect(winstonSpecific).to.include.members(["verbose", "http"]);
    });

    it("should have pino-specific methods", () => {
      const pinoSpecific = PINO_LOG_METHODS.filter(
        (method) => !WINSTON_LOG_METHODS.includes(method)
      );
      expect(pinoSpecific).to.include.members(["trace", "fatal"]);
    });

    it("should not be identical arrays", () => {
      expect(WINSTON_LOG_METHODS).to.not.deep.equal(PINO_LOG_METHODS);
    });
  });

  describe("Immutability", () => {
    it("winston methods array should not be modifiable", () => {
      const originalLength = WINSTON_LOG_METHODS.length;
      expect(() => WINSTON_LOG_METHODS.push("newMethod")).to.throw();
      expect(WINSTON_LOG_METHODS).to.have.length(originalLength);
    });

    it("pino methods array should not be modifiable", () => {
      const originalLength = PINO_LOG_METHODS.length;
      expect(() => PINO_LOG_METHODS.push("newMethod")).to.throw();
      expect(PINO_LOG_METHODS).to.have.length(originalLength);
    });
  });
});
