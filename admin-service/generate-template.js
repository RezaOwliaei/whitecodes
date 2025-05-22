// This script generates the DDD/CQRS/Event Sourcing microservice template structure in a specified directory.
// Usage: node generate-template.js <target-directory>

const fs = require('fs');
const path = require('path');

const structure = [
  'docker-compose.yaml',
  'Dockerfile',
  'README.md',
  '.env',
  '.env.example',
  'docs/adrs/.gitkeep',
  'scripts/run-migrations.js',
  'src/main.js',
  'src/shared/constants/.gitkeep',
  'src/shared/errors/.gitkeep',
  'src/shared/logger/logger.port.js',
  'src/user-context/domain/user.aggregate.js',
  'src/user-context/domain/user.entity.js',
  'src/user-context/domain/email.value-object.js',
  'src/user-context/domain/user.events.js',
  'src/user-context/domain/user.factory.js',
  'src/user-context/domain/user.repository.js',
  'src/user-context/domain/user.exceptions.js',
  'src/user-context/application/CreateUser/command.js',
  'src/user-context/application/CreateUser/handler.js',
  'src/user-context/application/CreateUser/validator.js',
  'src/user-context/application/DeactivateUser/.gitkeep',
  'src/user-context/application/queries/GetUserProfile/query.js',
  'src/user-context/application/queries/GetUserProfile/handler.js',
  'src/user-context/api/routes.js',
  'src/user-context/api/controller.js',
  'src/user-context/api/dtos/request/.gitkeep',
  'src/user-context/api/dtos/response/.gitkeep',
  'src/user-context/infrastructure/persistence/mongodb/user-mongo.repository.js',
  'src/user-context/infrastructure/persistence/mongodb/migrations/2025-05-create-user-collection.js',
  'src/user-context/infrastructure/persistence/kurrendb/kurrendb-user-event-store.repository.js',
  'src/user-context/infrastructure/messaging/kafka-user-producer.js',
  'src/user-context/infrastructure/logging/pino-logger.adapter.js',
  'src/order-context/domain/.gitkeep',
  'src/order-context/application/.gitkeep',
  'src/order-context/api/.gitkeep',
  'src/order-context/infrastructure/.gitkeep',
  'tests/unit/.gitkeep',
  'tests/integration/.gitkeep',
];

const stubs = {
  '.js': '// ...stub...\n',
  '.yaml': '# ...stub...\n',
  '.env': '# ...stub...\n',
  '.md': '# ...stub...\n',
  '.gitkeep': '',
};

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeStub(filePath) {
  const ext = path.extname(filePath);
  const stub = stubs[ext] !== undefined ? stubs[ext] : '';
  fs.writeFileSync(filePath, stub);
}

function generate(targetDir) {
  structure.forEach((relPath) => {
    const absPath = path.join(targetDir, relPath);
    ensureDirSync(path.dirname(absPath));
    writeStub(absPath);
  });
  console.log('Template structure generated at', targetDir);
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node generate-template.js <target-directory>');
    process.exit(1);
  }
  generate(target);
}

module.exports = { generate };
