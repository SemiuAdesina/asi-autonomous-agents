-- ASI Autonomous Agents Database Initialization Script
-- This script creates the database schema and initial data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'maintenance', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_sender_type AS ENUM ('user', 'agent', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'ended', 'timeout');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    profile_data JSONB DEFAULT '{}'::jsonb
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    capabilities JSONB DEFAULT '[]'::jsonb,
    status agent_status DEFAULT 'active',
    agent_type VARCHAR(50) NOT NULL,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agent_metadata JSONB DEFAULT '{}'::jsonb,
    health_score DECIMAL(3,2) DEFAULT 1.00 CHECK (health_score >= 0 AND health_score <= 1)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    sender_type message_sender_type NOT NULL,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_type VARCHAR(20) DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0
);

-- Knowledge Graph table
CREATE TABLE IF NOT EXISTS knowledge_graph (
    id SERIAL PRIMARY KEY,
    concept VARCHAR(200) NOT NULL,
    definition TEXT,
    domain VARCHAR(100),
    relationships JSONB DEFAULT '{}'::jsonb,
    source VARCHAR(100),
    confidence_score DECIMAL(3,2) DEFAULT 0.80 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}'
);

-- Agent Sessions table
CREATE TABLE IF NOT EXISTS agent_sessions (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    status session_status DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    agent_metadata JSONB DEFAULT '{}'::jsonb,
    interaction_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0 -- in seconds
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    status transaction_status DEFAULT 'pending',
    gas_used INTEGER,
    gas_price BIGINT,
    block_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agent_metadata JSONB DEFAULT '{}'::jsonb,
    network VARCHAR(20) DEFAULT 'ethereum',
    value DECIMAL(36,18) DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_agents_owner_id ON agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_agents_last_seen ON agents(last_seen);

CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_type);

CREATE INDEX IF NOT EXISTS idx_knowledge_concept ON knowledge_graph(concept);
CREATE INDEX IF NOT EXISTS idx_knowledge_domain ON knowledge_graph(domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_confidence ON knowledge_graph(confidence_score);
CREATE INDEX IF NOT EXISTS idx_knowledge_created_at ON knowledge_graph(created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON agent_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON agent_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_transactions_agent_id ON transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_search ON knowledge_graph USING gin(to_tsvector('english', concept || ' ' || COALESCE(definition, '')));
CREATE INDEX IF NOT EXISTS idx_messages_search ON messages USING gin(to_tsvector('english', content));

-- Insert sample data
INSERT INTO users (username, email, password_hash, wallet_address) VALUES
('admin', 'admin@asi-agents.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', '0x1234567890123456789012345678901234567890'),
('demo_user', 'demo@asi-agents.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', '0x0987654321098765432109876543210987654321')
ON CONFLICT (email) DO NOTHING;

INSERT INTO agents (name, address, description, agent_type, owner_id, capabilities) VALUES
('Healthcare Agent', '0xhealth123456789012345678901234567890123456', 'Specialized in medical diagnosis and treatment recommendations', 'healthcare', 1, '["diagnosis", "treatment", "symptom_analysis"]'),
('Finance Agent', '0xfinance123456789012345678901234567890123456', 'Handles financial analysis and investment recommendations', 'finance', 1, '["portfolio_management", "risk_assessment", "market_analysis"]'),
('Logistics Agent', '0xlogistics123456789012345678901234567890123456', 'Optimizes supply chain and logistics operations', 'logistics', 1, '["route_optimization", "inventory_management", "supply_chain"]')
ON CONFLICT (address) DO NOTHING;

INSERT INTO knowledge_graph (concept, definition, domain, confidence_score, source) VALUES
('artificial_intelligence', 'The simulation of human intelligence in machines that are programmed to think and learn', 'technology', 0.95, 'wikipedia'),
('blockchain', 'A distributed ledger technology that maintains a continuously growing list of records', 'technology', 0.90, 'academic_paper'),
('machine_learning', 'A subset of artificial intelligence that enables computers to learn without being explicitly programmed', 'technology', 0.92, 'textbook'),
('decentralized_finance', 'Financial services built on blockchain technology that operate without traditional intermediaries', 'finance', 0.88, 'whitepaper'),
('supply_chain', 'The network of organizations, people, activities, and resources involved in delivering products to consumers', 'logistics', 0.85, 'industry_report')
ON CONFLICT DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW active_agents AS
SELECT a.*, u.username as owner_name
FROM agents a
LEFT JOIN users u ON a.owner_id = u.id
WHERE a.status = 'active';

CREATE OR REPLACE VIEW recent_messages AS
SELECT m.*, a.name as agent_name, u.username as user_name
FROM messages m
LEFT JOIN agents a ON m.agent_id = a.id
LEFT JOIN users u ON m.user_id = u.id
WHERE m.timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY m.timestamp DESC;

CREATE OR REPLACE VIEW session_stats AS
SELECT 
    s.agent_id,
    a.name as agent_name,
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_sessions,
    AVG(s.interaction_count) as avg_interactions,
    AVG(s.total_duration) as avg_duration
FROM agent_sessions s
JOIN agents a ON s.agent_id = a.id
GROUP BY s.agent_id, a.name;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO asi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO asi_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO asi_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO asi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO asi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO asi_user;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for knowledge_graph table
CREATE TRIGGER update_knowledge_graph_updated_at 
    BEFORE UPDATE ON knowledge_graph 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to generate session IDs
CREATE OR REPLACE FUNCTION generate_session_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'session_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate agent health score
CREATE OR REPLACE FUNCTION calculate_agent_health(agent_id INTEGER)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    health_score DECIMAL(3,2) := 1.00;
    last_seen_hours INTEGER;
    error_count INTEGER;
    active_sessions INTEGER;
BEGIN
    -- Check last seen time
    SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_seen))/3600 
    INTO last_seen_hours
    FROM agents WHERE id = agent_id;
    
    -- Reduce health based on time since last seen
    IF last_seen_hours > 24 THEN
        health_score := health_score - 0.3;
    ELSIF last_seen_hours > 12 THEN
        health_score := health_score - 0.1;
    END IF;
    
    -- Check for recent errors
    SELECT COUNT(*) INTO error_count
    FROM messages 
    WHERE agent_id = agent_id 
    AND message_type = 'error' 
    AND timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 hour';
    
    health_score := health_score - (error_count * 0.1);
    
    -- Check active sessions
    SELECT COUNT(*) INTO active_sessions
    FROM agent_sessions 
    WHERE agent_id = agent_id 
    AND status = 'active';
    
    IF active_sessions > 10 THEN
        health_score := health_score - 0.2;
    END IF;
    
    -- Ensure health score is between 0 and 1
    RETURN GREATEST(0.00, LEAST(1.00, health_score));
END;
$$ LANGUAGE plpgsql;

COMMENT ON DATABASE asi_agents IS 'ASI Autonomous Agents Platform Database';
COMMENT ON TABLE users IS 'User accounts and authentication data';
COMMENT ON TABLE agents IS 'Autonomous agent definitions and metadata';
COMMENT ON TABLE messages IS 'Communication between users and agents';
COMMENT ON TABLE knowledge_graph IS 'Knowledge base concepts and relationships';
COMMENT ON TABLE agent_sessions IS 'Active agent interaction sessions';
COMMENT ON TABLE transactions IS 'Blockchain transaction records';
