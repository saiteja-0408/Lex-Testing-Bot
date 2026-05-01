#!/bin/bash

# ============================================================================
# Lex Web UI - Project Setup Script
# ============================================================================
# Automated setup for local development environment
# Usage: bash ./scripts/setup.sh
# ============================================================================

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Utility functions
print_header() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
  print_header "Checking Prerequisites"

  # Check Node.js
  if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
  fi
  NODE_VERSION=$(node -v)
  print_success "Node.js $NODE_VERSION"

  # Check npm
  if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
  fi
  NPM_VERSION=$(npm -v)
  print_success "npm $NPM_VERSION"

  # Check Docker (optional)
  if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker -v)
    print_success "$DOCKER_VERSION"
  else
    print_warning "Docker not found - skipping Docker setup"
    SKIP_DOCKER=true
  fi

  # Check Git
  if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
  fi
  print_success "Git installed"
}

# Setup environment file
setup_env() {
  print_header "Setting Up Environment"

  if [ -f .env ]; then
    print_warning ".env file already exists"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_info "Skipping .env setup"
      return
    fi
  fi

  if [ -f .env.example ]; then
    cp .env.example .env
    print_success ".env file created from .env.example"
    print_warning "IMPORTANT: Update .env with your AWS credentials and config"
  else
    print_error ".env.example not found"
    exit 1
  fi
}

# Install dependencies
install_dependencies() {
  print_header "Installing Dependencies"

  print_info "Installing root dependencies..."
  npm install
  print_success "Root dependencies installed"

  print_info "Installing web app dependencies..."
  npm install -w src/web
  print_success "Web app dependencies installed"

  print_info "Installing server dependencies..."
  npm install -w src/server
  print_success "Server dependencies installed"
}

# Setup Git hooks
setup_git_hooks() {
  print_header "Setting Up Git Hooks"

  if [ -d .git ]; then
    npm run prepare 2>/dev/null || true
    print_success "Git hooks configured"
  else
    print_info "Not a Git repository - skipping hooks setup"
  fi
}

# Setup Docker (optional)
setup_docker() {
  if [ "$SKIP_DOCKER" = true ]; then
    print_warning "Skipping Docker setup"
    return
  fi

  print_header "Setting Up Docker"

  if [ ! -f docker-compose.yml ]; then
    print_error "docker-compose.yml not found"
    return
  fi

  print_info "Building Docker images..."
  docker-compose build
  print_success "Docker images built"
}

# Create logs directory
setup_logs() {
  print_header "Setting Up Logs"

  mkdir -p logs
  print_success "Logs directory created"
}

# Create database migrations directory
setup_database() {
  print_header "Setting Up Database"

  mkdir -p src/server/migrations
  mkdir -p src/server/seeds
  print_success "Database directories created"
}

# Print next steps
print_next_steps() {
  print_header "Setup Complete! 🎉"

  echo "Next steps:"
  echo ""
  echo "1. Update your AWS credentials:"
  echo "   ${BLUE}vim .env${NC}"
  echo ""
  echo "2. Start development environment:"
  echo "   ${BLUE}make dev${NC}"
  echo "   OR (without Docker):"
  echo "   ${BLUE}npm run dev${NC}"
  echo ""
  echo "3. Open browser:"
  echo "   ${BLUE}http://localhost:3001${NC}"
  echo ""
  echo "For more commands, run:"
  echo "   ${BLUE}make help${NC}"
  echo ""
}

# Main execution
main() {
  echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║                  LEX WEB UI - Setup Script                     ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

  check_prerequisites
  setup_env
  install_dependencies
  setup_git_hooks
  setup_logs
  setup_database
  setup_docker
  print_next_steps
}

# Run main function
main "$@"
