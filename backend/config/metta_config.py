# MeTTa Knowledge Graph Server Configuration
# This file contains configuration for the MeTTa Knowledge Graph server

# Server Configuration
METTA_SERVER_HOST = "localhost"
METTA_SERVER_PORT = 8080
METTA_SERVER_URL = "http://localhost:8080"

# Database Configuration for MeTTa
METTA_DB_HOST = "localhost"
METTA_DB_PORT = 5432
METTA_DB_NAME = "metta_kg"
METTA_DB_USER = "metta_user"
METTA_DB_PASSWORD = "metta_password"

# Redis Configuration for MeTTa Caching
METTA_REDIS_HOST = "localhost"
METTA_REDIS_PORT = 6379
METTA_REDIS_DB = 1

# MeTTa API Configuration
METTA_API_TIMEOUT = 30
METTA_API_RETRIES = 3
METTA_API_RETRY_DELAY = 1

# Knowledge Graph Settings
METTA_MAX_CONCEPTS_PER_QUERY = 100
METTA_MAX_RELATIONSHIPS_PER_CONCEPT = 50
METTA_DEFAULT_CONFIDENCE_THRESHOLD = 0.7

# Logging Configuration
METTA_LOG_LEVEL = "INFO"
METTA_LOG_FILE = "logs/metta_server.log"

# Security Configuration
METTA_API_KEY = "metta-api-key-change-in-production"
METTA_CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5001"]

# Performance Configuration
METTA_CACHE_TTL = 3600  # 1 hour
METTA_MAX_CONCURRENT_QUERIES = 10
METTA_QUERY_TIMEOUT = 30
