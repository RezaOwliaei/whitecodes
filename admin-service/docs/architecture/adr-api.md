# Admin Context - API Layer (v1)

This directory implements the HTTP API layer for the `admin-context` microservice. It follows Domain-Driven Design (DDD), Command Query Responsibility Segregation (CQRS), and Event Sourcing (ES) architectural principles. All business logic is delegated to the application layer, ensuring the API remains thin, clean, and framework-agnostic.

---

## 📁 Directory Structure

```
src/
└── admin-context/
    └── api/
        └── v1/
            ├── routes.js                          # Mounts /api/v1/admin and applies middleware
            ├── controllers/                       # Handles HTTP requests, delegates to application layer
            │   ├── createAdmin.controller.js
            │   └── deactivateAdmin.controller.js
            ├── dtos/                              # HTTP-layer DTOs following CQRS
            │   ├── commands/
            │   │   ├── createAdmin.command.js
            │   │   └── deactivateAdmin.command.js
            │   └── queries/
            │       └── getAdminProfile.query.js
            ├── middlewares/                       # Express-compatible middlewares
            │   ├── auth.middleware.js
            │   ├── logging.middleware.js
            │   ├── validation.middleware.js
            │   └── errorHandler.middleware.js
            └── validators/                        # Input validation schemas for command/query inputs
                ├── createAdmin.validator.js
                └── deactivateAdmin.validator.js
```

---

## ✅ Principles & Responsibilities

### DDD (Domain-Driven Design)

* **No domain logic in controllers.** All logic is delegated to the application layer.
* **Contextual boundaries** are enforced by the directory structure (`admin-context`).

### CQRS (Command Query Responsibility Segregation)

* **Commands and Queries are clearly separated** in `dtos/`.
* Controllers invoke specific command/query handlers.
* Read and write operations are not mixed.

### Event Sourcing

* **No state is mutated in the API.**
* API triggers command handlers that raise domain events.
* Events are stored and replayed from the event store (infrastructure responsibility).

---

## 📌 Key Design Decisions

* **Dot Notation for File Naming:** Improves clarity and grouping by type (e.g. `createAdmin.controller.js`).
* **camelCase Naming Convention:** Ensures consistency and avoids hyphenation issues.
* **Versioning:** `v1/` allows future iteration and backward compatibility.
* **Thin Controllers:** Controllers should never contain logic. They handle HTTP-specific concerns only.
* **Middlewares:** Composable, domain-agnostic Express middleware.

---

## 🧩 Example Workflow: Create Admin

1. **Route Setup:** `routes.js` binds POST `/admins` to `createAdmin.controller.js`
2. **Middleware Execution:** `auth`, `validation`, etc., are applied
3. **Controller Action:**

   * Parses the HTTP request
   * Maps input to `createAdmin.command.js`
   * Delegates to `CreateAdminCommandHandler` from the application layer
4. **Event Emission:** Application layer validates and emits domain events
5. **Persistence:** Events are stored via event store (e.g. KurrentDb, Kafka)

---

## 🛠️ Dependencies (Implicit)

* **Express.js** for routing/middleware
* **Joi or Zod** for request validation in `validators/`
* **Application Layer** must expose appropriate command/query handlers

---

## ✨ Extending This Layer

To add a new endpoint (e.g. suspend admin):

1. Create `suspendAdmin.controller.js` under `controllers/`
2. Define `suspendAdmin.command.js` under `dtos/commands/`
3. Add `suspendAdmin.validator.js` in `validators/`
4. Update `routes.js` to mount the route and middleware
5. Implement a command handler in the `application/` layer

---

## 📬 Questions / Suggestions

This API layer is designed to be scalable, strict in separation of concerns, and compliant with modern distributed system patterns.

Please report issues or improvements to the architecture lead or via internal documentation portal.
