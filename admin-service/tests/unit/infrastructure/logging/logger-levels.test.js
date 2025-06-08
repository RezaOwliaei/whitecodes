import { describe, it } from "node:test";

import { expect } from "chai";

import { logLevels } from "../../../../src/infrastructure/logging/logger-levels.js";

/**
 * Logger Levels Test Suite
 *
 * Tests essential behavior of log level priority configuration.
 * Scope: Core requirements + security boundaries (static config pattern).
 */
describe("Logger Levels", () => {
  describe("Structure", () => {
    it("should export logLevels as an object", () => {
      expect(logLevels).to.be.an("object");
    });

    it("should have numeric priority values", () => {
      Object.values(logLevels).forEach((priority) => {
        expect(priority).to.be.a("number");
        expect(Number.isInteger(priority)).to.be.true;
      });
    });
  });

  describe("Key Behavior", () => {
    it("should have unique priority values", () => {
      const priorities = Object.values(logLevels);
      const uniquePriorities = new Set(priorities);
      expect(uniquePriorities.size).to.equal(priorities.length);
    });

    it("should be immutable", () => {
      expect(() => {
        logLevels.newLevel = 10;
      }).to.throw();
    });
  });

  describe("Security Considerations", () => {
    it("should ensure error logs cannot be suppressed", () => {
      const allPriorities = Object.values(logLevels);
      const minPriority = Math.min(...allPriorities);
      expect(logLevels.error).to.equal(minPriority);
    });

    it("should ensure security-critical levels have high priority", () => {
      expect(logLevels.error).to.be.lessThan(logLevels.warn);
      expect(logLevels.warn).to.be.lessThan(logLevels.info);
    });

    it("should have reasonable priority boundaries to prevent abuse", () => {
      const maxPriority = Math.max(...Object.values(logLevels));
      expect(maxPriority).to.be.lessThan(10); // Prevent excessive debug levels
    });
  });
});
