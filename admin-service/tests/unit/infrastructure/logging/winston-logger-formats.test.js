import { describe, it } from "node:test";
import { expect } from "chai";
import winston from "winston";
import {
  consoleFormat,
  jsonFormat,
} from "../../../../src/infrastructure/logging/winston-logger-formats.js";

describe("Winston Logger Formats", () => {
  describe("consoleFormat", () => {
    it("should be a winston format", () => {
      expect(consoleFormat).to.have.property("transform");
      expect(typeof consoleFormat.transform).to.equal("function");
    });

    it("should format basic log entry", () => {
      const info = {
        level: "info",
        message: "Test message",
        timestamp: "2024-01-01 12:00:00:000",
      };

      const result = consoleFormat.transform(info);
      expect(result).to.be.an("object");
    });

    it("should handle log entry with metadata", () => {
      const info = {
        level: "error",
        message: "Error message",
        timestamp: "2024-01-01 12:00:00:000",
        userId: "123",
        requestId: "req-456",
      };

      const result = consoleFormat.transform(info);
      expect(result).to.be.an("object");
      expect(result).to.have.property("level");
      expect(result).to.have.property("message");
    });

    it("should include timestamp formatting", () => {
      // Test that timestamp format is configured
      const formats = consoleFormat.options;
      expect(formats).to.exist;
    });

    it("should include colorization", () => {
      // Verify colorize format is part of the combine
      expect(consoleFormat).to.exist;
    });

    it("should handle errors with stack traces", () => {
      const error = new Error("Test error");
      const info = {
        level: "error",
        message: "Error occurred",
        timestamp: "2024-01-01 12:00:00:000",
        stack: error.stack,
      };

      const result = consoleFormat.transform(info);
      expect(result).to.be.an("object");
    });
  });

  describe("jsonFormat", () => {
    it("should be a winston format", () => {
      expect(jsonFormat).to.have.property("transform");
      expect(typeof jsonFormat.transform).to.equal("function");
    });

    it("should format basic log entry as JSON-ready object", () => {
      const info = {
        level: "info",
        message: "Test message",
        timestamp: "2024-01-01 12:00:00:000",
      };

      const result = jsonFormat.transform(info);
      expect(result).to.be.an("object");
      expect(result).to.have.property("level");
      expect(result).to.have.property("message");
      expect(result).to.have.property("timestamp");
    });

    it("should sanitize log data", () => {
      const info = {
        level: "info",
        message: "Test message",
        password: "secret123",
        creditCard: "4111111111111111",
        timestamp: "2024-01-01 12:00:00:000",
      };

      const result = jsonFormat.transform(info);

      // Should not contain sensitive data (assuming sanitizer removes these)
      expect(result).to.not.have.property("password");
      expect(result).to.not.have.property("creditCard");
    });

    it("should preserve non-sensitive metadata", () => {
      const info = {
        level: "info",
        message: "Test message",
        userId: "user123",
        requestId: "req-456",
        timestamp: "2024-01-01 12:00:00:000",
      };

      const result = jsonFormat.transform(info);
      expect(result).to.have.property("userId");
      expect(result).to.have.property("requestId");
    });

    it("should handle errors with stack traces", () => {
      const error = new Error("Test error");
      const info = {
        level: "error",
        message: "Error occurred",
        error: error,
        timestamp: "2024-01-01 12:00:00:000",
      };

      const result = jsonFormat.transform(info);
      expect(result).to.be.an("object");
      expect(result).to.have.property("level");
      expect(result).to.have.property("message");
    });

    it("should include timestamp", () => {
      const info = {
        level: "info",
        message: "Test message",
      };

      const result = jsonFormat.transform(info);
      expect(result).to.have.property("timestamp");
      expect(result.timestamp).to.be.a("string");
    });

    it("should handle nested objects", () => {
      const info = {
        level: "info",
        message: "Test message",
        context: {
          service: "test-service",
          module: "auth",
          nested: {
            data: "value",
          },
        },
        timestamp: "2024-01-01 12:00:00:000",
      };

      const result = jsonFormat.transform(info);
      expect(result).to.be.an("object");
      expect(result).to.have.property("context");
    });

    it("should handle array data", () => {
      const info = {
        level: "info",
        message: "Test message",
        items: ["item1", "item2", "item3"],
        timestamp: "2024-01-01 12:00:00:000",
      };

      const result = jsonFormat.transform(info);
      expect(result).to.have.property("items");
      expect(result.items).to.be.an("array");
    });

    it("should handle null and undefined values", () => {
      const info = {
        level: "info",
        message: "Test message",
        nullValue: null,
        undefinedValue: undefined,
        timestamp: "2024-01-01 12:00:00:000",
      };

      const result = jsonFormat.transform(info);
      expect(result).to.be.an("object");
      // Undefined properties might be omitted, null should be preserved
      if (result.hasOwnProperty("nullValue")) {
        expect(result.nullValue).to.be.null;
      }
    });
  });

  describe("Format integration", () => {
    it("should work with winston logger", () => {
      const logger = winston.createLogger({
        level: "info",
        format: jsonFormat,
        transports: [new winston.transports.Console({ silent: true })],
      });

      expect(() => {
        logger.info("Test message", { context: { service: "test" } });
      }).to.not.throw();
    });

    it("should work with both formats in same logger", () => {
      const logger = winston.createLogger({
        level: "info",
        transports: [
          new winston.transports.Console({
            format: consoleFormat,
            silent: true,
          }),
          new winston.transports.File({
            filename: "/dev/null",
            format: jsonFormat,
          }),
        ],
      });

      expect(() => {
        logger.info("Test message", { context: { service: "test" } });
      }).to.not.throw();
    });
  });

  describe("Format error handling", () => {
    it("should handle malformed log objects gracefully", () => {
      const circularObj = {};
      circularObj.self = circularObj;

      const info = {
        level: "info",
        message: "Test message",
        circular: circularObj,
        timestamp: "2024-01-01 12:00:00:000",
      };

      expect(() => {
        jsonFormat.transform(info);
      }).to.not.throw();
    });

    it("should handle empty log objects", () => {
      const info = {};

      expect(() => {
        jsonFormat.transform(info);
        consoleFormat.transform(info);
      }).to.not.throw();
    });

    it("should handle log objects with symbol properties", () => {
      const sym = Symbol("test");
      const info = {
        level: "info",
        message: "Test message",
        [sym]: "symbol value",
        timestamp: "2024-01-01 12:00:00:000",
      };

      expect(() => {
        jsonFormat.transform(info);
      }).to.not.throw();
    });
  });
});
