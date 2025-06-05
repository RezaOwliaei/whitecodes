# Logging Subsystem ADR

## Context

The logging subsystem provides a unified, context-aware, and adapter-agnostic logging interface for the admin-service. It supports both Winston and Pino as logging backends, allowing for flexible configuration and consistent log structure across the service.

## Goals

- Provide a consistent logging API regardless of the underlying logger (Winston or Pino).
- Support contextual logging (service, module, feature) for traceability.
- Allow per-call context overrides.
- Support log rotation, console and file outputs, and log sanitization.
- Make it easy to add or remove log levels and adapters.

## Key Components

### 1. LoggerPort (logger.port.js)

- **Abstract class** defining the contract for all logger adapters.
- Methods: `error`, `warn`, `info`, `http`, `verbose`, `debug`.
- Each method must be implemented by concrete adapters.

### 2. Logger Adapters

- **WinstonLoggerAdapter (winston-logger.adapter.js)**
  - Implements `LoggerPort` using Winston.
  - Supports log rotation (via `winston-daily-rotate-file`), colorized console output, and JSON formatting.
  - Log levels: `error`, `warn`, `info`, `http`, `verbose`, `debug`.
- **PinoLoggerAdapter (pino-logger.adapter.js)**
  - Implements `LoggerPort` using Pino.
  - Supports multi-stream output (console and files), log sanitization, and JSON logs.
  - Log levels: `error`, `warn`, `info`, `debug`, `trace`, `fatal`.

### 3. Logger Factory (logger.factory.js)

- Exports `createLoggerFactory`, which:
  - **Is a pure function**: it does not resolve adapters or read configuration.
  - Accepts a logger adapter instance and a list of log methods as arguments.
  - Wraps only the standard log methods for the selected adapter.
  - Merges default and per-call context for every log entry.
  - Ensures a fallback context `{ service: "unknown-service" }` if none is provided.

### 4. Log Methods Constants (logger-methods.js)

- Defines which log methods are wrapped for each adapter:
  - `WINSTON_LOG_METHODS`: `info`, `warn`, `error`, `debug`, `verbose`, `http`
  - `PINO_LOG_METHODS`: `info`, `warn`, `error`, `debug`, `trace`, `fatal`

### 5. Log Levels and Colors (logger-levels.js)

- Defines log level priorities and color mappings for Winston.

### 6. Log Formats and Formatters

- **Winston:** `winston-logger-formats.js` provides `consoleFormat` and `jsonFormat` for Winston, including timestamping, error stack traces, context flattening, and log sanitization.
- **Pino:** `pino-logger-formatters.js` provides `levelFormatter`, `logFormatter`, and `timestamp` for Pino, ensuring context flattening, log sanitization, and ISO timestamp formatting. This aligns Pino's log structure with Winston's JSON format for consistency.

### 7. Logger Entry Point / Composition Root (logger.js)

- **Acts as the composition root for logging.**
- Responsible for:
  - Adapter selection and instantiation (based on config or explicit options).
  - Reading configuration (e.g., log level, adapter type) from environment or parameters.
  - Passing the selected adapter and method list to the logger factory.
  - Exporting:
    - `createLogger`: Factory for context-aware logger instances (dependency-injectable and testable).
    - `baseLogger`: Pre-configured logger with base service context.

## Usage

```js
import createLogger, { baseLogger } from "./logger.js";

const logger = createLogger({ module: "user", feature: "auth" });
logger.info("User created", { context: { feature: "signup" } }); // dynamic context override
```

## Design Decisions

- **Adapter Pattern:** Abstracts the logger implementation, allowing easy switching or extension.
- **Context Merging:** Ensures all logs are tagged with service/module/feature for traceability.
- **Explicit Log Methods:** Only standard log methods are wrapped, reducing risk of exposing internal or non-standard methods.
- **Sanitization:** All logs are sanitized before output to prevent leaking sensitive data.
- **Extensibility:** New adapters or log levels can be added with minimal changes.
- **Factory Purity:** The logger factory is a pure function, making it easy to test and reuse.
- **Composition Root:** All configuration and adapter selection is handled in `logger.js`, ensuring separation of concerns and testability.

## Non-Goals

- Does not provide log aggregation, external log shipping, or alerting (these are handled by infrastructure/ops).
- Does not support legacy log levels like `silly`.

## Future Improvements

- Add support for structured error objects.
- Integrate with distributed tracing (e.g., correlation IDs).
- Add support for additional adapters if needed.

## Architectural Rationale and Impact

### Applied Principles and Patterns

| Principle              | Role in System                                                | Benefits                                                  | Risk if Ignored                                          |
|------------------------|---------------------------------------------------------------|-----------------------------------------------------------|----------------------------------------------------------|
| Hexagonal Architecture | Keeps logger infrastructure isolated from domain logic        | Enables adapter switching, improves testability           | Domain code becomes tightly coupled to logging libraries |
| Adapter Pattern        | Normalizes Pino and Winston to a common interface             | Reduces coupling, adds portability                        | Inconsistent logging behavior and harder maintenance     |
| Factory Pattern        | Centralizes logger creation and context wrapping              | Promotes reusability, encapsulation, and testability      | Logger setup logic leaks into various parts of the code  |
| Composition Root       | `logger.js` wires up adapters and passes them to the factory  | Isolates environment/config logic, simplifies mocking     | Hidden dependencies, hard to override for testing        |
| Separation of Concerns | Formatters, transports, levels, and adapters are modular       | Easier to extend and isolate changes                      | Cross-cutting concerns get tangled, reducing clarity     |
| Contextual Logging     | Logs include service/module/feature context                   | Improves traceability and observability                   | Logs lack structure, hard to search or correlate         |
