import { describe, it, beforeEach, afterEach, mock } from "node:test";

import { expect } from "chai";

// Mock dependencies before importing the module under test
const mockLoggerFactory = mock.fn();
mock.module("../../../../src/infrastructure/logging/logger.factory.js", () => ({
  createLoggerFactory: mockLoggerFactory,
}));

const MOCK_BASE_CONTEXT = { service: "mock-admin-service", domain: "test" };
mock.module(
  "../../../../src/infrastructure/logging/logger-base-context.js",
  () => ({
    BASE_CONTEXT: MOCK_BASE_CONTEXT,
  })
);

const mockWinstonAdapter = { constructor: { name: "WinstonLoggerAdapter" } };
mock.module(
  "../../../../src/infrastructure/logging/winston-logger.adapter.js",
  () => ({
    default: function () {
      return mockWinstonAdapter;
    },
  })
);

const mockPinoAdapter = { constructor: { name: "PinoLoggerAdapter" } };
mock.module(
  "../../../../src/infrastructure/logging/pino-logger.adapter.js",
  () => ({
    default: function () {
      return mockPinoAdapter;
    },
  })
);

/**
 * Logger Entry Point Tests
 *
 * Architecture: Infrastructure Component (Integration Testing)
 * Scope: Logger module composition root and configuration
 *
 * Focus: Verifies that createLogger correctly configures and delegates
 * to the logger factory without re-testing the factory's internal logic.
 */
describe("Logger Entry Point", () => {
  let createLogger, baseLogger;

  beforeEach(async () => {
    // === Test Setup Flow ===
    // STEP 1: Reset mocks before each test to ensure isolation.
    mockLoggerFactory.mock.resetCalls();

    // STEP 2: Dynamically import the logger module.
    // NOTE: This ensures the module under test uses our mocked dependencies,
    // as the mocks must be declared before the module is imported.
    const loggerModule = await import(
      "../../../../src/infrastructure/logging/logger.js"
    );
    createLogger = loggerModule.default;
    baseLogger = loggerModule.baseLogger;
  });

  afterEach(() => {
    // No mocks to reset here as they are cleared in beforeEach.
    // This is kept for structural consistency.
  });

  // === Module Contract Verification ===
  // Verifies that the module's public API (its exports) is stable
  // and behaves as expected, ensuring that consumers can reliably
  // import and use the logger factory and the base instance.
  describe("Module Exports", () => {
    it("should export createLogger factory and a baseLogger instance", () => {
      expect(createLogger).to.be.a("function");
      expect(baseLogger).to.be.an("object");
    });
  });

  // === Factory Configuration and Delegation Tests ===
  // These tests verify that the `createLogger` function correctly
  // processes its inputs (context and options) and delegates
  // the actual logger creation to the factory with the correct parameters.
  describe("createLogger Factory", () => {
    it("should call the logger factory with merged base and provided context", () => {
      // ARRANGE
      const context = { module: "auth", feature: "login" };

      // ACT
      createLogger(context);

      // ASSERT
      expect(mockLoggerFactory.mock.callCount()).to.equal(1);

      const factoryCallArgs = mockLoggerFactory.mock.calls[0].arguments;
      const factoryContext = factoryCallArgs[0].context;

      // Verify the context passed to the factory is correctly merged
      expect(factoryContext).to.deep.equal({
        ...MOCK_BASE_CONTEXT,
        ...context,
      });
    });

    it("should handle calls with no context by using only the base context", () => {
      // ARRANGE & ACT
      createLogger(); // Call with no arguments

      // ASSERT
      expect(mockLoggerFactory.mock.callCount()).to.equal(1);

      const factoryContext =
        mockLoggerFactory.mock.calls[0].arguments[0].context;

      expect(factoryContext).to.deep.equal(MOCK_BASE_CONTEXT);
    });

    it("should correctly select the Winston adapter by default", () => {
      // ARRANGE & ACT
      createLogger();

      // ASSERT
      expect(mockLoggerFactory.mock.callCount()).to.equal(1);
      const adapterInstance = mockLoggerFactory.mock.calls[0].arguments[1];
      expect(adapterInstance).to.equal(mockWinstonAdapter);
    });

    it("should correctly select the Pino adapter when specified", () => {
      // ARRANGE & ACT
      createLogger({}, { adapterName: "pino" });

      // ASSERT
      expect(mockLoggerFactory.mock.callCount()).to.equal(1);
      const adapterInstance = mockLoggerFactory.mock.calls[0].arguments[1];
      expect(adapterInstance).to.equal(mockPinoAdapter);
    });

    it("should pass a custom adapter instance directly to the factory", () => {
      // ARRANGE
      const customAdapter = { info: () => {} };
      const logMethods = ["info"];

      // ACT
      createLogger(
        {},
        { adapterInstance: customAdapter, logMethods: logMethods }
      );

      // ASSERT
      expect(mockLoggerFactory.mock.callCount()).to.equal(1);
      const factoryCallArgs = mockLoggerFactory.mock.calls[0].arguments;

      expect(factoryCallArgs[1]).to.equal(customAdapter);
      expect(factoryCallArgs[2]).to.deep.equal(logMethods);
    });
  });

  // === Base Logger Instantiation Test ===
  // Verifies that the singleton `baseLogger` instance is automatically
  // created upon module import with the correct base context.
  describe("baseLogger Instance", () => {
    it("should be created using only the base context", () => {
      // FLOW:
      // 1. The `baseLogger` is created when the module is imported in `beforeEach`.
      // 2. The factory mock captures all calls made during that import.
      // 3. We inspect the captured calls to find the one that corresponds to
      //    the `baseLogger` instantiation, which is the call made with only
      //    the base context.
      const baseLoggerCreationCall = mockLoggerFactory.mock.calls.find(
        (call) => {
          const context = call.arguments[0].context;
          return (
            Object.keys(context).length ===
            Object.keys(MOCK_BASE_CONTEXT).length
          );
        }
      );

      expect(baseLoggerCreationCall).to.not.be.undefined;
      expect(baseLoggerCreationCall.arguments[0].context).to.deep.equal(
        MOCK_BASE_CONTEXT
      );
    });
  });
});
