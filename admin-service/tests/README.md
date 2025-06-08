# Testing Standards and Guidelines

This document outlines the testing standards, patterns, and practices for the admin-service project. Follow these guidelines to ensure consistency, reliability, and maintainability across all test suites.

## Overview

Our testing strategy focuses on **proportional coverage**, **architectural compliance where relevant**, and **developer experience**. We use modern Node.js testing tools and patterns that align with our hexagonal architecture and ESM-first approach.

**Key principle: Test complexity should match code complexity.**

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

## Test Scope and Proportionality

### Right-Sizing Your Tests for DDD/CQRS/Event Sourcing Architecture

**The most important principle: Match test complexity to architectural layer and responsibility.**

This admin-service follows **Domain-Driven Design (DDD)**, **CQRS**, **Event Sourcing**, and **Hexagonal Architecture** patterns. Testing strategy must align with these architectural decisions (see `docs/architecture/` for full ADRs).

| Architectural Layer      | Test Scope                              | Example Components                           |
| ------------------------ | --------------------------------------- | -------------------------------------------- |
| **Domain Layer**         | Pure business logic + invariant testing | Aggregates, Entities, Value Objects, Events  |
| **Application Layer**    | Use case orchestration + mocking        | Command/Query handlers, Application services |
| **API Layer**            | HTTP contract + validation testing      | Controllers, DTOs, Validators, Middleware    |
| **Infrastructure Layer** | Adapter contracts + integration testing | Repository adapters, Event stores, Loggers   |
| **Shared/Utils**         | Behavior + edge case testing            | Factories, Utilities, Constants, Configs     |

### Architectural Testing Matrix

| Component Type                | Test Focus                                   | Coverage Level   | Example                                |
| ----------------------------- | -------------------------------------------- | ---------------- | -------------------------------------- |
| **Domain Aggregates**         | Business rules + invariants + event emission | Comprehensive    | AdminAggregate, UserAggregate          |
| **Domain Entities**           | Identity + lifecycle + business behavior     | Comprehensive    | Admin entity, User entity              |
| **Value Objects**             | Immutability + validation + equality         | Full scenarios   | Email, Password, AdminId, Status       |
| **Domain Events**             | Structure + immutability + serialization     | Contract focused | AdminCreated, AdminUpdated events      |
| **Domain Services**           | Cross-aggregate business logic               | Comprehensive    | AdminDomainService                     |
| **Invariants**                | Business rule enforcement                    | Edge cases       | Password policies, Email validation    |
| **Command Handlers**          | Use case orchestration + side effects        | Behavior + mocks | CreateAdminHandler, UpdateAdminHandler |
| **Query Handlers**            | Data retrieval + projection logic            | Behavior + mocks | GetAdminHandler, ListAdminsHandler     |
| **API Controllers**           | HTTP mapping + error handling                | Contract focused | AdminController endpoints              |
| **Repository Contracts**      | Interface compliance + error handling        | Contract + edge  | AdminRepository port/adapter           |
| **Event Store Adapters**      | Event persistence + replay + versioning      | Integration      | KurrentDB adapter, MongoDB adapter     |
| **Infrastructure Components** | Adapter behavior + error handling            | Comprehensive    | Logger factory, Message handlers       |
| **DTOs/Commands/Queries**     | Structure + validation + serialization       | Data contracts   | CreateAdminCommand, AdminQuery         |
| **API Validators**            | Input shape + format + security validation   | Security focused | Joi/Zod validators                     |
| **Simple Config/Constants**   | Basic structure + key behavior               | Minimal          | Static objects, enums, mappings        |

### ⚠️ **Avoid Over-Engineering**

```javascript
// ❌ OVER-ENGINEERED: 289 lines of tests for 11 lines of static config
describe("Static Color Config", () => {
  // 50+ tests for simple object...
});

// ✅ RIGHT-SIZED: 42 lines of tests for 11 lines of static config
describe("Static Color Config", () => {
  // Structure, basic validation, key behavior only
});
```

**Ask yourself:**

- 📊 **What's the code's responsibility level?** (Infrastructure vs. simple config)
- 🎯 **Am I testing implementation details or behavior?** (Focus on behavior)
- 🔧 **What's the blast radius if this breaks?** (Critical infrastructure needs more tests)
- ⚖️ **Is the testing effort proportional to the risk?** (Consider impact and complexity)
- 🏗️ **Does this code have multiple responsibilities?** (Factories, wrappers, adapters often do)

