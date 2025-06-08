import { describe, it } from "node:test";

import { expect } from "chai";

import {
  WINSTON_LOG_METHODS,
  PINO_LOG_METHODS,
} from "../../../../src/infrastructure/logging/logger-methods.js";

describe("Logger Methods", () => {
  describe("WINSTON_LOG_METHODS", () => {
    it("should export winston methods as an array", () => {
      expect(WINSTON_LOG_METHODS).to.be.an("array");
    });

    it("should contain only string values", () => {
      WINSTON_LOG_METHODS.forEach((method) => {
        expect(method).to.be.a("string");
        expect(method.trim()).to.have.length.above(0); // Non-empty
      });
    });

    it("should have unique method names", () => {
      const uniqueMethods = [...new Set(WINSTON_LOG_METHODS)];
      expect(uniqueMethods).to.have.length(WINSTON_LOG_METHODS.length);
    });

    it("should be immutable", () => {
      expect(() => {
        WINSTON_LOG_METHODS.push("newMethod");
      }).to.throw();
    });
  });

  describe("PINO_LOG_METHODS", () => {
    it("should export pino methods as an array", () => {
      expect(PINO_LOG_METHODS).to.be.an("array");
    });

    it("should contain only string values", () => {
      PINO_LOG_METHODS.forEach((method) => {
        expect(method).to.be.a("string");
        expect(method.trim()).to.have.length.above(0); // Non-empty
      });
    });

    it("should have unique method names", () => {
      const uniqueMethods = [...new Set(PINO_LOG_METHODS)];
      expect(uniqueMethods).to.have.length(PINO_LOG_METHODS.length);
    });

    it("should be immutable", () => {
      expect(() => {
        PINO_LOG_METHODS.push("newMethod");
      }).to.throw();
    });
  });

  describe("Cross-adapter compatibility", () => {
    it("should share core logging methods", () => {
      const coreMethods = ["info", "warn", "error", "debug"];
      coreMethods.forEach((method) => {
        expect(WINSTON_LOG_METHODS).to.include(method);
        expect(PINO_LOG_METHODS).to.include(method);
      });
    });

    it("should support adapter-specific methods", () => {
      // Winston has http and verbose
      expect(WINSTON_LOG_METHODS).to.include("http");
      expect(WINSTON_LOG_METHODS).to.include("verbose");

      // Pino has trace and fatal
      expect(PINO_LOG_METHODS).to.include("trace");
      expect(PINO_LOG_METHODS).to.include("fatal");
    });
  });

  describe("Security Considerations", () => {
    it("should include error method for security incident logging", () => {
      expect(WINSTON_LOG_METHODS).to.include("error");
      expect(PINO_LOG_METHODS).to.include("error");
    });

    it("should include warn method for security alerts", () => {
      expect(WINSTON_LOG_METHODS).to.include("warn");
      expect(PINO_LOG_METHODS).to.include("warn");
    });

    it("should not include silly level for security compliance", () => {
      expect(WINSTON_LOG_METHODS).to.not.include("silly");
      expect(PINO_LOG_METHODS).to.not.include("silly");
    });
  });
});
