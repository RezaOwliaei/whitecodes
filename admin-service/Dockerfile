# === Base Stage ===
# Minimal image with Node.js and production dependencies.
FROM node:24-bookworm-slim AS base
USER node
WORKDIR /app

ENV NODE_ENV=production
ENV PATH=/app/node_modules/.bin:$PATH

# Install production dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# === Builder Stage ===
# For development and testing environments. Includes dev dependencies.
FROM base AS builder
ENV NODE_ENV=development

# Install all dependencies (production + dev)
# We need to reinstall everything because we need dev dependencies
RUN npm install

# Copy all source code
COPY --chown=node:node . .

# === Development Stage ===
# For local development with hot-reloading.
FROM builder AS dev
# NODE_ENV=development inherited from builder
CMD ["nodemon"]

# === Test Stage ===
# For running automated tests in CI/CD.
FROM builder AS test
ENV NODE_ENV=test

# Runs tests once and exits. For watch mode, consider using docker-compose with volumes.
CMD ["npm", "test"]

# === Production Stage ===
# Final, optimized image for production.
FROM base AS prod

# Copy only necessary application code from the context.
# This prevents test files, docs, and other non-production assets from being included.
COPY --chown=node:node ./src ./src

# If you have other config files at the root needed for production, copy them explicitly.
# e.g. COPY --chown=node:node ./config.prod.json .

CMD ["node", "./src/server.js"]