### DDD/CQRS/Event Sourcing Testing Decision Tree

```
Which architectural layer does this belong to?

DOMAIN LAYER (admin-context/domain/*)
├─ Is it an Aggregate?
│   ├─ YES → Comprehensive business logic + invariant + event emission testing
│   └─ Example: AdminAggregate command methods, invariant enforcement, event production
├─ Is it an Entity?
│   ├─ YES → Identity + lifecycle + business behavior testing
│   └─ Example: Admin entity methods, state transitions, validation
├─ Is it a Value Object?
│   ├─ YES → Immutability + validation + equality + creation testing
│   └─ Example: Email, Password, AdminId - test all validation rules and edge cases
├─ Is it a Domain Event?
│   ├─ YES → Structure + immutability + serialization contract testing
│   └─ Example: AdminCreated, AdminUpdated - test event schema and metadata
├─ Is it a Domain Service?
│   ├─ YES → Cross-aggregate business logic + complex domain rules testing
│   └─ Example: AdminDomainService - test complex business orchestration
├─ Is it an Invariant?
│   ├─ YES → Business rule enforcement + edge case + security validation
│   └─ Example: Password policies, Email validation - test all rule variations
└─ Is it a Factory/Repository Interface?
    ├─ YES → Creation logic + interface contract testing
    └─ Example: AdminFactory, AdminRepository port - test object creation and contracts

APPLICATION LAYER (admin-context/application/*)
├─ Is it a Command Handler?
│   ├─ YES → Use case orchestration + side effect + error handling testing
│   └─ Example: CreateAdminHandler - test aggregate loading, command execution, persistence
├─ Is it a Query Handler?
│   ├─ YES → Data retrieval + projection + performance testing
│   └─ Example: GetAdminHandler - test query execution, data mapping, error handling
└─ Is it an Application Service?
    ├─ YES → Multi-aggregate coordination + transaction testing
    └─ Example: AdminApplicationService - test complex use case orchestration

API LAYER (admin-context/api/*)
├─ Is it a Controller?
│   ├─ YES → HTTP contract + error mapping + security testing
│   └─ Example: AdminController - test request/response mapping, status codes, auth
├─ Is it a DTO/Command/Query?
│   ├─ YES → Structure + validation + serialization contract testing
│   └─ Example: CreateAdminCommand - test data shape, validation rules, conversion
├─ Is it a Validator?
│   ├─ YES → Input validation + security + edge case testing
│   └─ Example: Joi/Zod validators - test all validation rules, malicious input, edge cases
└─ Is it Middleware?
    ├─ YES → Request processing + security + error handling testing
    └─ Example: Auth middleware - test authentication, authorization, error scenarios

INFRASTRUCTURE LAYER (infrastructure/*)
├─ Is it a Repository Adapter?
│   ├─ YES → Port contract + data mapping + error handling + integration testing
│   └─ Example: MongoAdminRepository - test CRUD operations, error handling, data consistency
├─ Is it an Event Store Adapter?
│   ├─ YES → Event persistence + replay + versioning + concurrency testing
│   └─ Example: KurrentDB adapter - test event storage, retrieval, stream handling
├─ Is it a Message Handler?
│   ├─ YES → Message processing + idempotency + error handling testing
│   └─ Example: Event handlers - test message consumption, processing, failure scenarios
└─ Is it an Infrastructure Component?
    ├─ YES → Adapter behavior + configuration + error handling testing
    └─ Example: Logger factory, HTTP client - test component behavior, config, failures

SHARED/UTILITIES
├─ Is it a simple config/constant?
│   ├─ YES → Basic structure + key validation + security boundaries
│   └─ Example: Status codes, color mappings - minimal testing focused on structure
└─ Is it a utility function?
    ├─ YES → Input/output + edge case + security validation testing
    └─ Example: Date formatters, ID generators - test behavior and edge cases
```

**💡 Critical Insight**: **Architectural layer determines testing complexity** - Domain logic needs comprehensive business rule testing, while infrastructure needs contract compliance and error handling.

### Domain Layer Testing Examples

#### Testing Domain Aggregates (Comprehensive Business Logic)

