# Error System Architecture

## Overview

The admin-service implements a sophisticated error handling system built around a `BaseError` class that provides automatic caller detection and consistent error properties across the entire application.

## Architecture

### BaseError Class

The `BaseError` class extends Node.js `Error` and provides:

- **Automatic Caller Detection**: Parses stack traces to identify the component and operation that threw the error
- **Consistent Properties**: All errors have `component`, `operation`, `details`, and `name` properties
- **Manual Override Support**: Allows manual specification of component/operation when needed
- **Extensibility**: Easy to create new error types by extending BaseError

### Error Hierarchy

```
Error (Node.js)
└── BaseError
    ├── ConfigurationError
    ├── ValidationError
    ├── BusinessLogicError
    ├── NotImplementedError
    └── [Custom Error Types...]
```

## Usage

### Basic Usage

```javascript
import { ConfigurationError } from "../shared/errors/index.js";

class DatabaseService {
  connect() {
    throw new ConfigurationError("Database connection failed", {
      details: {
        host: "localhost",
        port: 5432,
        database: "admin_db",
      },
    });
  }
}
```

**Result:**

```javascript
{
  name: "ConfigurationError",
  message: "Database connection failed",
  component: "databaseservice",
  operation: "connect",
  details: {
    host: "localhost",
    port: 5432,
    database: "admin_db"
  },
  stack: "..."
}
```

### Manual Override

```javascript
throw new ConfigurationError("Custom error", {
  component: "custom-component",
  operation: "custom-operation",
  details: { customData: "value" },
});
```

### Custom Stack Depth

```javascript
function outerFunction() {
  return innerFunction();
}

function innerFunction() {
  // Use depth 2 to get outerFunction instead of innerFunction
  throw new ConfigurationError("Error", { stackDepth: 2 });
}
```

## Error Types

### ConfigurationError

Used for configuration-related failures (missing config, invalid settings, etc.).

```javascript
throw new ConfigurationError("Invalid configuration", {
  details: {
    setting: "database.timeout",
    value: "invalid",
    expected: "number",
  },
});
```

### ValidationError

Used for data validation failures with field-specific information.

```javascript
throw new ValidationError("Invalid email format", {
  field: "email",
  value: "invalid-email",
  rule: "email-format",
  details: { pattern: "/^[^@]+@[^@]+.[^@]+$/" },
});
```

### BusinessLogicError

Used for business rule violations.

```javascript
throw new BusinessLogicError("Maximum users exceeded", {
  businessRule: "max-users-limit",
  entityType: "User",
  entityId: "user-123",
  details: { currentCount: 1000, maxAllowed: 1000 },
});
```

### NotImplementedError

Used for abstract methods and unimplemented functionality in ports/adapters.

```javascript
throw new NotImplementedError(
  'Method "process" must be implemented by subclass',
  {
    methodName: "process",
    interfaceName: "ProcessorPort",
    className: "ConcreteProcessor",
    details: {
      expectedSignature: "process(data: Object): Promise<Result>",
      documentation: "See ProcessorPort interface documentation",
    },
  }
);
```

## Creating Custom Error Types

```javascript
import { BaseError } from "../shared/errors/BaseError.js";

class NetworkError extends BaseError {
  constructor(message, options = {}) {
    super(message, options);

    // Add network-specific properties
    this.statusCode = options.statusCode || null;
    this.url = options.url || null;
    this.method = options.method || null;
  }
}

export { NetworkError };
```

## Error Handling Patterns

### Polymorphic Handling

```javascript
try {
  // Some operation that might throw different error types
  performOperation();
} catch (error) {
  if (error instanceof BaseError) {
    // Handle all custom errors consistently
    logger.error(`${error.component}.${error.operation}: ${error.message}`, {
      details: error.details,
      errorType: error.name,
    });
  } else {
    // Handle unexpected errors
    logger.error("Unexpected error", { error: error.message });
  }
}
```

### Specific Type Handling

```javascript
try {
  validateUserData(userData);
} catch (error) {
  if (error instanceof ValidationError) {
    return {
      status: 400,
      error: "Validation failed",
      field: error.field,
      rule: error.rule,
    };
  } else if (error instanceof BusinessLogicError) {
    return {
      status: 422,
      error: "Business rule violation",
      rule: error.businessRule,
    };
  } else {
    throw error; // Re-throw unexpected errors
  }
}
```

## Automatic Caller Detection

The system automatically detects the caller context from stack traces:

### Class Methods

```javascript
class UserService {
  createUser() {
    throw new ValidationError("Invalid user data");
    // Detected: component="userservice", operation="createUser"
  }
}
```

### Static Methods

```javascript
class UserFactory {
  static createUser() {
    throw new ConfigurationError("Factory error");
    // Detected: component="userfactory", operation="createUser"
  }
}
```

### Regular Functions

```javascript
function processData() {
  throw new BusinessLogicError("Processing failed");
  // Detected: component="processdata", operation="function-call"
}
```

## Integration with Logger Factory

The error system integrates seamlessly with the logger factory:

```javascript
import { createLoggerFactory } from "../infrastructure/logging/logger.factory.js";
import { ConfigurationError } from "../shared/errors/index.js";

export function createLogger(adapter) {
  if (!adapter) {
    throw new ConfigurationError("Logger adapter required", {
      details: {
        receivedType: typeof adapter,
        expectedType: "LoggerPort",
      },
    });
  }

  return createLoggerFactory(
    { context: { service: "admin-service" } },
    adapter,
    ["info", "error", "warn", "debug"]
  );
}
```

## Best Practices

### 1. Use Appropriate Error Types

- `ConfigurationError`: Missing config, invalid settings, setup failures
- `ValidationError`: Data validation, input validation, schema violations
- `BusinessLogicError`: Domain rule violations, business constraints
- `NotImplementedError`: Abstract methods, unimplemented port/adapter methods
- Custom errors: Domain-specific error scenarios

### 2. Provide Meaningful Details

```javascript
// Good
throw new ValidationError("Email validation failed", {
  field: "email",
  value: userInput.email,
  rule: "email-format",
  details: { pattern: "/^[^@]+@[^@]+.[^@]+$/" },
});

// Avoid
throw new ValidationError("Invalid email");
```

### 3. Use Manual Override When Needed

```javascript
// When automatic detection isn't sufficient
throw new ConfigurationError("Database setup failed", {
  component: "database-initializer",
  operation: "setup-connection-pool",
});
```

### 4. Handle Errors at Appropriate Levels

- **Domain Layer**: Throw business logic and validation errors
- **Application Layer**: Handle and transform errors for use cases
- **API Layer**: Convert errors to HTTP responses
- **Infrastructure Layer**: Throw configuration and technical errors

## Testing

The error system includes comprehensive tests:

- `BaseError.test.js`: Tests base functionality and inheritance
- `ConfigurationError.test.js`: Tests configuration error specifics
- `ErrorSystem.test.js`: Tests integration and polymorphic behavior

### Example Test

```javascript
it("should auto-detect caller context", () => {
  class TestService {
    performAction() {
      throw new ConfigurationError("Test error");
    }
  }

  const service = new TestService();

  try {
    service.performAction();
  } catch (error) {
    expect(error.component).to.equal("testservice");
    expect(error.operation).to.equal("performAction");
  }
});
```

## Benefits

1. **Consistency**: All errors follow the same pattern
2. **Debuggability**: Automatic caller detection provides context
3. **Maintainability**: Single place to update error behavior
4. **Extensibility**: Easy to add new error types
5. **Type Safety**: Proper inheritance hierarchy
6. **Integration**: Works seamlessly with logging and monitoring systems
