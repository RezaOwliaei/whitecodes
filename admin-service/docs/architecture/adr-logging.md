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
- Methods: `error`, `warn`, `info`, `http`, `verbose`, `debug`, `trace`, `fatal`.
- Each method must be implemented by concrete adapters.
- Supports both Winston-specific methods (`http`, `verbose`) and Pino-specific methods (`trace`, `fatal`).
- Adapters may map non-native methods to their closest equivalents (e.g., Pino maps `verbose` to `debug`).

### 2. Logger Adapters

- **WinstonLoggerAdapter (winston-logger.adapter.js)**
  - Implements `LoggerPort` using Winston.
  - Supports log rotation (via `winston-daily-rotate-file`), colorized console output, and JSON formatting.
  - Native log levels: `error`, `warn`, `info`, `http`, `verbose`, `debug`.
  - Maps Pino-specific methods: `trace` → `debug`, `fatal` → `error`.
- **PinoLoggerAdapter (pino-logger.adapter.js)**
  - Implements `LoggerPort` using Pino.
  - Supports multi-stream output (console and files), log sanitization, and JSON logs.
  - Native log levels: `error`, `warn`, `info`, `debug`, `trace`, `fatal`.
  - Maps Winston-specific methods: `verbose` → `debug`, `http` → `info`.

### 3. Logger Factory (logger.factory.js)

- Exports `createLoggerFactory`, which:
  - **Is a pure function**: it does not resolve adapters or read configuration.
  - Accepts a logger adapter instance and a list of log methods as arguments.
  - Wraps only the standard log methods for the selected adapter.
  - Merges default and per-call context for every log entry using deep merge strategy.
  - Ensures a fallback context `{ service: "unknown-service" }` if none is provided.
  - Uses `object-merge.util.js` for sophisticated context merging with nested object support.

### 4. Log Methods Constants (logger-methods.js)

- Defines which log methods are wrapped for each adapter:
  - `WINSTON_LOG_METHODS`: `info`, `warn`, `error`, `debug`, `verbose`, `http`, `trace`, `fatal`
  - `PINO_LOG_METHODS`: `info`, `warn`, `error`, `debug`, `trace`, `fatal`, `verbose`, `http`
- Includes cross-adapter method support for seamless adapter switching.
- Non-native methods are mapped by adapters to their closest equivalents.

### 5. Log Levels and Colors (logger-levels.js)

- Defines log level priorities and color mappings for Winston.

### 6. Log Formats and Formatters

- **Winston:** `winston-logger-formats.js` provides `consoleFormat` and `jsonFormat` for Winston, including timestamping, error stack traces, context flattening, and log sanitization.
- **Pino:** `pino-logger-formatters.js` provides `levelFormatter`, `logFormatter`, and `timestamp` for Pino, ensuring context flattening, log sanitization, and ISO timestamp formatting. This aligns Pino's log structure with Winston's JSON format for consistency.

### 7. Object Merge Utility (object-merge.util.js)

- **Provides sophisticated deep merge functionality for context objects.**
- Features:
  - Deep merging of nested objects while preserving immutability.
  - Array replacement strategy (call context arrays override default arrays entirely).
  - Performance optimizations with early returns and shallow merge detection.
  - Handles frozen and sealed objects gracefully.
  - Zero external dependencies.

### 8. Logger Entry Point / Composition Root (logger.js)

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

// Basic usage with context
const logger = createLogger({ module: "user", feature: "auth" });
logger.info("User created", { userId: "123" });

// Dynamic context override with deep merge
logger.info("User action", {
  context: { feature: "signup" },
  metadata: { requestId: "req-456" },
});

// Using pre-configured base logger
baseLogger.info("Service started", { port: 3000 });

// Cross-adapter method usage (works with both Winston and Pino)
logger.trace("Detailed debug info"); // Maps to debug in Winston
logger.fatal("Critical error"); // Maps to error in Winston
```

## Design Decisions

- **Adapter Pattern:** Abstracts the logger implementation, allowing easy switching or extension.
- **Context Merging:** Ensures all logs are tagged with service/module/feature for traceability using deep merge strategy.
- **Cross-Adapter Compatibility:** Supports both Winston and Pino method sets with automatic mapping for seamless adapter switching.
- **Deep Merge Strategy:** Uses sophisticated object merging that preserves nested context while allowing per-call overrides (arrays are replaced entirely).
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

| Principle              | Role in System                                               | Benefits                                              | Risk if Ignored                                          |
| ---------------------- | ------------------------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------- |
| Hexagonal Architecture | Keeps logger infrastructure isolated from domain logic       | Enables adapter switching, improves testability       | Domain code becomes tightly coupled to logging libraries |
| Adapter Pattern        | Normalizes Pino and Winston to a common interface            | Reduces coupling, adds portability                    | Inconsistent logging behavior and harder maintenance     |
| Factory Pattern        | Centralizes logger creation and context wrapping             | Promotes reusability, encapsulation, and testability  | Logger setup logic leaks into various parts of the code  |
| Composition Root       | `logger.js` wires up adapters and passes them to the factory | Isolates environment/config logic, simplifies mocking | Hidden dependencies, hard to override for testing        |
| Separation of Concerns | Formatters, transports, levels, and adapters are modular     | Easier to extend and isolate changes                  | Cross-cutting concerns get tangled, reducing clarity     |
| Contextual Logging     | Logs include service/module/feature context                  | Improves traceability and observability               | Logs lack structure, hard to search or correlate         |
