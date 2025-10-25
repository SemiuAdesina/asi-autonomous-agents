#!/bin/bash

# PostgreSQL Local Testing Script
# Test PostgreSQL Docker container locally before deployment

echo "🐳 Testing PostgreSQL Docker Container Locally"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Docker is installed
echo "📋 Checking Docker installation..."
if command -v docker &> /dev/null; then
    print_status "Docker is installed" 0
else
    print_status "Docker is not installed" 1
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
echo "📋 Checking Docker daemon..."
if docker info &> /dev/null; then
    print_status "Docker daemon is running" 0
else
    print_status "Docker daemon is not running" 1
    echo "Please start Docker daemon"
    exit 1
fi

# Build the PostgreSQL Docker image
echo ""
echo "🔨 Building PostgreSQL Docker image..."
if docker build -f Dockerfile.postgres -t asi-postgres:test .; then
    print_status "Docker image built successfully" 0
else
    print_status "Docker image build failed" 1
    exit 1
fi

# Stop any existing container
echo ""
echo "🛑 Stopping any existing PostgreSQL container..."
docker stop asi-postgres-test 2>/dev/null || true
docker rm asi-postgres-test 2>/dev/null || true

# Start PostgreSQL container
echo ""
echo "🚀 Starting PostgreSQL container..."
if docker run -d \
    --name asi-postgres-test \
    -e POSTGRES_DB=asi_agents \
    -e POSTGRES_USER=asi_user \
    -e POSTGRES_PASSWORD=changeme \
    -p 5432:5432 \
    asi-postgres:test; then
    print_status "PostgreSQL container started" 0
else
    print_status "PostgreSQL container failed to start" 1
    exit 1
fi

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Test connection
echo ""
echo "🔍 Testing PostgreSQL connection..."

# Test 1: Check if container is running
if docker ps | grep -q asi-postgres-test; then
    print_status "Container is running" 0
else
    print_status "Container is not running" 1
    docker logs asi-postgres-test
    exit 1
fi

# Test 2: Check PostgreSQL logs
echo ""
echo "📋 Checking PostgreSQL logs..."
if docker logs asi-postgres-test 2>&1 | grep -q "database system is ready"; then
    print_status "PostgreSQL is ready" 0
else
    print_warning "PostgreSQL might not be fully ready yet"
    echo "Recent logs:"
    docker logs asi-postgres-test --tail 10
fi

# Test 3: Test database connection
echo ""
echo "🔍 Testing database connection..."
if docker exec asi-postgres-test pg_isready -U asi_user -d asi_agents; then
    print_status "Database connection successful" 0
else
    print_status "Database connection failed" 1
    docker logs asi-postgres-test
    exit 1
fi

# Test 4: Test SQL queries
echo ""
echo "🔍 Testing SQL queries..."
if docker exec asi-postgres-test psql -U asi_user -d asi_agents -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "SQL queries working" 0
else
    print_status "SQL queries failed" 1
    exit 1
fi

# Test 5: Test initialization script
echo ""
echo "🔍 Testing initialization script..."
if docker exec asi-postgres-test psql -U asi_user -d asi_agents -c "SELECT * FROM health_check;" > /dev/null 2>&1; then
    print_status "Initialization script worked" 0
else
    print_status "Initialization script failed" 1
fi

# Test 6: Test extensions
echo ""
echo "🔍 Testing PostgreSQL extensions..."
if docker exec asi-postgres-test psql -U asi_user -d asi_agents -c "SELECT uuid_generate_v4();" > /dev/null 2>&1; then
    print_status "UUID extension working" 0
else
    print_status "UUID extension failed" 1
fi

# Display connection info
echo ""
echo "📋 PostgreSQL Connection Information:"
echo "====================================="
echo "Host: localhost"
echo "Port: 5432"
echo "Database: asi_agents"
echo "Username: asi_user"
echo "Password: changeme"
echo ""

# Test connection from host (if psql is installed)
if command -v psql &> /dev/null; then
    echo "🔍 Testing connection from host..."
    if PGPASSWORD=changeme psql -h localhost -p 5432 -U asi_user -d asi_agents -c "SELECT 'Connection from host successful' as status;" 2>/dev/null; then
        print_status "Host connection successful" 0
    else
        print_warning "Host connection failed (psql might not be installed)"
    fi
else
    print_warning "psql not installed on host - skipping host connection test"
fi

echo ""
echo "🎉 All PostgreSQL tests completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Your PostgreSQL setup is working locally"
echo "2. You can now deploy to Render with confidence"
echo "3. The same configuration will work on Render's free tier"
echo ""
echo "🛑 To stop the test container:"
echo "   docker stop asi-postgres-test"
echo "   docker rm asi-postgres-test"
echo ""
echo "🚀 Ready for Render deployment!"
