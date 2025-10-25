-- PostgreSQL Database Initialization Script
-- This script runs when the database container starts for the first time

-- Create the main database (if not exists)
-- Note: POSTGRES_DB environment variable already creates this

-- Create additional schemas if needed
CREATE SCHEMA IF NOT EXISTS public;

-- Set up proper permissions
GRANT ALL PRIVILEGES ON DATABASE asi_agents TO asi_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO asi_user;

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a simple test table to verify the setup
CREATE TABLE IF NOT EXISTS public.health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test record
INSERT INTO public.health_check (status) VALUES ('database_initialized') ON CONFLICT DO NOTHING;

-- Grant permissions on the test table
GRANT ALL PRIVILEGES ON TABLE public.health_check TO asi_user;
GRANT USAGE, SELECT ON SEQUENCE public.health_check_id_seq TO asi_user;
