This project is a microservices-based application architecture with separate services for different functional areas.

## Project Structure

The project is structured as follows:

- `admin-service/` - Admin service for managing the application
- `core-postgres/` - PostgreSQL database service
- `core-mongo/` - MongoDB database service
- `core-kurrent/` - KurrentDB for event sourcing
- `core-vault/` - Vault for secrets management
- `.devcontainer/` - Development container configuration

Each service has its own Docker Compose file for deployment.

## Development Setup

### Development Container

Our development setup leverages a VS Code Development Container to ensure a consistent and reproducible environment for all developers. This approach is based on the following core principles:

1.  **Development Environment Isolation**: The dev container houses all necessary tools, extensions, and configurations for coding and debugging.
2.  **Services on Host**: All project services (databases, applications, etc.) run directly on your host machine using Docker Compose, managed by the `.devcontainer/host-services.sh` script.
3.  **Docker Socket Access**: The dev container has access to the host's Docker daemon, allowing it to interact with services running on the host.

This architecture provides several benefits:

- **Improved Performance**: Services run natively on the host, often leading to better performance.
- **Simplified Networking**: Services are accessible on the host network, simplifying connections from the dev container and other tools.
- **Resource Management**: Resource allocation for services is handled by the host operating system.
- **Consistency**: All developers use the same pre-configured environment within the container.

For comprehensive details on the dev container configuration, tools, and troubleshooting, please refer to the [Development Container Documentation](.devcontainer/README.md).

### Starting Development

1. **Start the Dev Container**:

   - Open the project in VS Code with the Remote Containers extension
   - Reopen in container when prompted

2. **Start Services on Host Machine**:

   ```bash
   # From your host terminal (not inside the dev container)
   cd /path/to/project
   .devcontainer/host-services.sh start
   ```

3. **Develop Inside the Container**:
   - All code editing and development happens inside the container
   - Services run on your host machine
   - You can connect to services from the container for debugging

### Stopping Development

To stop all services:

```bash
# From your host terminal
cd /path/to/project
.devcontainer/host-services.sh stop
```

## Adding New Services

To add a new service:

1. Create a new directory at the project root
2. Add necessary service code and Docker Compose configuration
3. Update the `.devcontainer/host-services.sh` script to include the new service

For more detailed information on the development container setup, see the [Dev Container README](.devcontainer/README.md).

## Development Container Setup

This project provides a development container configuration located in the `.devcontainer` folder to ensure a consistent and isolated development environment. Please follow these steps to get started:

1. Install the "Remote - Containers" extension in Visual Studio Code.
2. Open the project in VS Code and reopen it in the container by clicking the green icon in the bottom-left corner or selecting the "Remote-Containers: Reopen in Container" command.

The development container leverages the host's Docker daemon to manage required services. Use the provided script to manage these services:

- To start services, run:

```bash
cd .devcontainer
./host-services.sh start
```

- To stop services, run:

```bash
cd .devcontainer
./host-services.sh stop
```

For manual setup without using the Remote - Containers extension:

```bash
cd .devcontainer
docker compose up -d
docker exec -it dev-container bash
```

Additionally, the workspace file `whitecodes.code-workspace` in the project root configures the multi-root workspace for Visual Studio Code.

Note: The workspace configuration in `whitecodes.code-workspace` sets `nodejs-testing.envFile` to `${workspaceFolder}/admin/.env`. If your admin service is located in `admin-service`, please update this path in the workspace file accordingly.

Ensure that Docker is running on your host system before starting the container.
