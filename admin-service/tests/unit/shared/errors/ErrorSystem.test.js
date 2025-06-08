import { describe, it } from "node:test";

import { expect } from "chai";

import {
  BaseError,
  ConfigurationError,
  ValidationError,
  BusinessLogicError,
} from "../../../../src/shared/errors/index.js";

describe("Error System Integration", () => {
  describe("Inheritance Hierarchy", () => {
    it("should maintain proper inheritance chain", () => {
      const configError = new ConfigurationError("Config error");
      const validationError = new ValidationError("Validation error");
      const businessError = new BusinessLogicError("Business error");

      // All should inherit from BaseError and Error
      expect(configError).to.be.instanceOf(BaseError);
      expect(configError).to.be.instanceOf(Error);
      expect(validationError).to.be.instanceOf(BaseError);
      expect(validationError).to.be.instanceOf(Error);
      expect(businessError).to.be.instanceOf(BaseError);
      expect(businessError).to.be.instanceOf(Error);

      // Each should have correct specific type
      expect(configError).to.be.instanceOf(ConfigurationError);
      expect(validationError).to.be.instanceOf(ValidationError);
      expect(businessError).to.be.instanceOf(BusinessLogicError);

      // Cross-type checks should fail
      expect(configError).to.not.be.instanceOf(ValidationError);
      expect(validationError).to.not.be.instanceOf(BusinessLogicError);
      expect(businessError).to.not.be.instanceOf(ConfigurationError);
    });

    it("should have correct error names", () => {
      const configError = new ConfigurationError("Config error");
      const validationError = new ValidationError("Validation error");
      const businessError = new BusinessLogicError("Business error");

      expect(configError.name).to.equal("ConfigurationError");
      expect(validationError.name).to.equal("ValidationError");
      expect(businessError.name).to.equal("BusinessLogicError");
    });
  });

  describe("Automatic Caller Detection Consistency", () => {
    it("should provide consistent caller detection across all error types", () => {
      class UserService {
        validateUser() {
          throw new ValidationError("Invalid user data", {
            field: "email",
            value: "invalid-email",
            rule: "email-format",
          });
        }

        configureUser() {
          throw new ConfigurationError("User configuration failed", {
            details: { configType: "permissions" },
          });
        }

        processUser() {
          throw new BusinessLogicError("Business rule violation", {
            businessRule: "max-users-exceeded",
            entityType: "User",
            entityId: "user-123",
          });
        }
      }

      const service = new UserService();

      // Test ValidationError
      try {
        service.validateUser();
      } catch (error) {
        expect(error).to.be.instanceOf(ValidationError);
        expect(error.component).to.equal("userservice");
        expect(error.operation).to.equal("validateUser");
        expect(error.field).to.equal("email");
        expect(error.value).to.equal("invalid-email");
        expect(error.rule).to.equal("email-format");
      }

      // Test ConfigurationError
      try {
        service.configureUser();
      } catch (error) {
        expect(error).to.be.instanceOf(ConfigurationError);
        expect(error.component).to.equal("userservice");
        expect(error.operation).to.equal("configureUser");
        expect(error.details).to.deep.equal({ configType: "permissions" });
      }

      // Test BusinessLogicError
      try {
        service.processUser();
      } catch (error) {
        expect(error).to.be.instanceOf(BusinessLogicError);
        expect(error.component).to.equal("userservice");
        expect(error.operation).to.equal("processUser");
        expect(error.businessRule).to.equal("max-users-exceeded");
        expect(error.entityType).to.equal("User");
        expect(error.entityId).to.equal("user-123");
      }
    });
  });

  describe("Error Handling Patterns", () => {
    it("should support polymorphic error handling", () => {
      function throwRandomError() {
        const errors = [
          () => new ConfigurationError("Config failed"),
          () => new ValidationError("Validation failed"),
          () => new BusinessLogicError("Business rule failed"),
        ];

        const randomError = errors[Math.floor(Math.random() * errors.length)];
        throw randomError();
      }

      try {
        throwRandomError();
      } catch (error) {
        // Should always be a BaseError regardless of specific type
        expect(error).to.be.instanceOf(BaseError);
        expect(error).to.be.instanceOf(Error);

        // Should have common properties
        expect(error.component).to.be.a("string");
        expect(error.operation).to.be.a("string");
        expect(error.name).to.be.a("string");
        expect(error.message).to.be.a("string");
      }
    });

    it("should support specific error type handling", () => {
      function handleError(error) {
        if (error instanceof ValidationError) {
          return {
            type: "validation",
            field: error.field,
            rule: error.rule,
          };
        } else if (error instanceof ConfigurationError) {
          return {
            type: "configuration",
            details: error.details,
          };
        } else if (error instanceof BusinessLogicError) {
          return {
            type: "business",
            rule: error.businessRule,
            entity: error.entityType,
          };
        } else {
          return {
            type: "unknown",
            message: error.message,
          };
        }
      }

      const validationError = new ValidationError("Invalid data", {
        field: "age",
        rule: "min-value",
      });

      const configError = new ConfigurationError("Config error", {
        details: { setting: "timeout" },
      });

      const businessError = new BusinessLogicError("Rule violation", {
        businessRule: "account-limit",
        entityType: "Account",
      });

      expect(handleError(validationError)).to.deep.equal({
        type: "validation",
        field: "age",
        rule: "min-value",
      });

      expect(handleError(configError)).to.deep.equal({
        type: "configuration",
        details: { setting: "timeout" },
      });

      expect(handleError(businessError)).to.deep.equal({
        type: "business",
        rule: "account-limit",
        entity: "Account",
      });
    });
  });

  describe("Extensibility", () => {
    it("should support creating new error types easily", () => {
      class NetworkError extends BaseError {
        constructor(message, options = {}) {
          super(message, options);
          this.statusCode = options.statusCode || null;
          this.url = options.url || null;
          this.method = options.method || null;
        }
      }

      class ApiService {
        makeRequest() {
          throw new NetworkError("Request failed", {
            statusCode: 500,
            url: "/api/users",
            method: "GET",
          });
        }
      }

      const service = new ApiService();

      try {
        service.makeRequest();
      } catch (error) {
        expect(error).to.be.instanceOf(NetworkError);
        expect(error).to.be.instanceOf(BaseError);
        expect(error).to.be.instanceOf(Error);
        expect(error.name).to.equal("NetworkError");
        expect(error.component).to.equal("apiservice");
        expect(error.operation).to.equal("makeRequest");
        expect(error.statusCode).to.equal(500);
        expect(error.url).to.equal("/api/users");
        expect(error.method).to.equal("GET");
      }
    });
  });
});
