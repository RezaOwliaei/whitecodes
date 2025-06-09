# === Base Stage ===
# Use a specific Node.js version for reproducible builds
# This stage sets up a non-root user for security
FROM node:24-bookworm-slim AS base

# Add security and maintainability labels
LABEL \
  org.opencontainers.image.title="Admin Service" \
  org.opencontainers.image.description="Admin microservice with comprehensive DDD/CQRS architecture" \
  org.opencontainers.image.version="1.0.0" \
  org.opencontainers.image.vendor="WhiteCodes" \
  org.opencontainers.image.authors="r.owliaei@gmail.com" \
  org.opencontainers.image.licenses="MIT" \
  security.non-root=true \
  security.scan=required

# Install security updates and minimal required system packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
      dumb-init \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# Create app directory with proper permissions and switch to non-root user
WORKDIR /app
RUN chown node:node /app
USER node

# Set path to include local binaries
ENV PATH=/app/node_modules/.bin:$PATH

# === Dependencies Stage ===
# Install production dependencies using npm ci for deterministic builds
# This leverages Docker layer caching, so dependencies are only re-installed when package.json changes
FROM base AS dependencies

# Set production environment
ENV NODE_ENV=production

# Copy package files with proper ownership
COPY --chown=node:node package*.json ./

# Install production dependencies with optimizations
RUN npm ci \
    --omit=dev \
    --no-audit \
    --no-fund \
    --prefer-offline \
    && npm cache clean --force \
    && rm -rf ~/.npm

# === Development Stage ===
# For local development with hot-reloading and dev dependencies
# This stage is larger as it includes the full source and dev tooling
FROM dependencies AS dev

# Switch to development environment
ENV NODE_ENV=development

# Install all dependencies (including dev dependencies)
RUN npm ci \
    --no-audit \
    --no-fund \
    --prefer-offline

# Copy application source code
COPY --chown=node:node . .

# Expose the application port and debug port
EXPOSE 3000 9229

# Add health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "import('node:http').then(({default:http})=>http.get('http://localhost:3000/api/v1/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1)))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "nodemon", "--config", "nodemon.json"]

# === Production Stage ===
# Creates a lean, secure, and optimized production-ready image
# This is the final and default stage
FROM dependencies AS prod

# Copy only the application source code, not the entire project
# A .dockerignore file is used to prevent secrets, tests, and docs from being included
COPY --chown=node:node ./src ./src

# Expose only the application port in production
EXPOSE 3000

# Add comprehensive health check for production
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "import('node:http').then(({default:http})=>http.get('http://localhost:3000/api/v1/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1)))"

# Set production-specific environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--enable-source-maps --max-old-space-size=512"

# Use dumb-init for proper signal handling and process management
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./src/server.js"]