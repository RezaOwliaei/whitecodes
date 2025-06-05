# Logging Subsystem Unit Tests

This directory contains comprehensive unit tests for the logging subsystem using Node.js built-in test runner and Chai assertion library.

## Overview

The logging subsystem tests provide maximum coverage of all logging components, ensuring reliability, correctness, and adherence to the adapter pattern architecture.

## Test Structure

```
admin-service/tests/unit/infrastructure/logging/
├── README.md                           # This documentation
├── test-runner.js                      # Test execution runner
├── logger.port.test.js                 # LoggerPort abstract class tests
├── logger.factory.test.js              # Logger factory tests
├── logger-methods.test.js              # Logger methods constants tests
├── logger-levels.test.js               # Logger levels and colors tests
├── winston-logger-formats.test.js      # Winston formatter tests
├── pino-logger-formatters.test.js      # Pino formatter tests
├── winston-logger.adapter.test.js      # Winston adapter tests
├── pino-logger.adapter.test.js         # Pino adapter tests
└── logger.test.js                      # Main logger entry point tests
```

## Test Coverage

### Component Coverage

| Component           | File                             | Coverage Areas                                   |
| ------------------- | -------------------------------- | ------------------------------------------------ |
| **LoggerPort**      | `logger.port.test.js`            | Abstract class behavior, method inheritance      |
| **Logger Factory**  | `logger.factory.test.js`         | Context merging, method wrapping, error handling |
| **Logger Methods**  | `logger-methods.test.js`         | Method arrays, immutability, validation          |
| **Logger Levels**   | `logger-levels.test.js`          | Level priorities, color mappings, consistency    |
| **Winston Formats** | `winston-logger-formats.test.js` | Console/JSON formatting, sanitization            |
| **Pino Formatters** | `pino-logger-formatters.test.js` | Level/log formatting, timestamps                 |
| **Winston Adapter** | `winston-logger.adapter.test.js` | LoggerPort implementation, method mapping        |
| **Pino Adapter**    | `pino-logger.adapter.test.js`    | LoggerPort implementation, method mapping        |
| **Main Logger**     | `logger.test.js`                 | Entry point, adapter selection, configuration    |

### Functional Coverage

- ✅ **Adapter Pattern Implementation**: All adapters implement LoggerPort correctly
- ✅ **Context Management**: Default and per-call context merging
- ✅ **Method Wrapping**: Factory wraps only specified methods
- ✅ **Error Handling**: Graceful handling of missing methods, circular references
- ✅ **Configuration**: Adapter selection and service name configuration
- ✅ **Formatting**: Log formatting and sanitization for both adapters
- ✅ **Immutability**: Constants and configurations are immutable
- ✅ **JSDoc Compliance**: Parameters and return types match documentation

## Prerequisites

### Node.js Version

- **Node.js 18+** (required for built-in test runner)

### Dependencies

```bash
npm install chai
```

**Note**: No additional mocking libraries needed - Node.js built-in `mock` is used for all mocking functionality.

## Running Tests

### Run All Tests

```bash
# Run all tests (auto-discovers *.test.js files)
npm test

# Watch mode (reruns on file changes)
npm run test:watch

# Run only logging tests
npm run test:logging

# Run with coverage
npm run test:coverage

# Run specific test file
node --test logger.factory.test.js
```

### Native Test Runner Features

- **Automatic Discovery**: Finds all `*.test.js` files automatically
- **Spec Reporter**: Clean, readable test output format
- **Watch Mode**: Automatic re-runs on file changes
- **Built-in Mocking**: `mock.fn()`, `mock.method()`, `mock.module()` support
- **Call Tracking**: Automatic capture of function calls, arguments, and context
- **Async Support**: Native async/await and Promise handling
- **Performance**: Fast execution with minimal overhead

### Example Output

```
▶ LoggerPort
  ✔ Abstract class behavior > should throw error when error method is called (0.5ms)
  ✔ Abstract class behavior > should throw error when warn method is called (0.3ms)
  ✔ Abstract class behavior > should throw error when info method is called (0.2ms)
  ✔ Abstract class behavior > should throw error when http method is called (0.2ms)
  ✔ Abstract class behavior > should throw error when verbose method is called (0.3ms)
  ✔ Abstract class behavior > should throw error when debug method is called (0.2ms)
▶ LoggerPort (1.7ms)

▶ Logger Factory
  ✔ Context merging > should merge default and per-call context (1.2ms)
  ✔ Method wrapping > should wrap all provided methods (0.8ms)
  ✔ Error handling > should throw error for missing methods (0.4ms)
▶ Logger Factory (2.4ms)

...

ℹ tests 247
ℹ suites 10
ℹ pass 247
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 156.78
```

## Test Categories

### 1. Unit Tests

- **Scope**: Individual components in isolation
- **Mocking**: External dependencies mocked
- **Focus**: Pure function behavior, class methods, error handling

### 2. Integration Tests

- **Scope**: Component interactions
- **Dependencies**: Real adapter instances
- **Focus**: Context flow, factory integration, configuration

### 3. Error Scenarios

- **Scope**: Edge cases and error conditions
- **Coverage**: Missing methods, circular references, invalid inputs
- **Focus**: Graceful degradation and error propagation

## Key Test Patterns

### Mock Creation

