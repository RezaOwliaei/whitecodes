#!/bin/bash
set -e

ACTION=$1
PROJECT_ROOT=$(pwd)

if [ "$ACTION" != "start" ] && [ "$ACTION" != "stop" ]; then
  echo "Usage: $0 [start|stop]"
  exit 1
fi

# Make sure Docker socket has correct permissions
if [ ! -w "/var/run/docker.sock" ]; then
  echo "Docker socket is not writable. Attempting to fix permissions..."
  sudo chmod 666 /var/run/docker.sock || {
    echo "Failed to fix Docker socket permissions. Please run: sudo chmod 666 /var/run/docker.sock"
    exit 1
  }
  echo "Fixed Docker socket permissions."
fi

# Function to execute docker-compose commands
run_docker_compose() {
  SERVICE_DIR=$1
  ACTION=$2

  echo "=== $ACTION $SERVICE_DIR ==="
  cd $PROJECT_ROOT/$SERVICE_DIR

  if [ "$ACTION" == "start" ]; then
    docker compose up -d
  else
    docker compose down
  fi
}

# Process all services
if [ "$ACTION" == "start" ]; then
  echo "Starting all services on host machine..."

  # Start databases first
  run_docker_compose "core-postgres" "start"
  run_docker_compose "core-mongo" "start"
  run_docker_compose "core-kurrent" "start"
  run_docker_compose "core-vault" "start"

  # Then start application services
  run_docker_compose "admin" "start"

  echo "All services started on host machine."
else
  echo "Stopping all services on host machine..."

  # Stop application services first
  run_docker_compose "admin" "stop"

  # Then stop databases
  run_docker_compose "core-vault" "stop"
  run_docker_compose "core-kurrent" "stop"
  run_docker_compose "core-mongo" "stop"
  run_docker_compose "core-postgres" "stop"

  echo "All services stopped on host machine."
fi