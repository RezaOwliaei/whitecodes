#!/bin/bash
set -e

DOCKER_SOCKET="/var/run/docker.sock"

echo "Checking Docker socket permissions..."

if [ ! -e "$DOCKER_SOCKET" ]; then
  echo "Error: Docker socket not found at $DOCKER_SOCKET"
  echo "Make sure Docker is running on your host system."
  exit 1
fi

if [ ! -w "$DOCKER_SOCKET" ]; then
  echo "Docker socket is not writable. Fixing permissions..."
  
  # Try without sudo first, then with sudo if needed
  chmod 666 "$DOCKER_SOCKET" 2>/dev/null || sudo chmod 666 "$DOCKER_SOCKET" || {
    echo "Failed to fix Docker socket permissions."
    echo "Please run manually: sudo chmod 666 $DOCKER_SOCKET"
    exit 1
  }
  
  echo "Docker socket permissions fixed."
else
  echo "Docker socket permissions are already correct."
fi

# Verify Docker is working
echo "Testing Docker connection..."
docker info >/dev/null 2>&1 || {
  echo "Error: Failed to connect to Docker daemon."
  echo "Please make sure Docker is running and permissions are set correctly."
  exit 1
}

echo "Docker is accessible and working correctly." 