// This script generates the DDD/CQRS/Event Sourcing microservice template structure in a specified directory.
// Usage: node generate-template.js <target-directory>

const fs = require("fs");
const path = require("path");

// Directory and file structure for the template
const structure = [
  // Root-level files
  ".env.example",
  "docker-compose.yaml",
  "Dockerfile",
  "generate-template.js",
  // Docs
  "docs/adrs/api.md",
  "docs/adrs/application.md",
  "docs/adrs/domain.md",
  // Scripts
  "scripts/.gitkeep",
  // Source code structure
  "src/app.js",
  "src/server.js",
  // Admin context
  "src/admin-context/api/controllers/.gitkeep",
  "src/admin-context/api/dtos/commands/.gitkeep",
  "src/admin-context/api/dtos/queries/.gitkeep",
  "src/admin-context/api/middlewares/.gitkeep",
  "src/admin-context/api/routers/.gitkeep",
  "src/admin-context/api/validators/.gitkeep",
  "src/admin-context/application/read/.gitkeep",
  "src/admin-context/application/write/.gitkeep",
  "src/admin-context/domain/aggregates/.gitkeep",
  "src/admin-context/domain/commands/.gitkeep",
  "src/admin-context/domain/entities/.gitkeep",
  "src/admin-context/domain/events/.gitkeep",
  "src/admin-context/domain/exceptions/.gitkeep",
  "src/admin-context/domain/factories/.gitkeep",
  "src/admin-context/domain/invariants/.gitkeep",
  "src/admin-context/domain/repositories/.gitkeep",
  "src/admin-context/domain/types/domainEvent.base.js",
  "src/admin-context/domain/valueObjects/.gitkeep",
  // HealthCheck context
  "src/healthCheck-context/api/README.md",
  "src/healthCheck-context/api/controllers/.gitkeep",
  "src/healthCheck-context/api/dtos/commands/.gitkeep",
  "src/healthCheck-context/api/dtos/queries/.gitkeep",
  "src/healthCheck-context/api/middlewares/.gitkeep",
  "src/healthCheck-context/api/routers/health.v1.router.js",
  "src/healthCheck-context/api/validators/.gitkeep",
  "src/healthCheck-context/application/README.md",
  "src/healthCheck-context/application/read/.gitkeep",
  "src/healthCheck-context/application/write/.gitkeep",
  "src/healthCheck-context/domain/README.md",
  "src/healthCheck-context/domain/aggregates/.gitkeep",
  "src/healthCheck-context/domain/commands/.gitkeep",
  "src/healthCheck-context/domain/entities/.gitkeep",
  "src/healthCheck-context/domain/events/.gitkeep",
  "src/healthCheck-context/domain/exceptions/.gitkeep",
  "src/healthCheck-context/domain/factories/.gitkeep",
  "src/healthCheck-context/domain/invariants/.gitkeep",
  "src/healthCheck-context/domain/repositories/.gitkeep",
  "src/healthCheck-context/domain/services/README.md",
  "src/healthCheck-context/domain/services/.gitkeep",
  "src/healthCheck-context/domain/types/domainEvent.base.js",
  "src/healthCheck-context/domain/valueObjects/.gitkeep",
  // Infrastructure
  "src/infrastructure/http/server.create.js",
  "src/infrastructure/http/server.process.handler.js",
  "src/infrastructure/http/server.shutdown.js",
  "src/infrastructure/http/server.start.js",
  "src/infrastructure/logging/pino-logger.adapter.js",
  "src/infrastructure/messaging/kafka-admin-producer.js",
  "src/infrastructure/persistence/kurrendb/kurrendb-admin-event-store.repository.js",
  "src/infrastructure/persistence/mongodb/admin-mongo.repository.js",
  "src/infrastructure/persistence/mongodb/migrations/2025-05-create-admin-collection.js",
  // Shared
  "src/shared/configs/api.config.js",
  "src/shared/configs/middlewares.config.js",
  "src/shared/configs/server.config.js",
  "src/shared/constants/.gitkeep",
  "src/shared/errors/.gitkeep",
  "src/shared/middlewares/auth.middleware.js",
  "src/shared/middlewares/errorHandler.middleware.js",
  "src/shared/middlewares/logging.middleware.js",
  "src/shared/middlewares/responseHandler.middleware.js",
  "src/shared/middlewares/validation.middleware.js",
  // Tests
  "tests/integration/.gitkeep",
  "tests/unit/.gitkeep",
];

const stubs = {
  ".js": "// ...stub...\n",
  ".yaml": "# ...stub...\n",
  ".env": "# ...stub...\n",
  ".md": "# ...stub...\n",
  ".gitkeep": "",
};

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeStub(filePath) {
  const ext = path.extname(filePath);
  const stub = stubs[ext] !== undefined ? stubs[ext] : "";
  fs.writeFileSync(filePath, stub);
}

function generate(targetDir) {
  structure.forEach((relPath) => {
    const absPath = path.join(targetDir, relPath);
    ensureDirSync(path.dirname(absPath));
    writeStub(absPath);
  });
  console.log("Template structure generated at", targetDir);
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node generate-template.js <target-directory>");
    process.exit(1);
  }
  generate(target);
}

module.exports = { generate };
