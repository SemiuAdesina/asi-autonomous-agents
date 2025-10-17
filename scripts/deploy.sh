#!/bin/bash
# Deployment script for ASI Autonomous Agents

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
PROJECT_NAME="asi-autonomous-agents"

echo -e "${GREEN}Starting deployment to ${ENVIRONMENT}${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    if ! command_exists docker; then
        echo -e "${RED}Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        echo -e "${RED}Docker Compose is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Prerequisites check passed${NC}"
}

# Load environment variables
load_environment() {
    echo -e "${YELLOW}Loading environment variables...${NC}"
    
    if [ -f ".env.${ENVIRONMENT}" ]; then
        export $(cat .env.${ENVIRONMENT} | xargs)
        echo -e "${GREEN}Environment variables loaded from .env.${ENVIRONMENT}${NC}"
    else
        echo -e "${YELLOW}No .env.${ENVIRONMENT} file found, using defaults${NC}"
    fi
}

# Build and push Docker images
build_and_push() {
    echo -e "${YELLOW}Building and pushing Docker images...${NC}"
    
    # Build frontend
    echo -e "${YELLOW}Building frontend image...${NC}"
    docker build -t ghcr.io/${GITHUB_REPOSITORY}-frontend:${VERSION} ./frontend
    
    # Build backend
    echo -e "${YELLOW}Building backend image...${NC}"
    docker build -t ghcr.io/${GITHUB_REPOSITORY}-backend:${VERSION} ./backend
    
    # Push images
    echo -e "${YELLOW}Pushing images to registry...${NC}"
    docker push ghcr.io/${GITHUB_REPOSITORY}-frontend:${VERSION}
    docker push ghcr.io/${GITHUB_REPOSITORY}-backend:${VERSION}
    
    echo -e "${GREEN}Images built and pushed successfully${NC}"
}

# Deploy application
deploy_application() {
    echo -e "${YELLOW}Deploying application...${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    echo -e "${GREEN}Application deployed successfully${NC}"
}

# Run health checks
health_check() {
    echo -e "${YELLOW}Running health checks...${NC}"
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}Backend health check passed${NC}"
    else
        echo -e "${RED}Backend health check failed${NC}"
        exit 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}Frontend health check passed${NC}"
    else
        echo -e "${RED}Frontend health check failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}All health checks passed${NC}"
}

# Run smoke tests
smoke_tests() {
    echo -e "${YELLOW}Running smoke tests...${NC}"
    
    # Test API endpoints
    curl -f http://localhost:5000/api/agents || exit 1
    curl -f http://localhost:5000/api/health || exit 1
    
    # Test frontend
    curl -f http://localhost:3000 || exit 1
    
    echo -e "${GREEN}Smoke tests passed${NC}"
}

# Rollback function
rollback() {
    echo -e "${RED}Rolling back deployment...${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    echo -e "${YELLOW}Deployment rolled back${NC}"
}

# Main deployment flow
main() {
    echo -e "${GREEN}ASI Autonomous Agents Deployment${NC}"
    echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${GREEN}Version: ${VERSION}${NC}"
    echo ""
    
    check_prerequisites
    load_environment
    
    # Build and push images (only for production)
    if [ "$ENVIRONMENT" = "production" ]; then
        build_and_push
    fi
    
    # Deploy application
    deploy_application
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 10
    
    # Run health checks
    health_check
    
    # Run smoke tests
    smoke_tests
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}Backend API: http://localhost:5000${NC}"
}

# Handle errors
trap 'rollback' ERR

# Run main function
main "$@"