```javascript
// ✅ COMPREHENSIVE: Domain aggregate with business rules, invariants, and events
describe("AdminAggregate", () => {
  describe("createAdmin command", () => {
    it("should create admin with valid data and emit AdminCreated event", () => {
      // Test: Business logic + invariant enforcement + event emission
      const adminId = new AdminId("admin-123");
      const email = new Email("admin@example.com");
      const password = new Password("SecurePass123!");

      const events = AdminAggregate.createAdmin(adminId, email, password);

      expect(events).to.have.length(1);
      expect(events[0]).to.be.instanceOf(AdminCreated);
      expect(events[0].aggregateId).to.equal(adminId.value);
    });

    it("should enforce password policy invariant", () => {
      // Test: Business rule enforcement
      const adminId = new AdminId("admin-123");
      const email = new Email("admin@example.com");
      const weakPassword = new Password("weak"); // Should fail validation

      expect(() => {
        AdminAggregate.createAdmin(adminId, email, weakPassword);
      }).to.throw(PasswordPolicyViolation);
    });

    it("should prevent duplicate admin creation", () => {
      // Test: Business invariant
      const existingAdmin = AdminAggregate.fromEvents([
        new AdminCreated({
          aggregateId: "admin-123",
          email: "admin@example.com",
        }),
      ]);

      expect(() => {
        existingAdmin.createAdmin(/* same data */);
      }).to.throw(AdminAlreadyExistsError);
    });
  });
});
```

#### Testing Value Objects (Immutability + Validation)

```javascript
// ✅ COMPREHENSIVE: Value object with validation and business rules
describe("Email Value Object", () => {
  it("should create valid email", () => {
    const email = new Email("user@example.com");
    expect(email.value).to.equal("user@example.com");
  });

  it("should be immutable", () => {
    const email = new Email("user@example.com");
    expect(() => {
      email.value = "hacker@evil.com";
    }).to.throw();
  });

  it("should validate email format", () => {
    expect(() => new Email("invalid-email")).to.throw(InvalidEmailError);
    expect(() => new Email("@example.com")).to.throw(InvalidEmailError);
    expect(() => new Email("user@")).to.throw(InvalidEmailError);
  });

  it("should implement equality correctly", () => {
    const email1 = new Email("user@example.com");
    const email2 = new Email("user@example.com");
    const email3 = new Email("other@example.com");

    expect(email1.equals(email2)).to.be.true;
    expect(email1.equals(email3)).to.be.false;
  });
});
```

### Application Layer Testing Examples

#### Testing Command Handlers (Use Case Orchestration)

```javascript
// ✅ COMPREHENSIVE: Command handler with mocking and side effects
describe("CreateAdminHandler", () => {
  let mockAdminRepository;
  let mockEventStore;
  let handler;

  beforeEach(() => {
    mockAdminRepository = {
      findById: mock.fn(),
      save: mock.fn()
    };
    mockEventStore = {
      saveEvents: mock.fn()
    };
    handler = new CreateAdminHandler(mockAdminRepository, mockEventStore);
  });

  it("should create admin and persist events", async () => {
    // Arrange: Mock dependencies
    mockAdminRepository.findById.mock.mockResolvedValue(null); // Admin doesn't exist
    mockEventStore.saveEvents.mock.mockResolvedValue();

    const command = new CreateAdminCommand({
      adminId: "admin-123",
      email: "admin@example.com",
      password: "SecurePass123!"
    });

    // Act: Execute use case
    await handler.handle(command);

    // Assert: Verify orchestration
    expect(mockAdminRepository.findById.mock.callCount()).to.equal(1);
    expect(mockEventStore.saveEvents.mock.callCount()).to.equal(1);
    const savedEvents = mockEventStore.saveEvents.mock.calls[0].arguments[0];
    expect(savedEvents[0]).to.be.instanceOf(AdminCreated);
  });

  it("should handle duplicate admin error", async () => {
    // Test: Business rule enforcement at application layer
    mockAdminRepository.findById.mock.mockResolvedValue(
      AdminAggregate.fromEvents([new AdminCreated({...})])
    );

    const command = new CreateAdminCommand({...});

    await expect(handler.handle(command))
      .to.be.rejectedWith(AdminAlreadyExistsError);
  });
});
```

### Infrastructure Layer Testing Examples

