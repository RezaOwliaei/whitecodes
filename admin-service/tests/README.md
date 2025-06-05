# Testing Standards and Guidelines

This document outlines the testing standards, patterns, and practices for the admin-service project. Follow these guidelines to ensure consistency, reliability, and maintainability across all test suites.

## Overview

Our testing strategy focuses on **comprehensive coverage**, **architectural compliance**, and **developer experience**. We use modern Node.js testing tools and patterns that align with our hexagonal architecture and ESM-first approach.

## Testing Stack

### Core Technologies

| Technology              | Version             | Purpose                      | Documentation                                            |
| ----------------------- | ------------------- | ---------------------------- | -------------------------------------------------------- |
| **Node.js Test Runner** | Built-in (Node 18+) | Test execution and discovery | [Node.js Test Runner](https://nodejs.org/api/test.html)  |
| **Chai**                | ^4.3.10             | Assertions and expectations  | [Chai.js](https://www.chaijs.com/)                       |
| **Node.js Mock**        | Built-in            | Mocking and spying           | [Node.js Mock](https://nodejs.org/api/test.html#mocking) |
| **C8**                  | ^8.0.1              | Code coverage analysis       | [C8 Coverage](https://github.com/bcoe/c8)                |

### Why This Stack?

✅ **Zero External Dependencies**: Uses Node.js built-in capabilities  
✅ **Performance**: Native implementation is faster than external libraries  
✅ **Maintenance**: No external library version conflicts  
✅ **Modern**: Supports ESM, async/await, and latest JavaScript features  
✅ **Standardization**: Consistent with Node.js ecosystem direction

## Project Structure

```
admin-service/tests/
├── README.md                           # This documentation
├── integration/                        # Integration test suites
│   └── .gitkeep
├── unit/                              # Unit test suites
│   └── infrastructure/
│       └── logging/                   # Logging subsystem tests
│           ├── README.md              # Component-specific docs
│           ├── *.test.js              # Test files
│           └── ...
└── shared/                            # Shared test utilities
    ├── fixtures/                      # Test data and fixtures
    ├── helpers/                       # Test helper functions
    └── mocks/                         # Reusable mock objects
```

### File Naming Conventions

| Type                  | Pattern                 | Example                   |
| --------------------- | ----------------------- | ------------------------- |
| **Unit Tests**        | `*.test.js`             | `logger.factory.test.js`  |
| **Integration Tests** | `*.integration.test.js` | `api.integration.test.js` |
| **Test Helpers**      | `*.helper.js`           | `database.helper.js`      |
| **Test Fixtures**     | `*.fixture.js`          | `user.fixture.js`         |
| **Mock Objects**      | `*.mock.js`             | `logger.mock.js`          |

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual components in isolation

```javascript
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import { expect } from "chai";

describe("Component Name", () => {
  let mockDependency;

  beforeEach(() => {
    mockDependency = {
      method: mock.fn(),
    };
  });

  afterEach(() => {
    mockDependency.method.mock.reset();
  });

  it("should describe specific behavior", () => {
    // Arrange
    const input = "test input";

    // Act
    const result = componentUnderTest(input);

    // Assert
    expect(result).to.equal("expected output");
    expect(mockDependency.method.mock.callCount()).to.equal(1);
  });
});
```

### 2. Integration Tests

**Purpose**: Test component interactions and system behavior

```javascript
import { describe, it, before, after } from "node:test";
import { expect } from "chai";

describe("Integration: Component System", () => {
  before(async () => {
    // Setup test environment
    await setupTestDatabase();
  });

  after(async () => {
    // Cleanup test environment
    await cleanupTestDatabase();
  });

  it("should handle complete workflow", async () => {
    // Test real component interactions
    const result = await systemUnderTest.process(realInput);
    expect(result).to.have.property("status", "success");
  });
});
```

### 3. Error Scenario Tests

**Purpose**: Verify error handling and edge cases

```javascript
describe("Error Scenarios", () => {
  it("should handle invalid input gracefully", () => {
    expect(() => {
      componentUnderTest(null);
    }).to.throw(/Invalid input/);
  });

  it("should handle dependency failures", async () => {
    mockDependency.method.mock.mockImplementation(() => {
      throw new Error("Dependency failure");
    });

    expect(() => {
      componentUnderTest("input");
    }).to.throw("Dependency failure");
  });
});
```

### 4. Contract Tests

**Purpose**: Validate that an adapter adheres to a defined port interface (for hexagonal compliance)

```javascript
describe("Adapter Contract", () => {
  it("should conform to LoggerPort interface", () => {
    const adapter = new WinstonLoggerAdapter();

    // Verify inheritance and interface compliance
    expect(adapter).to.be.instanceOf(LoggerPort);

    // Verify all required methods exist and are functions
    expect(typeof adapter.error).to.equal("function");
    expect(typeof adapter.warn).to.equal("function");
    expect(typeof adapter.info).to.equal("function");
    expect(typeof adapter.debug).to.equal("function");
    expect(typeof adapter.http).to.equal("function");
    expect(typeof adapter.verbose).to.equal("function");
  });

  it("should implement method signatures correctly", () => {
    const adapter = new WinstonLoggerAdapter();

    // Test method signatures and behavior contracts
    expect(() => adapter.info("message")).to.not.throw();
    expect(() => adapter.info("message", {})).to.not.throw();
    expect(() => adapter.error("error", { context: {} })).to.not.throw();
  });

  it("should handle standard logging patterns", () => {
    const adapter = new WinstonLoggerAdapter();

    // Verify contract behavior expectations
    expect(() => {
      adapter.info("test message");
      adapter.error("test error", { userId: "123" });
      adapter.debug("debug info", { trace: true });
    }).to.not.throw();
  });
});
```

## Testing Patterns

### 1. Arrange-Act-Assert (AAA)

```javascript
it("should process user data correctly", () => {
  // Arrange: Setup test data and dependencies
  const userData = { name: "John", email: "john@example.com" };
  const mockValidator = { validate: mock.fn(() => true) };

  // Act: Execute the code under test
  const result = processUser(userData, mockValidator);

  // Assert: Verify the results
  expect(result).to.have.property("processed", true);
  expect(mockValidator.validate.mock.callCount()).to.equal(1);
});
```

### 2. Test Isolation

```javascript
describe("Component Tests", () => {
  let component;
  let mockDependencies;

  beforeEach(() => {
    // Fresh setup for each test
    mockDependencies = {
      service: mock.fn(),
      repository: mock.fn(),
    };
    component = new Component(mockDependencies);
  });

  afterEach(() => {
    // Clean up after each test
    mockDependencies.service.mock.reset();
    mockDependencies.repository.mock.reset();
  });
});
```

### 3. Descriptive Test Names

```javascript
// ✅ Good: Describes behavior and expected outcome
it("should merge default context with per-call context");
it("should throw error when required dependencies are missing");
it("should sanitize sensitive data in log output");

// ❌ Bad: Vague or implementation-focused
it("should work");
it("should call method");
it("should return true");
```

### 4. Mock Usage Patterns

```javascript
import { mock } from "node:test";

describe("Mock Patterns", () => {
  let mockService;

  beforeEach(() => {
    mockService = {
      // Simple mock function
      simpleMethod: mock.fn(),

      // Mock with return value
      methodWithReturn: mock.fn(() => "mocked result"),

      // Mock with implementation
      complexMethod: mock.fn((input) => ({ processed: input })),

      // Mock that throws
      errorMethod: mock.fn(() => {
        throw new Error("Mocked error");
      }),
    };
  });

  afterEach(() => {
    // Always reset mocks
    Object.values(mockService).forEach((mockFn) => {
      if (mockFn.mock) mockFn.mock.reset();
    });
  });

  it("should verify mock interactions", () => {
    // Use the mock
    const result = serviceUnderTest.process("input", mockService);

    // Verify call count
    expect(mockService.simpleMethod.mock.callCount()).to.equal(1);

    // Verify call arguments
    const call = mockService.simpleMethod.mock.calls[0];
    expect(call.arguments[0]).to.equal("input");

    // Verify context (this binding)
    expect(call.this).to.equal(mockService);
  });
});
```

## Assertion Standards

### 1. Specific Assertions

```javascript
// ✅ Preferred: Specific and descriptive
expect(result).to.have.property("status", "success");
expect(result.data).to.be.an("array");
expect(result.data).to.have.length(3);

// ❌ Avoid: Generic and uninformative
expect(result).to.be.ok;
expect(result).to.exist;
```

### 2. Error Assertions

```javascript
// ✅ Test specific error messages
expect(() => {
  invalidOperation();
}).to.throw(/Invalid input provided/);

// ✅ Test error types
expect(() => {
  invalidOperation();
}).to.throw(ValidationError);

// ✅ Test async errors
await expect(asyncOperation()).to.be.rejectedWith("Expected error");
```

### 3. Deep Equality

```javascript
// ✅ Use deep equality for objects
expect(result.context).to.deep.equal({
  service: "test-service",
  module: "auth",
  feature: "login",
});

// ✅ Use array membership tests
expect(result.methods).to.have.members(["info", "error", "warn"]);
```

## Architecture Testing

### 1. Hexagonal Architecture Compliance

```javascript
describe("Hexagonal Architecture Compliance", () => {
  it("should implement port interface correctly", () => {
    const adapter = new ConcreteAdapter();
    expect(adapter).to.be.instanceOf(Port);

    // Verify all required port methods are implemented
    const portMethods = ["method1", "method2", "method3"];
    portMethods.forEach((method) => {
      expect(adapter).to.have.property(method);
      expect(typeof adapter[method]).to.equal("function");
    });
  });

  it("should conform to port contract behavior", () => {
    const adapter = new ConcreteAdapter();

    // Test contract behavior - not just method presence
    expect(() => adapter.method1("input")).to.not.throw();
    expect(adapter.method1("test")).to.be.a("string"); // Expected return type

    // Verify method signatures match port definition
    expect(adapter.method1.length).to.equal(1); // Expected parameter count
  });

  it("should accept dependency injection", () => {
    const mockDependency = { process: mock.fn() };
    const service = new DomainService(mockDependency);

    expect(service.dependency).to.equal(mockDependency);
  });

  it("should enforce interface contracts using abstract base classes", () => {
    // Abstract classes provide stronger contract checking
    expect(() => {
      new AbstractPort(); // Should be instantiable for inheritance
    }).to.not.throw();

    expect(() => {
      const port = new AbstractPort();
      port.abstractMethod(); // Should throw if not implemented
    }).to.throw(/must be implemented by subclass/);
  });
});
```

**💡 Best Practices for Contract Testing:**

- Use abstract base classes or symbols to define interfaces for stronger contract checking
- Test behavior contracts, not just method presence
- Verify method signatures match expected port definitions
- Ensure adapters handle standard use cases without throwing unexpected errors
- Consider using TypeScript interfaces for compile-time contract validation

### 2. SOLID Principles Testing

```javascript
describe("SOLID Principles", () => {
  it("should follow Single Responsibility Principle", () => {
    // Test that component has one clear purpose
    const component = new Component();
    expect(component.primaryMethod).to.exist;
    expect(component).to.not.have.property("unrelatedMethod");
  });

  it("should support Open/Closed Principle", () => {
    // Test extensibility without modification
    class ExtendedComponent extends BaseComponent {
      newFeature() {
        return "extended";
      }
    }

    const extended = new ExtendedComponent();
    expect(extended.baseMethod).to.exist;
    expect(extended.newFeature()).to.equal("extended");
  });
});
```

## Test Configuration

### 1. Package.json Scripts

```json
{
  "scripts": {
    "test": "node --test --test-reporter spec",
    "test:watch": "node --test --watch --test-reporter spec",
    "test:coverage": "c8 node --test --test-reporter spec",
    "test:unit": "node --test tests/unit/ --test-reporter spec",
    "test:integration": "node --test tests/integration/ --test-reporter spec"
  }
}
```

### 2. ESM Configuration

```javascript
// All test files should use ESM imports
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import { expect } from "chai";

// Use proper file extensions
import { Component } from "../../src/component.js";
import { helper } from "../shared/helpers/test.helper.js";
```

### 3. Environment Setup

```javascript
// At the top of test files that need environment setup
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.NODE_ENV = "test";
});

afterEach(() => {
  process.env = originalEnv;
});
```

## Coverage Standards

### Coverage Targets

| Type          | Minimum | Target | Critical |
| ------------- | ------- | ------ | -------- |
| **Overall**   | 80%     | 90%    | 95%      |
| **Functions** | 85%     | 95%    | 100%     |
| **Branches**  | 75%     | 85%    | 90%      |
| **Lines**     | 80%     | 90%    | 95%      |

### Coverage Commands

```bash
# Generate coverage report
npm run test:coverage

# Generate HTML coverage report
c8 --reporter=html node --test

# Check coverage thresholds
c8 check-coverage --lines 80 --functions 85 --branches 75
```

## Running Tests

### Development Workflow

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Run specific test file
node --test path/to/specific.test.js

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### CI/CD Integration

```bash
# CI script should run:
npm run test:coverage
c8 check-coverage --lines 80 --functions 85 --branches 75
```

**Note**: All tests should be **deterministic**, **fast**, and **side-effect-free** unless explicitly marked as integration or performance. Favor unit tests for domain logic and integration tests only for verifying contracts and adapters. Tests should be **isolated** - each test should run independently without relying on state from other tests.

## Best Practices

### 1. Test Organization

```javascript
describe("Component Name", () => {
  describe("Constructor", () => {
    it("should initialize with default values");
    it("should accept configuration options");
  });

  describe("Public Methods", () => {
    describe("methodName", () => {
      it("should handle valid input");
      it("should throw error for invalid input");
      it("should work with optional parameters");
    });
  });

  describe("Error Scenarios", () => {
    it("should handle network failures");
    it("should handle timeout conditions");
  });
});
```

### 2. Test Data Management

```javascript
// Use factories for test data
const createTestUser = (overrides = {}) => ({
  id: "test-123",
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});

// Use meaningful test data
const validUserData = createTestUser({
  name: "John Doe",
  email: "john.doe@example.com",
});

const invalidUserData = createTestUser({
  email: "invalid-email", // Missing @ symbol
});
```

### 3. Async Testing

```javascript
describe("Async Operations", () => {
  it("should handle promises correctly", async () => {
    const result = await asyncOperation();
    expect(result).to.have.property("success", true);
  });

  it("should handle promise rejections", async () => {
    await expect(failingOperation()).to.be.rejectedWith("Expected error");
  });

  it("should timeout appropriately", async () => {
    const promise = longRunningOperation();
    await expect(promise).to.be.rejectedWith("Timeout");
  });
});
```

### 4. Performance Testing

```javascript
describe("Performance", () => {
  it("should complete operation within time limit", async () => {
    const start = Date.now();
    await operation();
    const duration = Date.now() - start;

    expect(duration).to.be.below(100); // 100ms limit
  });

  it("should handle large datasets efficiently", () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ id: i }));
    const start = Date.now();

    const result = processLargeDataset(largeDataset);
    const duration = Date.now() - start;

    expect(result).to.have.length(10000);
    expect(duration).to.be.below(1000); // 1 second limit
  });
});
```

## Common Patterns

### 1. Testing Factory Functions

```javascript
describe("Factory Function", () => {
  it("should create instance with default configuration", () => {
    const instance = createInstance();
    expect(instance).to.have.property("config");
    expect(instance.config).to.deep.equal(DEFAULT_CONFIG);
  });

  it("should merge custom configuration", () => {
    const customConfig = { timeout: 5000 };
    const instance = createInstance(customConfig);
    expect(instance.config.timeout).to.equal(5000);
  });
});
```

### 2. Testing Event Emitters

```javascript
describe("Event Emitter", () => {
  it("should emit events correctly", (done) => {
    const emitter = new EventEmitter();

    emitter.on("test-event", (data) => {
      expect(data).to.have.property("message", "test");
      done();
    });

    emitter.emit("test-event", { message: "test" });
  });
});
```

### 3. Testing Middleware

```javascript
describe("Middleware", () => {
  it("should process request and call next", () => {
    const mockReq = { body: { data: "test" } };
    const mockRes = { status: mock.fn(), json: mock.fn() };
    const mockNext = mock.fn();

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext.mock.callCount()).to.equal(1);
    expect(mockRes.status.mock.callCount()).to.equal(0);
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Import/Export Errors

```bash
# Error: Cannot find module
# Solution: Use proper file extensions and paths
import { helper } from "./helper.js"; // ✅ Include .js
import { helper } from "./helper";    // ❌ Missing extension
```

#### 2. Mock Reset Issues

```javascript
// ❌ Forgetting to reset mocks
beforeEach(() => {
  mockService = { method: mock.fn() };
});

// ✅ Proper mock reset
afterEach(() => {
  mockService.method.mock.reset();
});
```

#### 3. Async Test Issues

```javascript
// ❌ Missing await
it("should handle async operation", () => {
  asyncOperation(); // Test might pass before operation completes
});

// ✅ Proper async handling
it("should handle async operation", async () => {
  await asyncOperation();
});
```

### Debugging Tests

```bash
# Run single test with debugging
node --inspect --test path/to/test.js

# Verbose output
node --test --test-reporter tap path/to/test.js

# Enable debug logging
DEBUG=* node --test path/to/test.js
```

## Team Guidelines

### 1. Code Review Checklist

- [ ] Tests follow naming conventions
- [ ] Tests use proper mocking patterns
- [ ] Mocks are reset in `afterEach`
- [ ] Tests cover happy path and error scenarios
- [ ] Assertions are specific and meaningful
- [ ] Tests are properly isolated
- [ ] Coverage meets minimum requirements

### 2. Adding New Tests

1. **Create test file**: Follow naming convention `*.test.js`
2. **Setup structure**: Use consistent `describe` blocks
3. **Write tests**: Follow AAA pattern
4. **Add mocks**: Use Node.js built-in mocks
5. **Clean up**: Implement proper teardown
6. **Verify coverage**: Run coverage report
7. **Document**: Add to relevant README if needed

### 3. Updating Tests

1. **Maintain compatibility**: Don't break existing tests unnecessarily
2. **Update documentation**: Keep README files current
3. **Run full suite**: Ensure all tests still pass
4. **Check coverage**: Verify coverage doesn't decrease

## Testing Discipline & Quality Oversight

### Code Quality Gates

**Pre-commit Requirements:**

- [ ] All tests pass with zero failures
- [ ] Code coverage meets minimum thresholds
- [ ] No mock leakage between tests
- [ ] All tests are deterministic (no flaky tests)
- [ ] Test names describe behavior, not implementation

**Architecture Compliance:**

- [ ] Hexagonal architecture principles are maintained
- [ ] Port/adapter contracts are properly tested
- [ ] Domain logic is isolated from infrastructure concerns
- [ ] Dependency injection is correctly implemented

### Team Collaboration Standards

**Test Ownership:**

- Each developer owns the tests for their features
- Test failures must be addressed immediately
- No bypassing failing tests in CI/CD pipeline
- Regular test maintenance and cleanup

**Documentation Requirements:**

- Complex test scenarios must include inline comments
- Non-obvious test setups require explanation
- Update component README.md when test patterns change
- Document any testing workarounds or known limitations

### Continuous Improvement

**Monthly Test Review:**

- Analyze test execution times and optimize slow tests
- Review test coverage reports for gaps
- Identify and eliminate redundant test cases
- Update testing standards based on lessons learned

**Knowledge Sharing:**

- Share effective testing patterns in team reviews
- Document discovered testing anti-patterns
- Maintain examples of good test implementations
- Regular training on new testing techniques

## Resources

### Documentation

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Chai Assertion Library](https://www.chaijs.com/api/)
- [C8 Coverage Tool](https://github.com/bcoe/c8)
- [ESM Modules](https://nodejs.org/api/esm.html)

### Internal Resources

- [Logging Tests Example](./unit/infrastructure/logging/README.md)
- [Architecture ADR](../docs/architecture/)
- [Project Documentation](../README.md)

### External Resources

- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Hexagonal Architecture Testing](https://medium.com/@yecaicedo/structuring-a-node-js-project-with-hexagonal-architecture-7be2ef1364e2)
- [Modern JavaScript Testing](https://infosecwriteups.com/mastering-clean-code-in-node-js-with-hexagonal-architecture-ports-adapters-e3a343a8c649)

---

**Remember**: Good tests are an investment in code quality, team productivity, and system reliability. Write tests that are clear, reliable, and maintainable.

_Last updated: December 2024_
