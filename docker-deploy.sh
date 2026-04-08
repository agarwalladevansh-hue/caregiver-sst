#!/bin/bash

# CareMatch RL - Docker Build and Deployment Script

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
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

# Check Docker installation
check_docker() {
    print_header "Checking Docker Installation"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Please install Docker from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker is installed"
    docker --version
    docker-compose --version
}

# Build images
build_images() {
    print_header "Building Docker Images"
    
    if [ -f "carematch_ppo.zip" ]; then
        print_success "Found trained model: carematch_ppo.zip"
    else
        print_warning "Model file not found. Backend will use fallback heuristic."
    fi
    
    echo ""
    echo "Building backend image..."
    docker build -t carematch-backend:latest ./backend
    print_success "Backend image built"
    
    echo ""
    echo "Building frontend image..."
    docker build -t carematch-frontend:latest ./frontend
    print_success "Frontend image built"
}

# Start services
start_services() {
    print_header "Starting Services"
    
    echo "Using docker-compose to start all services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    echo ""
    echo "Waiting for services to be healthy..."
    sleep 5
    
    # Check status
    echo ""
    docker-compose ps
    
    print_success "Services started successfully!"
}

# Show access info
show_info() {
    print_header "CareMatch RL is Running!"
    
    echo ""
    echo -e "${GREEN}Access Your Application:${NC}"
    echo "  Frontend:  http://localhost"
    echo "  Backend:   http://localhost/api"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo "  View logs:      docker-compose logs -f"
    echo "  Stop services:  docker-compose down"
    echo "  Rebuild:        docker-compose up --build"
    echo ""
    echo -e "${GREEN}Troubleshooting:${NC}"
    echo "  Backend logs:   docker-compose logs backend"
    echo "  Frontend logs:  docker-compose logs frontend"
    echo "  Health check:   docker-compose ps"
    echo ""
}

# Main menu
show_menu() {
    echo ""
    echo "CareMatch RL - Docker Management"
    echo "================================"
    echo "1) Full Setup (Build & Run)"
    echo "2) Build Images Only"
    echo "3) Start Services"
    echo "4) Stop Services"
    echo "5) View Logs"
    echo "6) Rebuild from Scratch"
    echo "7) Exit"
    echo ""
}

# Process menu choice
process_choice() {
    case $1 in
        1)
            check_docker
            build_images
            start_services
            show_info
            ;;
        2)
            check_docker
            build_images
            ;;
        3)
            check_docker
            start_services
            show_info
            ;;
        4)
            print_header "Stopping Services"
            docker-compose down
            print_success "Services stopped"
            ;;
        5)
            docker-compose logs -f
            ;;
        6)
            print_header "Full Rebuild"
            docker-compose down
            docker system prune -f
            build_images
            start_services
            show_info
            ;;
        7)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
}

# Main script
main() {
    # If argument provided, use it
    if [ $# -gt 0 ]; then
        process_choice $1
        return
    fi
    
    # Otherwise show menu
    while true; do
        show_menu
        read -p "Enter your choice (1-7): " choice
        process_choice $choice
    done
}

# Run main
main "$@"
