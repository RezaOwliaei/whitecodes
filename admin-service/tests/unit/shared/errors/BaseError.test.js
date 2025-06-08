import { describe, it, beforeEach, afterEach } from "node:test";

import { expect } from "chai";

import { BaseError } from "../../../../src/shared/errors/BaseError.js";

describe("BaseError", () => {
  describe("Basic Error Functionality", () => {
    it("should extend Error class", () => {
      const error = new BaseError("Test error");
      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(BaseError);
    });

    it("should have correct error name", () => {
      const error = new BaseError("Test error");
      expect(error.name).to.equal("BaseError");
    });

    it("should preserve error message", () => {
      const message = "Test error message";
      const error = new BaseError(message);
      expect(error.message).to.equal(message);
    });

    it("should have stack trace", () => {
      const error = new BaseError("Test error");
      expect(error.stack).to.be.a("string");
      expect(error.stack).to.include("BaseError");
    });
  });

  describe("Automatic Caller Detection", () => {
    it("should auto-detect caller context from class methods", () => {
      class TestService {
        performAction() {
          throw new BaseError("Service error");
        }
      }

      const service = new TestService();

      expect(() => {
        service.performAction();
      }).to.throw(BaseError, "Service error");

      // Test the error properties separately
      try {
        service.performAction();
      } catch (error) {
        expect(error.component).to.equal("testservice");
        expect(error.operation).to.equal("performAction");
      }
    });

    it("should auto-detect caller context from static methods", () => {
      class DataFactory {
        static createData() {
          throw new BaseError("Factory error");
        }
      }

      expect(() => {
        DataFactory.createData();
      }).to.throw(BaseError, "Factory error");

      // Test the error properties separately
      try {
        DataFactory.createData();
      } catch (error) {
        expect(error.component).to.equal("datafactory");
        expect(error.operation).to.equal("createData");
      }
    });

    it("should auto-detect caller context from regular functions", () => {
      function processData() {
        throw new BaseError("Processing error");
      }

      expect(() => {
        processData();
      }).to.throw(BaseError, "Processing error");

      // Test the error properties separately
      try {
        processData();
      } catch (error) {
        expect(error.component).to.equal("processdata");
        expect(error.operation).to.equal("function-call");
      }
    });

    it("should include details in errors", () => {
      class ApiService {
        makeRequest() {
          throw new BaseError("Request failed", {
            details: {
              url: "/api/users",
              method: "GET",
              statusCode: 500,
            },
          });
        }
      }

      const service = new ApiService();

      expect(() => {
        service.makeRequest();
      }).to.throw(BaseError, "Request failed");

      // Test the error properties separately
      try {
        service.makeRequest();
      } catch (error) {
        expect(error.component).to.equal("apiservice");
        expect(error.operation).to.equal("makeRequest");
        expect(error.details).to.deep.equal({
          url: "/api/users",
          method: "GET",
          statusCode: 500,
        });
      }
    });
  });

  describe("Manual Context Override", () => {
    it("should allow manual component and operation override", () => {
      function helperFunction() {
        throw new BaseError("Custom error", {
          component: "custom-component",
          operation: "custom-operation",
          details: { customDetail: "value" },
        });
      }

      expect(() => {
        helperFunction();
      }).to.throw(BaseError, "Custom error");

      // Test the error properties separately
      try {
        helperFunction();
      } catch (error) {
        expect(error.component).to.equal("custom-component");
        expect(error.operation).to.equal("custom-operation");
        expect(error.details).to.deep.equal({ customDetail: "value" });
      }
    });

    it("should allow partial manual override", () => {
      class TestService {
        performAction() {
          throw new BaseError("Test error", {
            component: "manual-component", // Override component
            // operation will be auto-detected
            details: { testData: "value" },
          });
        }
      }

      const service = new TestService();

      expect(() => {
        service.performAction();
      }).to.throw(BaseError, "Test error");

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
        throw new BaseError("Stack depth test", {
          stackDepth: 2,
        });
      }

      expect(() => {
        outerFunction();
      }).to.throw(BaseError, "Stack depth test");

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
    it("should handle empty details gracefully", () => {
      const error = new BaseError("Test error", { details: {} });
      expect(error.details).to.be.null;
    });

    it("should handle undefined details gracefully", () => {
      const error = new BaseError("Test error");
      expect(error.details).to.be.null;
    });

    it("should preserve stack trace", () => {
      const error = new BaseError("Test error");
      expect(error.stack).to.be.a("string");
      expect(error.stack).to.include("BaseError");
    });
  });

  describe("Inheritance Support", () => {
    it("should support inheritance with correct error names", () => {
      class CustomError extends BaseError {
        constructor(message, options) {
          super(message, options);
        }
      }

      class ValidationError extends BaseError {
        constructor(message, options) {
          super(message, options);
        }
      }

      const customError = new CustomError("Custom error");
      const validationError = new ValidationError("Validation error");

      expect(customError.name).to.equal("CustomError");
      expect(validationError.name).to.equal("ValidationError");

      expect(customError).to.be.instanceOf(BaseError);
      expect(customError).to.be.instanceOf(CustomError);
      expect(validationError).to.be.instanceOf(BaseError);
      expect(validationError).to.be.instanceOf(ValidationError);
    });

    it("should maintain caller detection in inherited classes", () => {
      class ValidationError extends BaseError {
        constructor(message, options) {
          super(message, options);
        }
      }

      class UserService {
        validateUser() {
          throw new ValidationError("User validation failed");
        }
      }

      const service = new UserService();

      expect(() => {
        service.validateUser();
      }).to.throw(ValidationError, "User validation failed");

      // Test the error properties separately
      try {
        service.validateUser();
      } catch (error) {
        expect(error.name).to.equal("ValidationError");
        expect(error.component).to.equal("userservice");
        expect(error.operation).to.equal("validateUser");
      }
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle stack parsing failures gracefully", () => {
      // Create error with corrupted stack
      const error = new BaseError("Test error");

      // Manually corrupt the stack to test fallback
      const originalStack = error.stack;
      error.stack = null;

      // Should still have valid component and operation (from when it was created)
      expect(error).to.be.instanceOf(BaseError);
      expect(error.component).to.be.a("string");
      expect(error.operation).to.be.a("string");

      // Restore stack
      error.stack = originalStack;
    });

    it("should handle missing stack traces", () => {
      // This test verifies the error doesn't break when stack parsing returns fallback
      class TestClass {
        testMethod() {
          return new BaseError("Test with potential stack issues");
        }
      }

      const instance = new TestClass();
      const error = instance.testMethod();

      expect(error).to.be.instanceOf(BaseError);
      expect(error.component).to.be.a("string");
      expect(error.operation).to.be.a("string");
      expect(error.message).to.equal("Test with potential stack issues");
    });
  });

  describe("Error System Integration", () => {
    it("should integrate properly with JavaScript Error system", () => {
      const error = new BaseError("Test error");

      // ✅ ACCEPTABLE: Testing error system integration (business critical)
      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(BaseError);
      expect(error.name).to.equal("BaseError");
      expect(error.stack).to.be.a("string");
    });
  });
});