```javascript
// Mock adapter using Node.js built-in mocks
import { mock } from "node:test";

const mockAdapter = {
  info: mock.fn(),
  error: mock.fn(),
  warn: mock.fn(),
  debug: mock.fn(),
};

// Access call information
expect(mockAdapter.info.mock.callCount()).to.equal(1);
const call = mockAdapter.info.mock.calls[0];
expect(call.arguments[0]).to.equal("test message");
expect(call.this).to.equal(mockAdapter);

// Reset mocks for test isolation
afterEach(() => {
  mockAdapter.info.mock.reset();
  mockAdapter.error.mock.reset();
  mockAdapter.warn.mock.reset();
  mockAdapter.debug.mock.reset();
});
```

### Context Testing

```javascript
// Test context merging
const logger = createLoggerFactory(
  { context: { service: "test-service", module: "auth" } },
  mockAdapter,
  ["info"]
);

logger.info("test message", {
  context: { feature: "login" },
  additionalData: "extra",
});

const call = mockAdapter.info.mock.calls[0];
expect(call.arguments[1].context).to.deep.equal({
  service: "test-service",
  module: "auth",
  feature: "login",
});
```

### Error Handling

```javascript
// Test missing methods
expect(() => {
  createLoggerFactory(
    { context: { service: "test-service" } },
    incompleteAdapter,
    ["info", "error", "missing"]
  );
}).to.throw(/Logger adapter missing required methods: missing/);
```

## Architecture Compliance

### Hexagonal Architecture

- ✅ **Port/Adapter Pattern**: LoggerPort defines contract, adapters implement
- ✅ **Dependency Inversion**: Factory accepts adapter instances
- ✅ **Isolation**: Domain logic isolated from logging infrastructure

### Design Patterns

- ✅ **Factory Pattern**: Centralized logger creation
- ✅ **Adapter Pattern**: Uniform interface for different loggers
- ✅ **Strategy Pattern**: Pluggable adapter selection

### SOLID Principles

- ✅ **Single Responsibility**: Each component has single purpose
- ✅ **Open/Closed**: Extensible for new adapters
- ✅ **Liskov Substitution**: Adapters interchangeable
- ✅ **Interface Segregation**: LoggerPort focused interface
- ✅ **Dependency Inversion**: Depend on abstractions

## Test Maintenance

### Adding New Tests

1. Create test file following naming convention: `component.test.js`
2. Import required modules and test utilities
3. Use descriptive test names and organize with `describe` blocks
4. Include setup/teardown in `beforeEach`/`afterEach`
5. Test both happy path and error scenarios

### Updating Tests

- Update tests when component interfaces change
- Maintain backward compatibility testing
- Add regression tests for bugs
- Keep test documentation current

### Performance Considerations

- Tests run in isolation with fresh imports
- Mock heavy dependencies to maintain speed
- Use appropriate timeouts for async operations
- Clean up resources in teardown

## Troubleshooting

### Common Issues

#### Import Errors

```bash
Error: Cannot find module 'chai'
```

**Solution**: Install dependencies with `npm install chai`

#### Test Timeout

```bash
Test timed out after 30000ms
```

**Solution**: Check for unresolved promises or increase timeout

#### Path Resolution

```bash
Error: Cannot resolve module './logger.js'
```

**Solution**: Verify file paths relative to test directory

### Debug Mode

```bash
# Run with debug output
NODE_OPTIONS="--inspect" node test-runner.js

# Run single test with verbose output
node --test --test-reporter=tap logger.factory.test.js
```

## Best Practices

### Test Writing

- **Descriptive Names**: Use clear, behavior-focused test names
- **Arrange-Act-Assert**: Structure tests clearly
- **Isolation**: Each test should be independent
- **Mock Reset**: Always reset mocks between tests using `mock.reset()`
- **Edge Cases**: Test boundary conditions and error scenarios

### Assertions

```javascript
// Prefer specific assertions
expect(result).to.have.property("level", "info");

// Over generic ones
expect(result).to.be.ok;
```

### Mocking

```javascript
// Use Node.js built-in mocks
import { mock } from "node:test";

const mockAdapter = {
  info: mock.fn(),
  error: mock.fn(),
};

// Verify behavior, not implementation
expect(mockAdapter.info.mock.callCount()).to.equal(1);
expect(mockAdapter.info.mock.calls[0].arguments).to.deep.equal([
  "message",
  meta,
]);
```

## Contributing

### Test Standards

- All new components must have corresponding unit tests
- Minimum 90% code coverage for new features
- Tests must pass before merging
- Include both positive and negative test cases

### Code Review

- Review test coverage and edge cases
- Verify test names are descriptive
- Check for potential flaky tests
- Ensure mocks are appropriate

## Related Documentation

- [Logging ADR](../../docs/architecture/adr-logging.md) - Architecture decisions
- [Logger Configuration](../../src/shared/configs/logger.config.js) - Configuration options
- [Logger Usage Examples](../../src/infrastructure/logging/README.md) - Implementation examples

## Metrics

### Test Statistics

- **Total Test Files**: 9
- **Estimated Test Count**: 200+
- **Coverage Areas**: 9 major components
- **Test Categories**: Unit, Integration, Error scenarios

### Performance

- **Execution Time**: ~10-30 seconds (depending on hardware)
- **Memory Usage**: Minimal (isolated test runs)
- **Parallelization**: Sequential for output clarity

---

_This test suite ensures the logging subsystem maintains high quality, reliability, and architectural integrity._
