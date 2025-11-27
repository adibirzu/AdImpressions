.PHONY: help install clean build start test seed dev docker-up docker-down docker-build logs

# Colors for terminal output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)AdImpressions - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

install: ## Install all dependencies (root, backend, frontend)
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)Installing backend dependencies...$(NC)"
	cd backend && npm install
	@echo "$(GREEN)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)All dependencies installed successfully!$(NC)"

clean: ## Remove all node_modules and build artifacts
	@echo "$(YELLOW)Cleaning project...$(NC)"
	rm -rf node_modules
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf backend/dist
	rm -rf frontend/build
	@echo "$(GREEN)Project cleaned!$(NC)"

build: ## Build both backend and frontend for production
	@echo "$(BLUE)Building backend...$(NC)"
	cd backend && npm run build
	@echo "$(BLUE)Building frontend...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)Build completed!$(NC)"

start: ## Start both backend and frontend in development mode
	@echo "$(BLUE)Starting AdImpressions...$(NC)"
	npm start

dev: start ## Alias for start command

start-backend: ## Start only the backend server
	@echo "$(BLUE)Starting backend server...$(NC)"
	cd backend && npm run dev

start-frontend: ## Start only the frontend development server
	@echo "$(BLUE)Starting frontend server...$(NC)"
	cd frontend && npm start

test: ## Run all tests (backend and frontend)
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && npm test
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd frontend && npm test -- --watchAll=false
	@echo "$(GREEN)All tests completed!$(NC)"

test-backend: ## Run only backend tests
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && npm test

test-frontend: ## Run only frontend tests
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd frontend && npm test -- --watchAll=false

seed: ## Seed the database with sample data
	@echo "$(BLUE)Seeding database...$(NC)"
	cd backend && npm run seed
	@echo "$(GREEN)Database seeded successfully!$(NC)"

lint: ## Run linting for backend and frontend
	@echo "$(BLUE)Linting backend...$(NC)"
	cd backend && npm run lint || true
	@echo "$(BLUE)Linting frontend...$(NC)"
	cd frontend && npm run lint || true
	@echo "$(GREEN)Linting completed!$(NC)"

docker-build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)Docker images built!$(NC)"

docker-up: ## Start application using Docker Compose
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Containers started!$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3001$(NC)"

docker-down: ## Stop Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)Containers stopped!$(NC)"

docker-logs: ## Show Docker container logs
	docker-compose logs -f

docker-restart: docker-down docker-up ## Restart Docker containers

docker-clean: ## Remove Docker containers, images, and volumes
	@echo "$(RED)Cleaning Docker resources...$(NC)"
	docker-compose down -v --rmi all
	@echo "$(GREEN)Docker resources cleaned!$(NC)"

status: ## Show the status of the application
	@echo "$(BLUE)Checking application status...$(NC)"
	@echo ""
	@if docker-compose ps | grep -q "Up"; then \
		echo "$(GREEN)Docker containers are running:$(NC)"; \
		docker-compose ps; \
	else \
		echo "$(YELLOW)Docker containers are not running$(NC)"; \
	fi
	@echo ""

setup: install seed ## Complete setup: install dependencies and seed database
	@echo "$(GREEN)Setup completed! Run 'make start' to begin development.$(NC)"

prod-start: ## Start backend in production mode
	@echo "$(BLUE)Starting backend in production mode...$(NC)"
	cd backend && npm start

all: clean install build test ## Clean, install, build, and test everything
	@echo "$(GREEN)All tasks completed successfully!$(NC)"
