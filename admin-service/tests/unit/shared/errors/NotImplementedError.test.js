import { describe, it } from "node:test";

import { expect } from "chai";

import {
  NotImplementedError,
  BaseError,
} from "../../../../src/shared/errors/index.js";

describe("NotImplementedError", () => {
  describe("Basic Error Functionality", () => {
    it("should extend BaseError and Error", () => {
      const error = new NotImplementedError("Method not implemented");
      expect(error).to.be.instanceOf(BaseError);
      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(NotImplementedError);
    });

    it("should have correct error name", () => {
      const error = new NotImplementedError("Method not implemented");
      expect(error.name).to.equal("NotImplementedError");
    });

    it("should preserve error message", () => {
      const message = "Method 'process' must be implemented";
      const error = new NotImplementedError(message);
      expect(error.message).to.equal(message);
    });

    it("should have stack trace", () => {
      const error = new NotImplementedError("Method not implemented");
      expect(error.stack).to.be.a("string");
      expect(error.stack).to.include("NotImplementedError");
    });
  });

  describe("Implementation-Specific Properties", () => {
    it("should set methodName property", () => {
      const error = new NotImplementedError("Method not implemented", {
        methodName: "processData",
      });
      expect(error.methodName).to.equal("processData");
    });

    it("should set className property", () => {
      const error = new NotImplementedError("Method not implemented", {
        className: "DataProcessor",
      });
      expect(error.className).to.equal("DataProcessor");
    });

    it("should set interfaceName property", () => {
      const error = new NotImplementedError("Method not implemented", {
        interfaceName: "ProcessorPort",
      });
      expect(error.interfaceName).to.equal("ProcessorPort");
    });

    it("should set all implementation properties together", () => {
      const error = new NotImplementedError("Method not implemented", {
        methodName: "execute",
        className: "ConcreteProcessor",
        interfaceName: "ProcessorInterface",
        details: {
          expectedSignature: "execute(data: Object): Promise<Result>",
          documentation: "https://docs.example.com/processor",
        },
      });

      expect(error.methodName).to.equal("execute");
      expect(error.className).to.equal("ConcreteProcessor");
      expect(error.interfaceName).to.equal("ProcessorInterface");
      expect(error.details).to.deep.equal({
        expectedSignature: "execute(data: Object): Promise<Result>",
        documentation: "https://docs.example.com/processor",
      });
    });

    it("should handle null values gracefully", () => {
      const error = new NotImplementedError("Method not implemented");
      expect(error.methodName).to.be.null;
      expect(error.className).to.be.null;
      expect(error.interfaceName).to.be.null;
    });
  });

  describe("Automatic Caller Detection", () => {
    it("should auto-detect caller context from abstract class methods", () => {
      class AbstractProcessor {
        process() {
          throw new NotImplementedError(
            "Method 'process' must be implemented by subclass",
            {
              methodName: "process",
              interfaceName: "ProcessorInterface",
            }
          );
        }
      }

      const processor = new AbstractProcessor();

      expect(() => {
        processor.process();
      }).to.throw(
        NotImplementedError,
        "Method 'process' must be implemented by subclass"
      );

      // Test the error properties separately
      try {
        processor.process();
      } catch (error) {
        expect(error.component).to.equal("abstractprocessor");
        expect(error.operation).to.equal("process");
        expect(error.methodName).to.equal("process");
        expect(error.interfaceName).to.equal("ProcessorInterface");
      }
    });

    it("should work with port/adapter pattern", () => {
      class DatabasePort {
        connect() {
          throw new NotImplementedError(
            "Method 'connect' must be implemented by adapter",
            {
              methodName: "connect",
              interfaceName: "DatabasePort",
              details: {
                expectedImplementation:
                  "Database adapter must implement connect() method",
              },
            }
          );
        }
      }

      const port = new DatabasePort();

      expect(() => {
        port.connect();
      }).to.throw(
        NotImplementedError,
        "Method 'connect' must be implemented by adapter"
      );

      // Test the error properties separately
      try {
        port.connect();
      } catch (error) {
        expect(error.component).to.equal("databaseport");
        expect(error.operation).to.equal("connect");
        expect(error.methodName).to.equal("connect");
        expect(error.interfaceName).to.equal("DatabasePort");
        expect(error.details).to.deep.equal({
          expectedImplementation:
            "Database adapter must implement connect() method",
        });
      }
    });
  });

  describe("Integration with LoggerPort", () => {
    it("should work with LoggerPort pattern", () => {
      // Simulate the LoggerPort usage
      class TestLoggerPort {
        info() {
          throw new NotImplementedError(
            'Method "info" must be implemented by subclass',
            {
              methodName: "info",
              interfaceName: "LoggerPort",
              details: {
                expectedImplementation:
                  "Logger adapter must implement info() method",
                logLevel: "info",
              },
            }
          );
        }
      }

      const logger = new TestLoggerPort();

      expect(() => {
        logger.info("test message");
      }).to.throw(
        NotImplementedError,
        'Method "info" must be implemented by subclass'
      );

      // Test the error properties separately
      try {
        logger.info("test message");
      } catch (error) {
        expect(error.component).to.equal("testloggerport");
        expect(error.operation).to.equal("info");
        expect(error.methodName).to.equal("info");
        expect(error.interfaceName).to.equal("LoggerPort");
        expect(error.details).to.deep.equal({
          expectedImplementation: "Logger adapter must implement info() method",
          logLevel: "info",
        });
      }
    });
  });

  describe("Error Handling Patterns", () => {
    it("should support specific error type handling", () => {
      function handleImplementationError(error) {
        if (error instanceof NotImplementedError) {
          return {
            type: "not-implemented",
            method: error.methodName,
            interface: error.interfaceName,
            class: error.className,
            message: error.message,
          };
        }
        return { type: "unknown", message: error.message };
      }

      const error = new NotImplementedError("Method not implemented", {
        methodName: "execute",
        interfaceName: "ExecutorPort",
        className: "ConcreteExecutor",
      });

      const result = handleImplementationError(error);

      expect(result).to.deep.equal({
        type: "not-implemented",
        method: "execute",
        interface: "ExecutorPort",
        class: "ConcreteExecutor",
        message: "Method not implemented",
      });
    });

    it("should provide helpful debugging information", () => {
      const error = new NotImplementedError("Abstract method called", {
        methodName: "transform",
        interfaceName: "TransformerPort",
        className: "DataTransformer",
        details: {
          expectedSignature: "transform(input: Data): TransformedData",
          documentation: "See TransformerPort interface documentation",
          suggestedImplementation:
            "Override this method in your concrete class",
        },
      });

      expect(error.methodName).to.equal("transform");
      expect(error.interfaceName).to.equal("TransformerPort");
      expect(error.className).to.equal("DataTransformer");
      expect(error.details.expectedSignature).to.equal(
        "transform(input: Data): TransformedData"
      );
      expect(error.details.documentation).to.equal(
        "See TransformerPort interface documentation"
      );
      expect(error.details.suggestedImplementation).to.equal(
        "Override this method in your concrete class"
      );
    });
  });

  describe("Inheritance from BaseError", () => {
    it("should inherit all BaseError functionality", () => {
      const error = new NotImplementedError("Method not implemented", {
        component: "manual-component",
        operation: "manual-operation",
        methodName: "process",
      });

      // Should have BaseError properties
      expect(error.component).to.equal("manual-component");
      expect(error.operation).to.equal("manual-operation");
      expect(error.details).to.be.null; // No details provided

      // Should have NotImplementedError properties
      expect(error.methodName).to.equal("process");
      expect(error.className).to.be.null;
      expect(error.interfaceName).to.be.null;
    });
  });
});
