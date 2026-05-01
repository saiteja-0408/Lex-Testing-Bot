# ============================================================================
# Lex Web UI - Makefile
# ============================================================================
# Common build, deployment, and development commands
# Usage: make [target]
# ============================================================================

.PHONY: help install setup clean dev test build deploy logs

# Color codes for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)  LEX WEB UI - Available Commands$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(GREEN)Setup & Installation$(NC)"
	@echo "  make install         - Install all dependencies"
	@echo "  make setup           - Complete project setup (install + env + docker)"
	@echo "  make clean           - Remove build artifacts and node_modules"
	@echo ""
	@echo "$(GREEN)Development$(NC)"
	@echo "  make dev             - Start all services (API + Web + DB)"
	@echo "  make dev-api         - Start API server only"
	@echo "  make dev-web         - Start web app only"
	@echo "  make dev-db          - Start database services (Postgres + Redis)"
	@echo "  make logs            - View logs from all services"
	@echo ""
	@echo "$(GREEN)Testing$(NC)"
	@echo "  make test            - Run all tests"
	@echo "  make test-web        - Run web component tests"
	@echo "  make test-server     - Run server tests"
	@echo "  make test-coverage   - Generate coverage reports"
	@echo ""
	@echo "$(GREEN)Code Quality$(NC)"
	@echo "  make lint            - Run ESLint"
	@echo "  make lint-fix        - Fix ESLint issues"
	@echo "  make format          - Format code with Prettier"
	@echo ""
	@echo "$(GREEN)Build & Deployment$(NC)"
	@echo "  make build           - Build for production"
	@echo "  make build-web       - Build web bundle"
	@echo "  make build-server    - Build server"
	@echo "  make docker-build    - Build Docker images"
	@echo "  make deploy-staging  - Deploy to staging"
	@echo "  make deploy-prod     - Deploy to production"
	@echo ""
	@echo "$(GREEN)Docker$(NC)"
	@echo "  make docker-up       - Start Docker containers"
	@echo "  make docker-down     - Stop Docker containers"
	@echo "  make docker-logs     - View Docker logs"
	@echo ""

# ============================================================================
# Setup & Installation
# ============================================================================

install:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install
	npm install -w src/web
	npm install -w src/server
	@echo "$(GREEN)✓ Installation complete$(NC)"

setup: install
	@echo "$(BLUE)Setting up project...$(NC)"
	@test -f .env || cp .env.example .env
	@echo "$(GREEN)✓ Environment file created (update with your values)$(NC)"
	@make docker-build
	@echo "$(GREEN)✓ Project setup complete$(NC)"

clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf src/*/dist src/*/build src/*/node_modules
	rm -rf build coverage logs
	@make docker-down
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

# ============================================================================
# Development
# ============================================================================

dev:
	@echo "$(BLUE)Starting all services...$(NC)"
	docker-compose up

dev-api:
	@echo "$(BLUE)Starting API server...$(NC)"
	npm run dev -w src/server

dev-web:
	@echo "$(BLUE)Starting web app...$(NC)"
	npm run dev -w src/web

dev-db:
	@echo "$(BLUE)Starting database services...$(NC)"
	docker-compose up postgres redis

logs:
	@docker-compose logs -f

# ============================================================================
# Testing
# ============================================================================

test:
	@echo "$(BLUE)Running all tests...$(NC)"
	npm run test

test-web:
	@echo "$(BLUE)Running web tests...$(NC)"
	npm run test -w src/web

test-server:
	@echo "$(BLUE)Running server tests...$(NC)"
	npm run test -w src/server

test-coverage:
	@echo "$(BLUE)Generating coverage reports...$(NC)"
	npm run test:coverage

# ============================================================================
# Code Quality
# ============================================================================

lint:
	@echo "$(BLUE)Running ESLint...$(NC)"
	npm run lint

lint-fix:
	@echo "$(BLUE)Fixing ESLint issues...$(NC)"
	npm run lint:fix

format:
	@echo "$(BLUE)Formatting code...$(NC)"
	npm run format

# ============================================================================
# Build & Deployment
# ============================================================================

build: lint test
	@echo "$(BLUE)Building for production...$(NC)"
	npm run build

build-web:
	@echo "$(BLUE)Building web bundle...$(NC)"
	npm run build -w src/web

build-server:
	@echo "$(BLUE)Building server...$(NC)"
	npm run build -w src/server

docker-build:
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build

deploy-staging: build
	@echo "$(BLUE)Deploying to staging...$(NC)"
	bash ./scripts/deploy-staging.sh
	@echo "$(GREEN)✓ Staging deployment complete$(NC)"

deploy-prod: build
	@echo "$(RED)⚠ Deploying to production...$(NC)"
	@echo "$(RED)  This action cannot be undone. Press Ctrl+C to cancel.$(NC)"
	@sleep 3
	bash ./scripts/deploy-prod.sh
	@echo "$(GREEN)✓ Production deployment complete$(NC)"

# ============================================================================
# Docker
# ============================================================================

docker-up:
	@echo "$(BLUE)Starting Docker services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services running$(NC)"

docker-down:
	@echo "$(BLUE)Stopping Docker services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

docker-logs:
	@docker-compose logs -f
