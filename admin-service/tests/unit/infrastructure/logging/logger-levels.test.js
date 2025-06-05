import { describe, it } from "node:test";
import { expect } from "chai";
import {
  logLevels,
  logColors,
} from "../../../../src/infrastructure/logging/logger-levels.js";

describe("Logger Levels", () => {
  describe("logLevels", () => {
    it("should export logLevels as an object", () => {
      expect(logLevels).to.be.an("object");
    });

    it("should contain the correct log levels with proper priorities", () => {
      const expectedLevels = {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
      };
      expect(logLevels).to.deep.equal(expectedLevels);
    });

    it("should have error as highest priority (lowest number)", () => {
      expect(logLevels.error).to.equal(0);
    });

    it("should have silly as lowest priority (highest number)", () => {
      expect(logLevels.silly).to.equal(6);
    });

    it("should have ascending priority order", () => {
      const levels = Object.values(logLevels);
      const sortedLevels = [...levels].sort((a, b) => a - b);
      expect(levels).to.deep.equal(sortedLevels);
    });

    it("should have 7 log levels", () => {
      expect(Object.keys(logLevels)).to.have.length(7);
    });

    it("should contain all expected level names", () => {
      const expectedNames = [
        "error",
        "warn",
        "info",
        "http",
        "verbose",
        "debug",
        "silly",
      ];
      expect(Object.keys(logLevels)).to.have.members(expectedNames);
    });

    it("should have unique priority values", () => {
      const values = Object.values(logLevels);
      const uniqueValues = [...new Set(values)];
      expect(uniqueValues).to.have.length(values.length);
    });

    it("should have consecutive integer values starting from 0", () => {
      const values = Object.values(logLevels).sort((a, b) => a - b);
      values.forEach((value, index) => {
        expect(value).to.equal(index);
      });
    });
  });

  describe("logColors", () => {
    it("should export logColors as an object", () => {
      expect(logColors).to.be.an("object");
    });

    it("should contain colors for all log levels", () => {
      const levelNames = Object.keys(logLevels);
      const colorNames = Object.keys(logColors);
      expect(colorNames).to.have.members(levelNames);
    });

    it("should have string values for all colors", () => {
      Object.values(logColors).forEach((color) => {
        expect(color).to.be.a("string");
        expect(color.trim()).to.equal(color);
        expect(color).to.not.equal("");
      });
    });

    it("should contain the correct color mappings", () => {
      const expectedColors = {
        error: "bold inverse red",
        warn: "inverse yellow",
        info: "green",
        http: "magenta",
        verbose: "green",
        debug: "blue",
        silly: "gray",
      };
      expect(logColors).to.deep.equal(expectedColors);
    });

    it("should have same number of colors as levels", () => {
      expect(Object.keys(logColors)).to.have.length(
        Object.keys(logLevels).length
      );
    });

    it("should have error level with prominent color styling", () => {
      expect(logColors.error).to.include("bold");
      expect(logColors.error).to.include("inverse");
      expect(logColors.error).to.include("red");
    });

    it("should have warn level with prominent color styling", () => {
      expect(logColors.warn).to.include("inverse");
      expect(logColors.warn).to.include("yellow");
    });

    it("should use valid color names", () => {
      const validColors = ["red", "yellow", "green", "magenta", "blue", "gray"];
      const colorStyles = ["bold", "inverse"];

      Object.values(logColors).forEach((colorSpec) => {
        const parts = colorSpec.split(" ");
        const hasValidColor = parts.some((part) => validColors.includes(part));
        expect(hasValidColor).to.be.true;
      });
    });
  });

  describe("Relationship between levels and colors", () => {
    it("should have matching keys between levels and colors", () => {
      const levelKeys = Object.keys(logLevels).sort();
      const colorKeys = Object.keys(logColors).sort();
      expect(levelKeys).to.deep.equal(colorKeys);
    });

    it("should not have any missing color mappings", () => {
      Object.keys(logLevels).forEach((level) => {
        expect(logColors).to.have.property(level);
        expect(logColors[level]).to.be.a("string");
      });
    });

    it("should not have any orphaned color mappings", () => {
      Object.keys(logColors).forEach((level) => {
        expect(logLevels).to.have.property(level);
        expect(logLevels[level]).to.be.a("number");
      });
    });
  });

  describe("Immutability", () => {
    it("should not allow modification of logLevels", () => {
      expect(() => {
        logLevels.newLevel = 10;
      }).to.throw();
    });

    it("should not allow modification of logColors", () => {
      expect(() => {
        logColors.newColor = "purple";
      }).to.throw();
    });

    it("should not allow deletion of log levels", () => {
      expect(() => {
        delete logLevels.error;
      }).to.throw();
    });

    it("should not allow deletion of log colors", () => {
      expect(() => {
        delete logColors.error;
      }).to.throw();
    });
  });
});
