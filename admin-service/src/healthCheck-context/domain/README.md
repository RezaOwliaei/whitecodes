# Admin Context - Domain Layer

This is the heart of the `admin-context` microservice. The domain layer models the core business logic and enforces consistency through aggregates, entities, value objects, domain events, and rules (invariants).

It is designed to strictly follow the principles of:

* **Domain-Driven Design (DDD)**
* **Command Query Responsibility Segregation (CQRS)**
* **Event Sourcing (ES)**

---

## 📁 Directory Structure

```
src/
└── admin-context/
    └── domain/
        ├── aggregates/                          # Aggregate roots (entry point for business logic)
        │   └── admin.aggregate.js
        ├── entities/                            # Entities owned by aggregates
        │   └── role.entity.js
        ├── valueObjects/                        # Immutable domain types with equality by value
        │   ├── email.valueObject.js
        │   └── adminId.valueObject.js
        ├── events/                              # Domain events (state transitions)
        │   └── admin/
        │       ├── adminCreated.event.js
        │       └── adminDeactivated.event.js
        ├── commands/                            # Domain-level command contracts (optional)
        │   └── registerAdmin.command.js
        ├── services/                            # Stateless domain services (pure domain logic)
        │   └── passwordPolicy.service.js         # Use only if policy involves orchestration or reuse across contexts
        ├── factories/                           # Complex creation logic encapsulation
        │   └── admin.factory.js
        ├── repositories/                        # Abstract interfaces (to be implemented in infra)
        │   └── admin.repository.js
        ├── invariants/                          # Extracted business rules (used inside aggregates)
        │   └── admin/
        │       ├── cannotChangeEmail.rule.js
        │       ├── mustHaveValidRole.rule.js
        │       └── passwordPolicy.rule.js       # ✅ Example: password rules belong here when purely enforcing domain consistency
        ├── exceptions/                          # Domain-specific errors (optional)
        │   └── cannotChangeEmail.exception.js
        └── types/                               # Shared enums, identifiers, base types (optional)
            ├── status.enum.js
            └── domainEvent.base.js              # Base class for all domain events
```

---

## ✅ Responsibilities

### 🔹 Aggregates

* Enforce business invariants
* Coordinate internal entities
* Emit domain events instead of applying state directly

### 🔹 Entities

* Have identity and lifecycle within the aggregate boundary

### 🔹 Value Objects

* Immutable types that encapsulate behavior and validation
* Examples: email, UUIDs, status

### 🔹 Events

* Represent facts about state changes in the domain
* Are emitted by aggregates and stored in event store

### 🔹 Services

* Domain logic that doesn’t naturally belong to any specific model
* Used for cross-aggregate rules or orchestration logic
* ⚠️ If the logic is stateless, reusable, and expresses a business invariant, prefer placing it in `invariants/`

### 🔹 Invariants

* Represent reusable, stateless business rules
* Used inside aggregates to enforce consistency and guard state transitions
* Best suited for rules like password policies, business eligibility checks, or permission rules
* ✅ Example: `passwordPolicy.rule.js` encapsulates password complexity rules such as length, character variety, and common passwords

### 🔹 Factories

* Handle complex construction logic, ensuring all invariants are met at creation

### 🔹 Repositories

* Abstract access to aggregate roots
* Hide persistence details (implemented in infrastructure layer)

### 🔹 Exceptions

* Encapsulate domain violations as explicit error types
* Useful for distinguishing business errors from system errors

### 🔹 Types

* Domain enums, constants, and base interfaces
* `domainEvent.base.js` standardizes the shape and behavior of domain events

---

## 📌 Invariant Placement Rules

| Invariant Type                | Best Location                                                               |
| ----------------------------- | --------------------------------------------------------------------------- |
| Consistency within aggregate  | `aggregates/` or `invariants/` (scoped)                                     |
| Cross-entity within aggregate | Inside aggregate logic                                                      |
| Shared or complex rule        | `invariants/` scoped to aggregate or `services/` if orchestration is needed |
| Format validation             | `valueObjects/`                                                             |

---

## ✨ Best Practices

* Keep aggregates pure and focused
* Avoid leaking domain logic into the application or infrastructure layers
* Use dot notation and camelCase for naming
* Use domain events for all state transitions
* Validate all input using value objects or invariants
* Keep domain logic declarative, intention-revealing, and side-effect free
* Extend `domainEvent.base.js` for consistent event structure

---

## Example: `AdminAggregate`

1. Receives a domain command (e.g., `registerAdmin`)
2. Validates using value objects and/or invariants (inline or imported)
3. Applies internal state changes by emitting events
4. Returns the events for the application layer to persist

---

## Questions?

For design reviews, modeling help, or aggregate logic decisions, reach out to the domain architecture team.
