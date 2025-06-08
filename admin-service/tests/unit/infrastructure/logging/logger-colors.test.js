import { describe, it } from "node:test";

import { expect } from "chai";

import { logColors } from "../../../../src/infrastructure/logging/logger-colors.js";
import { logLevels } from "../../../../src/infrastructure/logging/logger-levels.js";

/**
 * Logger Colors Test Suite
 *
 * Tests static color configuration for logging levels.
 * Scope: Basic structure + key behavior + security visibility (static config pattern).
 */
describe("Logger Colors", () => {
  describe("Structure", () => {
    it("should export logColors as an object", () => {
      expect(logColors).to.be.an("object");
    });

    it("should contain colors for all log levels", () => {
      const levelNames = Object.keys(logLevels);
      const colorNames = Object.keys(logColors);
      expect(colorNames).to.have.members(levelNames);
    });

    it("should have non-empty string values for all colors", () => {
      Object.values(logColors).forEach((color) => {
        expect(color).to.be.a("string");
        expect(color.trim()).to.not.equal("");
      });
    });
  });

  describe("Key Behavior", () => {
    it("should provide prominent styling for critical levels", () => {
      expect(logColors.error).to.match(/(bold|inverse)/);
      expect(logColors.warn).to.match(/(bold|inverse)/);
    });

    it("should be immutable", () => {
      expect(() => {
        logColors.newColor = "purple";
      }).to.throw();
    });
  });

  describe("Security Considerations", () => {
    it("should ensure security incidents are highly visible", () => {
      // Error logs must be immediately noticeable to operators
      expect(logColors.error).to.match(/(bold|inverse)/);
    });

    it("should ensure warnings stand out for security alerts", () => {
      // Warning logs should be attention-getting for security issues
      expect(logColors.warn).to.match(/(bold|inverse)/);
    });

    it("should not use colors that could hide security information", () => {
      // Prevent colors that might be invisible or hard to read
      const invisibleColors = ["white", "hidden", "transparent"];
      Object.values(logColors).forEach((color) => {
        invisibleColors.forEach((invisibleColor) => {
          expect(color.toLowerCase()).to.not.include(invisibleColor);
        });
      });
    });
  });
});
