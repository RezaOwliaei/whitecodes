# Development Container Setup

This folder contains the configuration for the project development container, which provides a consistent development environment for the project.

## Architecture

The development architecture is designed with the following principles:

1. The development container is used for coding, debugging, and running development tools
2. All services (databases, applications) run on the host machine using Docker Compose
3. The development container has access to the host's Docker daemon through a mounted socket

This approach ensures:

- Better isolation between development environment and services
- Services run on the host network, making them more accessible
- Resource allocation to services is managed by the host
- Consistent environment for all developers

## Configuration Files

- `Dockerfile` - Defines the development container image with all necessary tools
- `docker-compose.yml` - Docker Compose file for the development container
- `devcontainer.json` - VS Code configuration for the development container
- `host-services.sh` - Script to start/stop services on the host machine

## Getting Started

### Starting the Dev Container

1. Open this project in VS Code
2. Install the "Remote - Containers" extension if you haven't already
3. Click on the green button in the bottom-left corner or run the "Remote-Containers: Reopen in Container" command

### Managing Services

All services (databases and applications) should be run on your host machine, not inside the dev container.

To start all services from your host machine:

```bash
# From your host machine's terminal
cd /path/to/project
.devcontainer/host-services.sh start
```

To stop all services:

```bash
# From your host machine's terminal
cd /path/to/project
.devcontainer/host-services.sh stop
```

## Adding New Services

When adding new services to the project:

1. Create a new directory for the service at the project root level
2. Add a `docker-compose.yaml` file to the service directory
3. Update the `.devcontainer/host-services.sh` script to include the new service

## Troubleshooting

If you experience issues with Docker:

1. Make sure Docker is running on your host machine
2. Check that the dev container has access to the Docker socket
3. Verify that the Docker Compose files for each service are properly configured

If services are not accessible from the dev container:

1. Ensure services are using the host network or exposing their ports
2. Check that the necessary ports are forwarded in the devcontainer.json

## Manual Dev Container Setup

If you prefer not to use VS Code's Remote Containers extension, you can manually start the dev container:

```bash
# From the project root
cd .devcontainer
docker compose up -d
docker exec -it dev-container bash
```