#### Testing Repository Adapters (Contract Compliance)

```javascript
// ✅ COMPREHENSIVE: Repository adapter with contract compliance
describe("MongoAdminRepository", () => {
  let repository;
  let mockMongoCollection;

  beforeEach(() => {
    mockMongoCollection = {
      findOne: mock.fn(),
      insertOne: mock.fn(),
      updateOne: mock.fn(),
    };
    repository = new MongoAdminRepository(mockMongoCollection);
  });

  it("should implement AdminRepository port contract", () => {
    // Test: Interface compliance
    expect(repository).to.be.instanceOf(AdminRepository);
    expect(typeof repository.findById).to.equal("function");
    expect(typeof repository.save).to.equal("function");
  });

  it("should map domain aggregate to MongoDB document", async () => {
    // Test: Data mapping
    const admin = AdminAggregate.fromEvents([
      new AdminCreated({
        aggregateId: "admin-123",
        email: "admin@example.com",
      }),
    ]);

    await repository.save(admin);

    expect(mockMongoCollection.insertOne.mock.callCount()).to.equal(1);
    const document = mockMongoCollection.insertOne.mock.calls[0].arguments[0];
    expect(document._id).to.equal("admin-123");
    expect(document.email).to.equal("admin@example.com");
  });

  it("should handle database connection errors", async () => {
    // Test: Error handling
    mockMongoCollection.findOne.mock.mockRejectedValue(
      new Error("Connection timeout")
    );

    await expect(repository.findById("admin-123")).to.be.rejectedWith(
      "Connection timeout"
    );
  });
});
```

**Key insight**: **Architectural responsibility determines testing scope** - not just line count.

### Classification Warning Signs

**🚨 Don't confuse these infrastructure patterns with simple config:**

| Pattern                    | Looks Like        | Actually Is             | Test Approach           |
| -------------------------- | ----------------- | ----------------------- | ----------------------- |
| **Factory Functions**      | Simple function   | Complex infrastructure  | Comprehensive scenarios |
| **Method Wrappers**        | Simple delegation | Context/behavior logic  | Full behavior testing   |
| **Configuration Builders** | Simple object     | Complex composition     | Scenario testing        |
| **Middleware**             | Simple function   | Request/response logic  | Full pipeline testing   |
| **Adapters**               | Simple wrapper    | Contract implementation | Contract compliance     |

**Ask: "What happens if this breaks?"**

- Simple config: Minor visual changes
- Infrastructure: System-wide failures

### Static Config Testing - Real Example

Here's a perfect example of proportional testing for **actual** static configurations:

```javascript
// ❌ OVER-ENGINEERED (289 lines for 11 lines of config)
describe("Logger Levels", () => {
  it("should have error as priority 0", () => {
    expect(logLevels.error).to.equal(0); // Brittle!
  });
  it("should have exactly 7 levels", () => {
    expect(Object.keys(logLevels)).to.have.length(7); // Brittle!
  });
  it("should have consecutive integers", () => {
    // Testing JavaScript language features...
  });
  // ... 20+ more tests
});

// ✅ RIGHT-SIZED (39 lines for 11 lines of config)
describe("Logger Levels", () => {
  it("should export logLevels as an object", () => {
    expect(logLevels).to.be.an("object"); // Essential structure
  });
  it("should have numeric priority values", () => {
    Object.values(logLevels).forEach((p) => expect(p).to.be.a("number")); // Essential type
  });
  it("should have unique priority values", () => {
    const priorities = Object.values(logLevels);
    expect(new Set(priorities).size).to.equal(priorities.length); // Essential constraint
  });
  it("should be immutable", () => {
    expect(() => {
      logLevels.new = 1;
    }).to.throw(); // Essential safety
  });
});
```

**Key insight**: Test exactly what can break functionality or security, nothing more.

### Security Considerations in Testing

Even simple configurations can have security implications that should be tested:

