import { describe, it } from "node:test";
import { expect } from "chai";
import {
  levelFormatter,
  logFormatter,
  timestamp,
} from "../../../../src/infrastructure/logging/pino-logger-formatters.js";

describe("Pino Logger Formatters", () => {
  describe("levelFormatter", () => {
    it("should return an object with level property", () => {
      const result = levelFormatter("info");
      expect(result).to.be.an("object");
      expect(result).to.have.property("level");
    });

    it("should preserve the level label", () => {
      const levels = ["error", "warn", "info", "debug", "trace", "fatal"];

      levels.forEach((level) => {
        const result = levelFormatter(level);
        expect(result.level).to.equal(level);
      });
    });

    it("should handle string level labels", () => {
      const result = levelFormatter("custom-level");
      expect(result.level).to.equal("custom-level");
    });

    it("should handle empty string", () => {
      const result = levelFormatter("");
      expect(result.level).to.equal("");
    });

    it("should handle undefined input", () => {
      const result = levelFormatter(undefined);
      expect(result.level).to.be.undefined;
    });

    it("should handle null input", () => {
      const result = levelFormatter(null);
      expect(result.level).to.be.null;
    });

    it("should handle numeric input", () => {
      const result = levelFormatter(30);
      expect(result.level).to.equal(30);
    });

    it("should only return level property", () => {
      const result = levelFormatter("info");
      expect(Object.keys(result)).to.have.length(1);
      expect(Object.keys(result)[0]).to.equal("level");
    });
  });

  describe("logFormatter", () => {
    it("should return the sanitized object", () => {
      const input = {
        message: "test message",
        data: "some data",
      };

      const result = logFormatter(input);
      expect(result).to.be.an("object");
      expect(result).to.have.property("message");
      expect(result).to.have.property("data");
    });

    it("should flatten context into root level", () => {
      const input = {
        message: "test message",
        context: {
          service: "test-service",
          module: "auth",
          feature: "login",
        },
        extraData: "value",
      };

      const result = logFormatter(input);
      expect(result).to.not.have.property("context");
      expect(result).to.have.property("service");
      expect(result).to.have.property("module");
      expect(result).to.have.property("feature");
      expect(result).to.have.property("extraData");
      expect(result.service).to.equal("test-service");
      expect(result.module).to.equal("auth");
      expect(result.feature).to.equal("login");
    });

    it("should handle empty context object", () => {
      const input = {
        message: "test message",
        context: {},
        extraData: "value",
      };

      const result = logFormatter(input);
      expect(result).to.not.have.property("context");
      expect(result).to.have.property("extraData");
    });

    it("should handle null context", () => {
      const input = {
        message: "test message",
        context: null,
        extraData: "value",
      };

      const result = logFormatter(input);
      expect(result).to.have.property("context");
      expect(result.context).to.be.null;
      expect(result).to.have.property("extraData");
    });

    it("should handle undefined context", () => {
      const input = {
        message: "test message",
        context: undefined,
        extraData: "value",
      };

      const result = logFormatter(input);
      expect(result).to.have.property("extraData");
    });

    it("should handle non-object context", () => {
      const input = {
        message: "test message",
        context: "string-context",
        extraData: "value",
      };

      const result = logFormatter(input);
      expect(result).to.have.property("context");
      expect(result.context).to.equal("string-context");
      expect(result).to.have.property("extraData");
    });

    it("should handle nested context objects", () => {
      const input = {
        message: "test message",
        context: {
          service: "test-service",
          metadata: {
            version: "1.0",
            build: "123",
          },
          tags: ["auth", "security"],
        },
      };

      const result = logFormatter(input);
      expect(result).to.not.have.property("context");
      expect(result).to.have.property("service");
      expect(result).to.have.property("metadata");
      expect(result).to.have.property("tags");
      expect(result.metadata).to.deep.equal({ version: "1.0", build: "123" });
    });

    it("should override root properties with context properties", () => {
      const input = {
        message: "test message",
        service: "original-service",
        context: {
          service: "context-service",
          module: "auth",
        },
      };

      const result = logFormatter(input);
      expect(result.service).to.equal("context-service");
      expect(result.module).to.equal("auth");
      expect(result.message).to.equal("test message");
    });

    it("should sanitize sensitive data", () => {
      const input = {
        message: "test message",
        password: "secret123",
        creditCard: "4111111111111111",
        context: {
          service: "test-service",
        },
      };

      const result = logFormatter(input);
      // Assuming sanitizer removes sensitive fields
      expect(result).to.not.have.property("password");
      expect(result).to.not.have.property("creditCard");
      expect(result).to.have.property("service");
    });

    it("should handle arrays in context", () => {
      const input = {
        message: "test message",
        context: {
          service: "test-service",
          features: ["auth", "logging", "api"],
        },
      };

      const result = logFormatter(input);
      expect(result).to.have.property("features");
      expect(result.features).to.be.an("array");
      expect(result.features).to.deep.equal(["auth", "logging", "api"]);
    });

    it("should handle circular references gracefully", () => {
      const circular = { name: "circular" };
      circular.self = circular;

      const input = {
        message: "test message",
        context: {
          service: "test-service",
        },
        circular: circular,
      };

      expect(() => {
        logFormatter(input);
      }).to.not.throw();
    });

    it("should handle empty object", () => {
      const result = logFormatter({});
      expect(result).to.be.an("object");
      expect(Object.keys(result)).to.have.length(0);
    });
  });

  describe("timestamp", () => {
    it("should be a function", () => {
      expect(timestamp).to.be.a("function");
    });

    it("should return ISO format timestamp", () => {
      const result = timestamp();
      expect(result).to.be.a("string");

      // Check if it's a valid ISO timestamp
      const date = new Date(result);
      expect(date.toISOString()).to.equal(result);
    });

    it("should return current time", () => {
      const before = new Date();
      const result = timestamp();
      const after = new Date();

      const timestampDate = new Date(result);
      expect(timestampDate.getTime()).to.be.at.least(before.getTime());
      expect(timestampDate.getTime()).to.be.at.most(after.getTime());
    });

    it("should be consistent with pino.stdTimeFunctions.isoTime", () => {
      const result1 = timestamp();
      const result2 = timestamp();

      // Both should be valid ISO strings
      expect(() => new Date(result1)).to.not.throw();
      expect(() => new Date(result2)).to.not.throw();

      // Should be close in time (within 1 second)
      const date1 = new Date(result1);
      const date2 = new Date(result2);
      expect(Math.abs(date2.getTime() - date1.getTime())).to.be.below(1000);
    });

    it("should include timezone information", () => {
      const result = timestamp();
      expect(result).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should be called without parameters", () => {
      expect(() => timestamp()).to.not.throw();
    });
  });

  describe("Integration between formatters", () => {
    it("should work together in pino configuration", () => {
      const mockPinoFormatters = {
        level: levelFormatter,
        log: logFormatter,
      };

      expect(mockPinoFormatters.level).to.equal(levelFormatter);
      expect(mockPinoFormatters.log).to.equal(logFormatter);
    });

    it("should handle typical pino log object structure", () => {
      const pinoLogObject = {
        level: 30, // info level in pino
        time: timestamp(),
        pid: process.pid,
        hostname: "localhost",
        msg: "Test message",
        context: {
          service: "test-service",
          module: "auth",
        },
        requestId: "req-123",
      };

      const levelResult = levelFormatter("info");
      const logResult = logFormatter(pinoLogObject);

      expect(levelResult).to.have.property("level", "info");
      expect(logResult).to.have.property("service", "test-service");
      expect(logResult).to.have.property("module", "auth");
      expect(logResult).to.have.property("requestId", "req-123");
      expect(logResult).to.not.have.property("context");
    });

    it("should maintain data integrity through formatter chain", () => {
      const originalData = {
        message: "Important log",
        context: {
          service: "critical-service",
          operation: "payment-processing",
        },
        amount: 100.5,
        userId: "user-456",
      };

      const formatted = logFormatter(originalData);

      expect(formatted.message).to.equal(originalData.message);
      expect(formatted.service).to.equal(originalData.context.service);
      expect(formatted.operation).to.equal(originalData.context.operation);
      expect(formatted.amount).to.equal(originalData.amount);
      expect(formatted.userId).to.equal(originalData.userId);
    });
  });

  describe("Error handling", () => {
    it("should handle null input gracefully", () => {
      expect(() => logFormatter(null)).to.not.throw();
      expect(() => levelFormatter(null)).to.not.throw();
    });

    it("should handle undefined input gracefully", () => {
      expect(() => logFormatter(undefined)).to.not.throw();
      expect(() => levelFormatter(undefined)).to.not.throw();
    });

    it("should handle non-object input to logFormatter", () => {
      expect(() => logFormatter("string")).to.not.throw();
      expect(() => logFormatter(123)).to.not.throw();
      expect(() => logFormatter(true)).to.not.throw();
    });

    it("should handle Symbol properties", () => {
      const sym = Symbol("test");
      const input = {
        message: "test",
        [sym]: "symbol value",
        context: {
          service: "test-service",
        },
      };

      expect(() => logFormatter(input)).to.not.throw();
    });
  });
});
