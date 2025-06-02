# Admin Context - Application Layer

This layer orchestrates the use case logic for the `admin-context` microservice. It is designed to fully comply with **Domain-Driven Design (DDD)**, **Command Query Responsibility Segregation (CQRS)**, and **Event Sourcing** architectural principles.

---

## 📁 Directory Structure

```
src/
└── admin-context/
    └── application/
        ├── write/                              # Write-side of CQRS (commands)
        │   ├── createAdmin/                    # Use case: Create Admin
        │   │   ├── createAdmin.command.js
        │   │   ├── createAdmin.handler.js
        │   │   ├── createAdmin.validator.js
        │   │   └── createAdmin.mapper.js       # optional
        │   └── deactivateAdmin/                # Use case: Deactivate Admin
        │       ├── deactivateAdmin.command.js
        │       ├── deactivateAdmin.handler.js
        │       ├── deactivateAdmin.validator.js
        │       └── deactivateAdmin.mapper.js
        └── read/                               # Read-side of CQRS (queries)
            └── getAdminProfile/                # Use case: Get Admin Profile
                ├── getAdminProfile.query.js
                ├── getAdminProfile.handler.js
                └── getAdminProfile.mapper.js   # optional
```

---

## ✅ Architectural Responsibilities

### 🔹 Domain-Driven Design (DDD)

* The application layer does **not contain domain logic**.
* It coordinates use cases, invokes domain aggregates and services, and persists changes via repositories.

### 🔹 CQRS (Command Query Responsibility Segregation)

* **Write-side logic** is encapsulated in `write/` — each command has its own folder.
* **Read-side logic** is handled in `read/`, isolated from state mutations.
* Enables optimized, scalable reads and writes.

### 🔹 Event Sourcing

* Command handlers orchestrate aggregate operations which raise domain events.
* This layer should trigger behavior that causes events, but **never stores or replays** them — that’s handled in the domain/infrastructure layers.

---

## 📦 Folder Contents

Each command/query folder may include:

| File                          | Purpose                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `*.command.js` / `*.query.js` | Pure data object that models a request intent                                        |
| `*.handler.js`                | Application service; validates, loads aggregates, calls domain methods, saves events |
| `*.validator.js`              | Ensures input shape and business-level validation                                    |
| `*.mapper.js` (optional)      | Maps between DTOs, commands, aggregates, projections                                 |

---

## ✨ Best Practices

* Keep this layer thin and focused on **coordination**, not business logic.
* Use **dot notation + camelCase** for file naming.
* Group related files by **use case**, not by file type.
* Keep domain knowledge and policies strictly inside the domain layer.

---

## 📬 Example Workflow: `createAdmin`

1. Controller receives request and validates it.
2. Maps payload to `createAdmin.command.js`.
3. Passes command to `createAdmin.handler.js`.
4. Handler loads aggregate from repository, calls domain methods.
5. Domain emits events; handler calls event store to persist.
6. Response is returned.

---

## Questions?

Ensure command and query logic stays coordinated, decoupled, and consistent with DDD, CQRS, and event sourcing principles. Reach out to the architecture team for reviews or design patterns support.