```javascript
// ✅ SECURITY-AWARE: Test configuration that affects security
describe("API Rate Limits Config", () => {
  it("should enforce reasonable rate limits", () => {
    expect(rateLimits.requestsPerMinute).to.be.at.most(1000); // Prevent DoS
    expect(rateLimits.requestsPerMinute).to.be.at.least(1); // Prevent lockout
  });

  it("should have secure default timeouts", () => {
    expect(timeouts.sessionTimeout).to.be.at.most(3600000); // Max 1 hour
    expect(timeouts.requestTimeout).to.be.at.most(30000); // Max 30 seconds
  });
});

describe("Logger Configuration", () => {
  it("should not expose sensitive data in logs", () => {
    const sensitiveFields = ["password", "token", "secret", "key"];
    expect(logConfig.excludeFields).to.include.members(sensitiveFields);
  });
});

// ✅ SECURITY-AWARE: Test input validation
describe("User Input Validator", () => {
  it("should reject potential XSS attempts", () => {
    const maliciousInput = '<script>alert("xss")</script>';
    expect(() => validateUserInput(maliciousInput)).to.throw(/Invalid input/);
  });

  it("should enforce maximum input length", () => {
    const oversizedInput = "a".repeat(10000);
    expect(() => validateUserInput(oversizedInput)).to.throw(/Too long/);
  });
});
```

**Security testing principles:**

- **Validate security boundaries** (rate limits, timeouts, input sizes)
- **Test sensitive data handling** (logging exclusions, sanitization)
- **Verify input validation** (XSS, injection prevention)
- **Check access controls** (authentication, authorization)
- **Test error disclosure** (no sensitive info in error messages)

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

**⚠️ Important**: **Don't over-test simple code**. Static configurations, simple constants, and basic utilities need minimal testing. Focus comprehensive testing on business logic, integrations, and complex workflows.

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

### 1. DDD/CQRS Architecture Code Review Checklist

#### Domain Layer Testing

- [ ] **Aggregates**: Business logic, invariants, and event emission thoroughly tested
- [ ] **Entities**: Identity, lifecycle, and behavior tested without infrastructure concerns
- [ ] **Value Objects**: Immutability, validation, and equality implemented and tested
- [ ] **Domain Events**: Structure, immutability, and schema contracts tested
- [ ] **Invariants**: Business rules tested with edge cases and security boundaries
- [ ] **Domain Services**: Cross-aggregate logic tested in isolation
- [ ] **No Infrastructure Dependencies**: Domain tests use no mocks for external systems

#### Application Layer Testing

- [ ] **Command Handlers**: Use case orchestration tested with proper mocking
- [ ] **Query Handlers**: Data retrieval and projection logic tested
- [ ] **Application Services**: Multi-aggregate coordination tested
- [ ] **Side Effects**: Event persistence and external service calls mocked and verified
- [ ] **Error Handling**: Domain exceptions properly caught and handled
- [ ] **Transaction Boundaries**: Aggregate consistency and event atomicity tested

#### API Layer Testing

- [ ] **Controllers**: HTTP contract testing (request/response mapping, status codes)
- [ ] **DTOs**: Data structure validation and serialization tested
- [ ] **Validators**: Input validation with security focus (XSS, injection, size limits)
- [ ] **Middleware**: Authentication, authorization, and request processing tested
- [ ] **Error Mapping**: Domain exceptions properly mapped to HTTP responses

#### Infrastructure Layer Testing

- [ ] **Repository Adapters**: Port contract compliance and data mapping tested
- [ ] **Event Store Adapters**: Event persistence, replay, and versioning tested
- [ ] **Message Handlers**: Event processing, idempotency, and error handling tested
- [ ] **Integration Tests**: Real database/message broker integration where needed
- [ ] **Configuration**: Adapter configuration and connection handling tested

#### General Architecture Compliance

- [ ] **Hexagonal Architecture**: Dependencies point inward, ports/adapters properly tested
- [ ] **CQRS Separation**: Commands and queries properly separated and tested
- [ ] **Event Sourcing**: State changes via events only, event replay tested
- [ ] **Layer Boundaries**: No domain logic in application/infrastructure layers
- [ ] **Test Isolation**: Proper mock reset and test independence maintained

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
- [Architecture Decision Records](../docs/architecture/)
  - [Domain Layer ADR](../docs/architecture/adr-domain.md)
  - [Application Layer ADR](../docs/architecture/adr-application.md)
  - [API Layer ADR](../docs/architecture/adr-api.md)
  - [Logging Subsystem ADR](../docs/architecture/adr-logging.md)
- [Code Review Architecture Checklist](../docs/architecture/code-review-architecture.md)
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
