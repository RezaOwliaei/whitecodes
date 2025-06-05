# Code Review Checklist: Architecture & Best Practices (Admin Service)

🎯 **Goal**
Ensure every PR aligns 100% with our documented architecture (`admin-service/docs/architecture/*.md`) and 2024 best practices for:

- Domain-Driven Design (DDD)
- Command Query Responsibility Segregation (CQRS)
- Event Sourcing (ES)
- Hexagonal & Clean Architecture
- Microservices & Logging

---

## 1. 📚 Documentation & ADR Alignment

// STEP 1: Verify conformance with all relevant Architecture Decision Records (ADRs)

- [ ] **ADR Adherence**: Code changes are fully compliant with decisions in `adr-domain.md`, `adr-application.md`, `adr-api.md`, and `adr-logging.md`.
- [ ] **ADR Updates**: If new patterns are introduced or deviations made, are corresponding ADRs created or updated and justified?
- [ ] **Diagrams & Docs**: Architecture diagrams (UML, flow charts) and READMEs/context docs updated if behavior, entry points, or config changed.
- [ ] **Code Comments**: Public APIs, complex logic, and architectural decisions within the code are clearly documented.

## 2. 🧠 DDD Compliance (Ref: `adr-domain.md`)

// STEP 2: Check domain layer purity and correctness

- [ ] **Directory Structure**: Adheres to `admin-context/domain/` structure (aggregates, entities, valueObjects, events, services, factories, repositories, invariants, exceptions, types).
- [ ] **Aggregates**:
  - [ ] Enforce business invariants and coordinate internal entities.
  - [ ] Emit domain events for all state transitions (no direct state mutation).
  - [ ] Logic follows patterns like the `AdminAggregate` example (command -> validate -> emit events -> return events).
- [ ] **Entities**: Possess identity and lifecycle strictly _within_ an aggregate boundary.
- [ ] **Value Objects**:
  - [ ] Immutable, encapsulate behavior, and perform self-validation.
  - [ ] Used for types like email, IDs, status, etc.
- [ ] **Domain Events**:
  - [ ] Represent facts about state changes.
  - [ ] Correctly extend `domainEvent.base.js` for consistent structure.
  - [ ] Carry sufficient context to rebuild state without leaking infrastructure details.
- [ ] **Domain Services**: Used only for stateless domain logic not fitting an aggregate/VO (e.g., cross-aggregate rules); prefer `invariants/` for reusable stateless rules.
- [ ] **Invariants**:
  - [ ] Encapsulate reusable, stateless business rules (e.g., password policies).
  - [ ] Correctly placed according to `adr-domain.md` (e.g., within aggregates, `invariants/` for shared rules).
- [ ] **Factories**: Handle complex object creation, ensuring all invariants are met.
- [ ] **Repositories**: Abstract interfaces for aggregate access, defined in domain, implemented in infrastructure.
- [ ] **Domain Exceptions**: Custom exceptions used for specific business rule violations.
- [ ] **Purity**: No domain logic leaked to application/infrastructure. Domain logic is declarative and side-effect free.

## 3. 🌓 CQRS Compliance (Ref: `adr-application.md`, `adr-api.md`)

// STEP 3: Validate separation of concerns for commands and queries

- [ ] **Application Layer Structure**: Adheres to `admin-context/application/` structure (`write/<use_case>/`, `read/<use_case>/`) per `adr-application.md`.
- [ ] **Application Layer Role**:
  - [ ] Strictly for use case orchestration; **contains no domain/business logic**.
  - [ ] Kept thin, coordinating domain objects and repositories.
  - [ ] Command handlers load aggregates, invoke domain methods, and use repositories/event store to persist events.
  - [ ] Application layer triggers event-causing behavior but **never stores or replays events itself**.
- [ ] **API Layer Structure**: Adheres to `admin-context/api/v1/` structure (controllers, dtos, middlewares, validators) per `adr-api.md`.
- [ ] **API Controllers**:
  - [ ] Thin: Handle HTTP-specifics, delegate to application layer handlers. **No business logic**.
  - [ ] Map HTTP requests to DTOs.
- [ ] **DTOs**: Commands and Queries clearly separated in `api/v1/dtos/commands/` and `api/v1/dtos/queries/`.
- [ ] **Validation Layers**:
  - [ ] **API Validators** (`api/v1/validators/` using Joi/Zod): Validate input shape, type, presence, and basic format.
  - [ ] **Application Validators** (`application/{write|read}/<use_case>/*.validator.js`): Handle cross-field validation or business rules at the use-case level if not fitting into domain VOs/invariants.
  - [ ] **Domain Validators** (Value Objects, Invariants): Enforce core business rules and data integrity within the domain model.
- [ ] **API Versioning**: Uses `v1/` path for versioning.

## 4. 📦 Event Sourcing (ES) Compliance

// STEP 4: Audit event-based state management

- [ ] **State Changes via Events**: All aggregate state changes are represented and driven by domain events.
- [ ] **Event Store as SoT**: Event store is the source of truth; aggregates are rehydrated from events. No direct state mutation in persistence.
- [ ] **Event Design**: Events follow `domainEvent.base.js` and are immutable facts.
- [ ] **Idempotency**: Event handlers (projections, process managers) are idempotent where applicable.
- [ ] **Schema Versioning**: Event schemas are versioned or designed for backward compatibility.

