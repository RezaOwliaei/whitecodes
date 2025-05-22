#!/bin/bash

# Define extensions to install
EXTENSIONS=(
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "christian-kohler.npm-intellisense"
    "christian-kohler.path-intellisense"
    "streetsidesoftware.code-spell-checker"
    "mongodb.mongodb-vscode"
    "ms-ossdata.vscode-pgsql"
    "redhat.vscode-yaml"
    "gruntfuggly.todo-tree"
    "ms-azuretools.vscode-containers"
    "connor4312.nodejs-testing"
)

# Maximum retry attempts for failed installations
MAX_RETRIES=3
# Timeout in seconds for extension installation
TIMEOUT=60

echo "Installing VS Code extensions..."

# Find the actual cursor-server or code binary
if [ -d "/vscode/cursor-server" ]; then
  # For Cursor - find the actual cursor-server binary
  CURSOR_SERVER_PATH=$(find /vscode -type f -name "cursor-server" 2>/dev/null | head -1)
  if [ -n "$CURSOR_SERVER_PATH" ]; then
    echo "Found Cursor server at: $CURSOR_SERVER_PATH"
    CMD="$CURSOR_SERVER_PATH"
  else
    echo "Could not find cursor-server binary"
    exit 1
  fi
elif [ -d "/home/vscode/.vscode-server" ]; then
  # For VS Code
  CODE_PATH=$(find /home/vscode/.vscode-server -name "code" -type f 2>/dev/null | head -1)
  if [ -n "$CODE_PATH" ]; then
    echo "Found VS Code server at: $CODE_PATH"
    CMD="$CODE_PATH"
  else
    echo "Could not find VS Code binary"
    exit 1
  fi
else
  echo "Could not find VS Code or Cursor server installation"
  exit 1
fi

# Function to check if extension is already installed
is_extension_installed() {
  local ext=$1
  $CMD --list-extensions | grep -q "^$ext$"
  return $?
}

# Function to install extension with retries
install_extension() {
  local ext=$1
  local retries=0

  # Check if already installed
  if is_extension_installed "$ext"; then
    echo "Extension '$ext' is already installed. Skipping."
    return 0
  fi

  while [ $retries -lt $MAX_RETRIES ]; do
    echo "Installing $ext (attempt $(($retries + 1))/$MAX_RETRIES)..."

    # Use timeout command to prevent hanging
    if timeout $TIMEOUT $CMD --install-extension "$ext"; then
      echo "Successfully installed $ext"
      return 0
    fi

    retries=$((retries + 1))
    if [ $retries -lt $MAX_RETRIES ]; then
      echo "Failed to install $ext. Retrying in 5 seconds..."
      sleep 5
    else
      echo "Failed to install $ext after $MAX_RETRIES attempts. Continuing with other extensions."
    fi
  done

  return 1
}

# Install each extension
failed_extensions=()
for ext in "${EXTENSIONS[@]}"; do
  if ! install_extension "$ext"; then
    failed_extensions+=("$ext")
  fi
done

echo "Extension installation completed!"

# Report any failed installations
if [ ${#failed_extensions[@]} -gt 0 ]; then
  echo "Warning: The following extensions failed to install:"
  for ext in "${failed_extensions[@]}"; do
    echo "  - $ext"
  done
  echo "You may need to install them manually or try again later."
fi