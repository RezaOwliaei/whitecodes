#!/bin/bash

# ================================
# Docker Helper Scripts
# ================================
# Common Docker commands for admin-service development workflows

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# === Helper Functions ===

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# === Main Functions ===

# Build development image
build_dev() {
    print_info "Building development image..."
    docker compose build --build-arg ENV=dev system-admin
    print_success "Development image built successfully"
}

# Build production image
build_prod() {
    print_info "Building production image..."
    docker compose build --build-arg ENV=prod system-admin
    print_success "Production image built successfully"
}

# Start development environment
start_dev() {
    print_info "Starting development environment..."
    docker compose up -d system-admin
    print_success "Development environment started"
    print_info "Logs: docker compose logs -f system-admin"
    print_info "Health: curl http://localhost:3000/api/v1/health"
}

# Stop all services
stop_all() {
    print_info "Stopping all services..."
    docker compose down
    print_success "All services stopped"
}

# Clean up Docker resources
cleanup() {
    print_warning "This will remove all stopped containers, unused networks, and dangling images"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up Docker resources..."
        docker system prune -f
        print_success "Cleanup completed"
    else
        print_info "Cleanup cancelled"
    fi
}

# View service logs
logs() {
    local service="${1:-system-admin}"
    print_info "Showing logs for $service..."
    docker compose logs -f "$service"
}

# Execute command inside container
exec_sh() {
    local service="${1:-system-admin}"
    print_info "Opening shell in $service container..."
    docker compose exec "$service" /bin/bash
}

# Health check
health_check() {
    local port="${SERVER_CONFIGS_PORT:-3000}"
    print_info "Checking health status..."

    if curl -s "http://localhost:$port/api/v1/health" > /dev/null; then
        print_success "Service is healthy"
        curl -s "http://localhost:$port/api/v1/health" | jq '.'
    else
        print_error "Service is not responding"
        exit 1
    fi
}

# Restart service
restart() {
    local service="${1:-system-admin}"
    print_info "Restarting $service..."
    docker compose restart "$service"
    print_success "$service restarted"
}

# === Script Entry Point ===

case "${1:-help}" in
    build-dev|bd)
        build_dev
        ;;
    build-prod|bp)
        build_prod
        ;;
    start|up)
        start_dev
        ;;
    stop|down)
        stop_all
        ;;
    restart|rs)
        restart "${2:-system-admin}"
        ;;
    logs|l)
        logs "${2:-system-admin}"
        ;;
    exec|sh)
        exec_sh "${2:-system-admin}"
        ;;
    health|h)
        health_check
        ;;
    cleanup|clean)
        cleanup
        ;;
    help|--help|-h)
        echo "Docker Helper Scripts for Admin Service"
        echo ""
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commands:"
        echo "  build-dev, bd       Build development image"
        echo "  build-prod, bp      Build production image"
        echo "  start, up           Start development environment"
        echo "  stop, down          Stop all services"
        echo "  restart, rs [svc]   Restart service (default: system-admin)"
        echo "  logs, l [svc]       View service logs (default: system-admin)"
        echo "  exec, sh [svc]      Execute shell in container (default: system-admin)"
        echo "  health, h           Check service health"
        echo "  cleanup, clean      Clean up Docker resources"
        echo "  help, --help, -h    Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 build-dev       # Build development image"
        echo "  $0 start           # Start development environment"
        echo "  $0 logs            # View admin service logs"
        echo "  $0 health          # Check service health"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' to see available commands"
        exit 1
        ;;
esac