import { describe, it } from "node:test";

import { expect } from "chai";

import { ConfigurationError } from "../../../../src/shared/errors/ConfigurationError.js";

describe("ConfigurationError", () => {
  describe("Automatic Caller Detection", () => {
    it("should auto-detect caller context from class methods", () => {
      class DatabaseService {
        connect() {
          throw new ConfigurationError("Connection failed");
        }
      }

      const service = new DatabaseService();

      expect(() => {
        service.connect();
      }).to.throw(ConfigurationError, "Connection failed");

      // Test the error properties separately
      try {
        service.connect();
      } catch (error) {
        expect(error.component).to.equal("databaseservice");
        expect(error.operation).to.equal("connect");
      }
    });

    it("should auto-detect caller context from static methods", () => {
      class UserFactory {
        static createUser() {
          throw new ConfigurationError("User creation failed");
        }
      }

      expect(() => {
        UserFactory.createUser();
      }).to.throw(ConfigurationError, "User creation failed");

      // Test the error properties separately
      try {
        UserFactory.createUser();
      } catch (error) {
        expect(error.component).to.equal("userfactory");
        expect(error.operation).to.equal("createUser");
      }
    });

    it("should auto-detect caller context from regular functions", () => {
      function initializeApplication() {
        throw new ConfigurationError("Initialization failed");
      }

      expect(() => {
        initializeApplication();
      }).to.throw(ConfigurationError, "Initialization failed");

      // Test the error properties separately
      try {
        initializeApplication();
      } catch (error) {
        expect(error.component).to.equal("initializeapplication");
        expect(error.operation).to.equal("function-call");
      }
    });

    it("should include details in auto-detected errors", () => {
      class ConfigService {
        loadConfig() {
          throw new ConfigurationError("Config load failed", {
            details: {
              configPath: "/path/to/config",
              reason: "file not found",
            },
          });
        }
      }

      const service = new ConfigService();

      expect(() => {
        service.loadConfig();
      }).to.throw(ConfigurationError, "Config load failed");

      // Test the error properties separately
      try {
        service.loadConfig();
      } catch (error) {
        expect(error.component).to.equal("configservice");
        expect(error.operation).to.equal("loadConfig");
        expect(error.details).to.deep.equal({
          configPath: "/path/to/config",
          reason: "file not found",
        });
      }
    });
  });

  describe("Manual Context Override", () => {
    it("should allow manual component and operation override", () => {
      function helperFunction() {
        throw new ConfigurationError("Custom error", {
          component: "custom-component",
          operation: "custom-operation",
          details: { customDetail: "value" },
        });
      }

      expect(() => {
        helperFunction();
      }).to.throw(ConfigurationError, "Custom error");

      // Test the error properties separately
      try {
        helperFunction();
      } catch (error) {
        expect(error.component).to.equal("custom-component");
        expect(error.operation).to.equal("custom-operation");
        expect(error.details).to.deep.equal({ customDetail: "value" });
      }
    });

    it("should allow partial manual override with constructor", () => {
      class TestService {
        performAction() {
          throw new ConfigurationError("Test error", {
            component: "manual-component", // Override component
            // operation will be auto-detected
            details: { testData: "value" },
          });
        }
      }

      const service = new TestService();

      expect(() => {
        service.performAction();
      }).to.throw(ConfigurationError, "Test error");

      // Test the error properties separately
      try {
        service.performAction();
      } catch (error) {
        expect(error.component).to.equal("manual-component");
        expect(error.operation).to.equal("performAction"); // Auto-detected
        expect(error.details).to.deep.equal({ testData: "value" });
      }
    });

    it("should allow custom stack depth", () => {
      function outerFunction() {
        return innerFunction();
      }

      function innerFunction() {
        // Use depth 2 to get outerFunction instead of innerFunction
        throw new ConfigurationError("Stack depth test", {
          stackDepth: 2,
        });
      }

      expect(() => {
        outerFunction();
      }).to.throw(ConfigurationError, "Stack depth test");

      // Test the error properties separately
      try {
        outerFunction();
      } catch (error) {
        expect(error.component).to.equal("outerfunction");
        expect(error.operation).to.equal("function-call");
      }
    });
  });

  describe("Error Properties", () => {
    it("should have correct error name", () => {
      const error = new ConfigurationError("Test error");
      expect(error.name).to.equal("ConfigurationError");
    });

    it("should be instance of Error", () => {
      const error = new ConfigurationError("Test error");
      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(ConfigurationError);
    });

    it("should handle empty details gracefully", () => {
      const error = new ConfigurationError("Test error", { details: {} });
      expect(error.details).to.be.null;
    });

    it("should handle undefined details gracefully", () => {
      const error = new ConfigurationError("Test error");
      expect(error.details).to.be.null;
    });

    it("should preserve stack trace", () => {
      const error = new ConfigurationError("Test error");
      expect(error.stack).to.be.a("string");
      expect(error.stack).to.include("ConfigurationError");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle stack parsing failures gracefully", () => {
      // Create error with corrupted stack
      const error = new ConfigurationError("Test error");

      // Manually corrupt the stack to test fallback
      const originalStack = error.stack;
      error.stack = null;

      // Should still have valid component and operation (from when it was created)
      expect(error).to.be.instanceOf(ConfigurationError);
      expect(error.component).to.be.a("string");
      expect(error.operation).to.be.a("string");

      // Restore stack
      error.stack = originalStack;
    });

    it("should handle missing stack traces", () => {
      // This test verifies the error doesn't break when stack parsing returns fallback
      class TestClass {
        testMethod() {
          return new ConfigurationError("Test with potential stack issues");
        }
      }

      const instance = new TestClass();
      const error = instance.testMethod();

      expect(error).to.be.instanceOf(ConfigurationError);
      expect(error.component).to.be.a("string");
      expect(error.operation).to.be.a("string");
      expect(error.message).to.equal("Test with potential stack issues");
    });
  });

  describe("Integration with Logger Factory Pattern", () => {
    it("should work seamlessly with factory validation patterns", () => {
      class LoggerFactory {
        createLogger(adapter) {
          if (!adapter) {
            throw new ConfigurationError("Invalid adapter provided", {
              details: {
                receivedType: typeof adapter,
                expectedType: "LoggerPort",
              },
            });
          }
          return "logger created";
        }
      }

      const factory = new LoggerFactory();

      expect(() => {
        factory.createLogger(null);
      }).to.throw(ConfigurationError, "Invalid adapter provided");

      // Test the error properties separately
      try {
        factory.createLogger(null);
      } catch (error) {
        expect(error.component).to.equal("loggerfactory");
        expect(error.operation).to.equal("createLogger");
        expect(error.details).to.deep.equal({
          receivedType: "object",
          expectedType: "LoggerPort",
        });
      }
    });
  });
});