## 5. 🧱 Hexagonal & Clean Architecture

// STEP 5: Confirm layer boundaries and dependency directions

- [ ] **Domain Independence**: Domain layer has zero dependencies on frameworks, UI, infrastructure (including specific logger instances like Winston/Pino).
- [ ] **Application Independence**: Application layer depends on domain, but not on UI or infrastructure specifics (uses ports).
- [ ] **Ports & Adapters**: Dependencies injected via ports (interfaces in domain/application) and implemented by adapters in infrastructure (e.g., repositories, messaging, logging via `LoggerPort`).
- [ ] **Infrastructure Isolation**: Controllers, repositories, external service clients, and logging adapters are implemented in the infrastructure layer.
- [ ] **`--noUnusedLocals`**: CI build verifies domain + application layers compile with this flag (or similar strict checks).

## 6. 🌐 Microservices Best Practices & Logging (Ref: `adr-logging.md`)

// STEP 6: Verify service boundaries, contracts, and operational concerns

- [ ] **Service Boundaries**: Bounded context (`admin-context`) is well-defined and respected; no cross-context leakage.
- [ ] **API Contracts**: DTOs/events are explicit, stable, and versioned. APIs are backward compatible.
- [ ] **Asynchronous Operations**: Side effects (messaging, non-critical persistence) handled asynchronously where appropriate.
- [ ] **Logging Standards**:
  - [ ] **Abstraction Used**: Logging performed via `LoggerPort` obtained from `logger.js` (e.g., `createLogger`, `baseLogger`); no direct use of Winston/Pino.
  - [ ] **Contextual Logging**: All logs include service, module, and feature context. Dynamic context overrides used correctly.
  - [ ] **Log Sanitization**: All logs are sanitized to prevent leaking sensitive data (as per `winston-logger-formats.js` or `pino-logger-formatters.js`).
  - [ ] **Structured Logs**: Logs are structured (e.g., JSON) with consistent formatting, timestamps, and error stack traces.
  - [ ] **Appropriate Levels**: Correct log levels (`error`, `warn`, `info`, `debug`, etc.) used.
- [ ] **Configuration Management**: Externalized configuration for environments.
- [ ] **Health Checks**: Comprehensive health check endpoint covering app status and critical dependencies (DB, message broker).
- [ ] **Distributed Tracing**: Correlation IDs are propagated through requests and logged.

## 7. 🔍 General Best Practices

// STEP 7: Code quality, ESM compliance, testing, and security

- [ ] **ESM Compliance**: All imports/exports follow ESM rules (per `/docs`, ESLint, and "ESM Module Enforcement for JavaScript" rule). File extensions included in all import paths.
- [ ] **Inline Documentation**: Code flow, decisions, "why/how" explained with comments, flow markers. JSDoc for public interfaces.
- [ ] **Testing**:
  - [ ] Meaningful unit, integration, and (if applicable) E2E tests cover new/changed logic.
  - [ ] Domain logic thoroughly unit-tested.
  - [ ] Application handlers tested, mocking domain/infra.
  - [ ] API controllers tested for request/response handling.
- [ ] **Readability & Maintainability**: Code is clear, intention-revealing, and follows established coding standards.
- [ ] **Linting & Formatting**: No ESLint/formatter warnings/errors. CI blocks on new issues.
- [ ] **Code Coverage**: Meets team's threshold (e.g., ≥ 80%) for changed files.
- [ ] **Static Analysis**: Type checks (TypeScript, if used) pass without unnecessary overrides.
- [ ] **Security**:
  - [ ] Inputs are validated at appropriate layers (API, Application, Domain).
  - [ ] Outputs are sanitized/encoded where necessary.
  - [ ] No hardcoded secrets or sensitive data.
  - [ ] Dependencies audited for vulnerabilities.
- [ ] **Performance**:
  - [ ] No obvious performance bottlenecks (e.g., N+1 queries, inefficient loops).
  - [ ] Benchmarks added if PR touches critical performance paths.
- [ ] **Error Handling**: Consistent and robust error handling; domain exceptions used for business errors.

---

## ✅ Instructions for Reviewers

1.  Reference relevant ADRs in `admin-service/docs/architecture/` for each section.
2.  For each item, check the box or leave a specific comment referencing the ADR/principle if non-compliant.
3.  If non-compliance is found, request changes with clear justification and link to relevant documentation.
4.  On approval, confirm "✅ Architecture & Best Practices Compliant" in your review summary.

---

## ⚠️ Common Pitfalls to Watch For

- Business logic in application/API layers or infrastructure adapters.
- Domain objects depending on infrastructure concerns (e.g., Express requests, DB models).
- CQRS: Queries mutating state; Command handlers with complex query logic.
- Event Sourcing: Aggregates mutating state directly instead of emitting events.
- Logging: Direct use of `console.log` or underlying logger libraries; missing context or sanitization.
- Missing or incorrect validation at any layer.
- Insufficient or incorrect ADR updates for new patterns or deviations.

> This checklist must be used for all PRs involving system-critical logic, architectural changes, or domain model evolution within the Admin Service.
