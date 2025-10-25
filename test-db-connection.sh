#!/bin/bash

# PostgreSQL Database Connection Test Script
# This script tests the database connection after deployment

echo "🔍 Testing PostgreSQL Database Connection..."
echo "=========================================="

# Database connection parameters
DB_HOST="asi-database"
DB_PORT="5432"
DB_NAME="asi_agents"
DB_USER="asi_user"
DB_PASSWORD="changeme"

# Test connection
echo "📋 Testing connection to $DB_HOST:$DB_PORT..."
echo "📋 Database: $DB_NAME"
echo "📋 User: $DB_USER"
echo ""

# Test basic connectivity
if pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo "✅ Database server is responding"
else
    echo "❌ Database server is not responding"
    exit 1
fi

# Test database connection
echo ""
echo "📋 Testing database connection..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Test table access
echo ""
echo "📋 Testing table access..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT * FROM health_check LIMIT 1;" > /dev/null 2>&1; then
    echo "✅ Table access successful"
else
    echo "❌ Table access failed"
    exit 1
fi

echo ""
echo "🎉 All database tests passed!"
echo "✅ PostgreSQL database is ready for use"
