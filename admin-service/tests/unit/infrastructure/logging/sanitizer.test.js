import { describe, it } from "node:test";

import { expect } from "chai";

import { sanitize } from "../../../../src/shared/utils/sanitizer.js";

describe("Sanitizer Utility", () => {
  describe("Basic sanitization", () => {
    it("should return non-object data as is", () => {
      expect(sanitize("string")).to.equal("string");
      expect(sanitize(123)).to.equal(123);
      expect(sanitize(true)).to.equal(true);
      expect(sanitize(null)).to.equal(null);
      expect(sanitize(undefined)).to.equal(undefined);
    });

    it("should sanitize sensitive fields in objects", () => {
      const input = {
        password: "secret123",
        username: "john_doe",
        email: "john@example.com",
      };

      const result = sanitize(input);

      expect(result.password).to.equal("***REDACTED***");
      expect(result.username).to.equal("john_doe");
      expect(result.email).to.equal("john@example.com");
    });

    it("should return original object if no sensitive data found", () => {
      const input = {
        username: "john_doe",
        email: "john@example.com",
        age: 25,
      };

      const result = sanitize(input);

      expect(result).to.equal(input); // Same reference
    });

    it("should return new object if sensitive data found", () => {
      const input = {
        username: "john_doe",
        password: "secret123",
      };

      const result = sanitize(input);

      expect(result).to.not.equal(input); // Different reference
      expect(result.username).to.equal("john_doe");
      expect(result.password).to.equal("***REDACTED***");
    });
  });

  describe("Sensitive fields detection", () => {
    it("should sanitize password fields", () => {
      const input = { password: "secret123" };
      const result = sanitize(input);
      expect(result.password).to.equal("***REDACTED***");
    });

    it("should sanitize token fields", () => {
      const input = { token: "abc123token" };
      const result = sanitize(input);
      expect(result.token).to.equal("***REDACTED***");
    });

    it("should sanitize secret fields", () => {
      const input = { secret: "mysecret" };
      const result = sanitize(input);
      expect(result.secret).to.equal("***REDACTED***");
    });

    it("should sanitize API key fields", () => {
      const testCases = [
        { apiKey: "key123" },
        { apikey: "key123" },
        { accessToken: "token123" },
        { accesstoken: "token123" },
        { refreshToken: "refresh123" },
        { refreshtoken: "refresh123" },
      ];

      testCases.forEach((input) => {
        const result = sanitize(input);
        const key = Object.keys(input)[0];
        expect(result[key]).to.equal("***REDACTED***");
      });
    });

    it("should sanitize credit card and financial fields", () => {
      const testCases = [
        { ssn: "123-45-6789" },
        { creditCard: "4111111111111111" },
        { creditcard: "4111111111111111" },
        { cardNumber: "4111111111111111" },
        { cardnumber: "4111111111111111" },
        { pin: "1234" },
      ];

      testCases.forEach((input) => {
        const result = sanitize(input);
        const key = Object.keys(input)[0];
        expect(result[key]).to.equal("***REDACTED***");
      });
    });

    it("should sanitize authentication fields", () => {
      const testCases = [
        { privateKey: "-----BEGIN PRIVATE KEY-----" },
        { privatekey: "-----BEGIN PRIVATE KEY-----" },
        { clientSecret: "client_secret_123" },
        { clientsecret: "client_secret_123" },
        { auth: "Bearer token123" },
        { authorization: "Bearer token123" },
        { jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        { session: "session_123" },
        { cookie: "session=abc123" },
      ];

      testCases.forEach((input) => {
        const result = sanitize(input);
        const key = Object.keys(input)[0];
        expect(result[key]).to.equal("***REDACTED***");
      });
    });

    it("should be case insensitive for field names", () => {
      const testCases = [
        { PASSWORD: "secret" },
        { Password: "secret" },
        { pAsSwOrD: "secret" },
        { TOKEN: "token123" },
        { Token: "token123" },
      ];

      testCases.forEach((input) => {
        const result = sanitize(input);
        const key = Object.keys(input)[0];
        expect(result[key]).to.equal("***REDACTED***");
      });
    });
  });

  describe("Nested object sanitization", () => {
    it("should sanitize nested objects", () => {
      const input = {
        user: {
          username: "john_doe",
          password: "secret123",
          profile: {
            email: "john@example.com",
            creditCard: "4111111111111111",
          },
        },
        session: "session_123",
      };

      const result = sanitize(input);

      expect(result.user.username).to.equal("john_doe");
      expect(result.user.password).to.equal("***REDACTED***");
      expect(result.user.profile.email).to.equal("john@example.com");
      expect(result.user.profile.creditCard).to.equal("***REDACTED***");
      expect(result.session).to.equal("***REDACTED***");
    });

    it("should handle deeply nested objects", () => {
      const input = {
        level1: {
          level2: {
            level3: {
              level4: {
                password: "deep_secret",
                normalField: "normal_value",
              },
            },
          },
        },
      };

      const result = sanitize(input);

      expect(result.level1.level2.level3.level4.password).to.equal(
        "***REDACTED***"
      );
      expect(result.level1.level2.level3.level4.normalField).to.equal(
        "normal_value"
      );
    });

    it("should return original nested object if no sensitive data", () => {
      const input = {
        user: {
          username: "john_doe",
          profile: {
            email: "john@example.com",
            age: 25,
          },
        },
      };

      const result = sanitize(input);

      expect(result).to.equal(input); // Same reference for entire object
    });
  });

  describe("Array sanitization", () => {
    it("should sanitize objects within arrays", () => {
      const input = [
        { username: "user1", password: "secret1" },
        { username: "user2", password: "secret2" },
        { username: "user3", normalField: "value3" },
      ];

      const result = sanitize(input);

      expect(result).to.not.equal(input); // Different reference
      expect(result[0].username).to.equal("user1");
      expect(result[0].password).to.equal("***REDACTED***");
      expect(result[1].username).to.equal("user2");
      expect(result[1].password).to.equal("***REDACTED***");
      expect(result[2].username).to.equal("user3");
      expect(result[2].normalField).to.equal("value3");
    });

    it("should return original array if no sensitive data", () => {
      const input = [
        { username: "user1", email: "user1@example.com" },
        { username: "user2", email: "user2@example.com" },
      ];

      const result = sanitize(input);

      expect(result).to.equal(input); // Same reference
    });

    it("should handle mixed array content", () => {
      const input = [
        "string_value",
        123,
        { username: "user1", password: "secret1" },
        { username: "user2", email: "user2@example.com" },
      ];

      const result = sanitize(input);

      expect(result[0]).to.equal("string_value");
      expect(result[1]).to.equal(123);
      expect(result[2].password).to.equal("***REDACTED***");
      expect(result[3].username).to.equal("user2");
    });

    it("should handle nested arrays", () => {
      const input = [
        [{ password: "secret1" }, { username: "user1" }],
        [{ token: "token123" }, { email: "test@example.com" }],
      ];

      const result = sanitize(input);

      expect(result[0][0].password).to.equal("***REDACTED***");
      expect(result[0][1].username).to.equal("user1");
      expect(result[1][0].token).to.equal("***REDACTED***");
      expect(result[1][1].email).to.equal("test@example.com");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty objects", () => {
      const input = {};
      const result = sanitize(input);
      expect(result).to.equal(input);
    });

    it("should handle empty arrays", () => {
      const input = [];
      const result = sanitize(input);
      expect(result).to.equal(input);
    });

    it("should handle objects with null values", () => {
      const input = {
        password: null,
        username: "john_doe",
        email: null,
      };

      const result = sanitize(input);

      expect(result.password).to.equal("***REDACTED***");
      expect(result.username).to.equal("john_doe");
      expect(result.email).to.equal(null);
    });

    it("should handle objects with undefined values", () => {
      const input = {
        password: undefined,
        username: "john_doe",
        email: undefined,
      };

      const result = sanitize(input);

      expect(result.password).to.equal("***REDACTED***");
      expect(result.username).to.equal("john_doe");
      expect(result.email).to.equal(undefined);
    });

    it("should handle circular references gracefully", () => {
      const input = { username: "john_doe" };
      input.self = input;
      input.password = "secret123";

      // Should not throw an error
      expect(() => sanitize(input)).to.not.throw();
    });

    it("should handle objects with symbol properties", () => {
      const sym = Symbol("test");
      const input = {
        [sym]: "symbol_value",
        password: "secret123",
        username: "john_doe",
      };

      const result = sanitize(input);

      expect(result[sym]).to.equal("symbol_value");
      expect(result.password).to.equal("***REDACTED***");
      expect(result.username).to.equal("john_doe");
    });

    it("should handle objects with non-enumerable properties", () => {
      const input = { username: "john_doe" };
      Object.defineProperty(input, "password", {
        value: "secret123",
        enumerable: false,
        writable: true,
        configurable: true,
      });

      const result = sanitize(input);

      // Non-enumerable properties should not be processed
      expect(result.username).to.equal("john_doe");
      expect(result.hasOwnProperty("password")).to.be.false;
    });

    it("should handle very large objects", () => {
      const input = {};
      for (let i = 0; i < 1000; i++) {
        input[`field_${i}`] = `value_${i}`;
      }
      input.password = "secret123";

      const result = sanitize(input);

      expect(result.password).to.equal("***REDACTED***");
      expect(result.field_0).to.equal("value_0");
      expect(result.field_999).to.equal("value_999");
    });
  });

  describe("hasOwnProperty edge cases", () => {
    it("should handle objects without hasOwnProperty method", () => {
      const input = Object.create(null);
      input.password = "secret123";
      input.username = "john_doe";

      const result = sanitize(input);

      expect(result.password).to.equal("***REDACTED***");
      expect(result.username).to.equal("john_doe");
    });

    it("should handle objects with overridden hasOwnProperty", () => {
      const input = {
        password: "secret123",
        username: "john_doe",
        hasOwnProperty: () => true,
      };

      const result = sanitize(input);

      expect(result.password).to.equal("***REDACTED***");
      expect(result.username).to.equal("john_doe");
    });
  });

  describe("Performance and memory", () => {
    it("should not create unnecessary object copies", () => {
      const input = {
        user: {
          profile: {
            settings: {
              theme: "dark",
              language: "en",
            },
          },
        },
      };

      const result = sanitize(input);

      // Should return same reference when no sensitive data
      expect(result).to.equal(input);
      expect(result.user).to.equal(input.user);
      expect(result.user.profile).to.equal(input.user.profile);
      expect(result.user.profile.settings).to.equal(
        input.user.profile.settings
      );
    });

    it("should minimize object creation when mixed sensitive/non-sensitive data", () => {
      const input = {
        safeData: {
          username: "john_doe",
          email: "john@example.com",
        },
        sensitiveData: {
          password: "secret123",
        },
      };

      const result = sanitize(input);

      // safeData should keep original reference
      expect(result.safeData).to.equal(input.safeData);
      // sensitiveData should be new object
      expect(result.sensitiveData).to.not.equal(input.sensitiveData);
    });
  });
});
