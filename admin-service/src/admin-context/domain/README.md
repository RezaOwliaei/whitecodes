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
        │   └── adminRole.entity.js
        ├── valueObjects/                        # Immutable domain types with equality by value
        │   ├── adminEmail.valueObject.js
        │   └── adminId.valueObject.js
        ├── events/                              # Domain events (state transitions)
        │   ├── adminCreated.event.js
        │   └── adminDeactivated.event.js
        ├── commands/                            # Domain-level command contracts (optional)
        │   └── registerAdmin.command.js
        ├── services/                            # Stateless domain services (pure domain logic)
        │   └── passwordPolicy.service.js
        ├── factories/                           # Complex creation logic encapsulation
        │   └── admin.factory.js
        ├── repositories/                        # Abstract interfaces (to be implemented in infra)
        │   └── admin.repository.js
        └── invariants/                          # Extracted business rules (used inside aggregates)
            └── admin/                           # Scoped to admin aggregate
                ├── cannotChangeEmail.rule.js
                └── mustHaveValidRole.rule.js
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

### 🔹 Factories

* Handle complex construction logic, ensuring all invariants are met at creation

### 🔹 Repositories

* Abstract access to aggregate roots
* Hide persistence details (implemented in infrastructure layer)

### 🔹 Invariants

* Represent reusable domain rules
* Used inside aggregates to enforce consistency
* Keep aggregates lean and rules modular

---

## 📌 Invariant Placement Rules

| Invariant Type                | Best Location                                    |
| ----------------------------- | ------------------------------------------------ |
| Consistency within aggregate  | `aggregates/` or `invariants/` (scoped)          |
| Cross-entity within aggregate | Inside aggregate logic                           |
| Shared or complex rule        | `invariants/` scoped to aggregate or `services/` |
| Format validation             | `valueObjects/`                                  |

---

## ✨ Best Practices

* Keep aggregates pure and focused
* Avoid leaking domain logic into the application or infrastructure layers
* Use dot notation and camelCase for naming
* Use domain events for all state transitions
* Validate all input using value objects or invariants

---

## Example: `AdminAggregate`

1. Receives a domain command (e.g., `registerAdmin`)
2. Validates using invariants (inline or imported)
3. Applies internal state changes by emitting events
4. Returns the events for the application layer to persist

---

## Questions?

For design reviews, modeling help, or aggregate logic decisions, reach out to the domain architecture team.
