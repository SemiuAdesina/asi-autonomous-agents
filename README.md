# ASI Autonomous Agents Platform

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)
[![ASI Alliance](https://img.shields.io/badge/ASI%20Alliance-Hackathon-blue)](https://asi-alliance.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.5+-black.svg)](https://nextjs.org)
[![uAgents](https://img.shields.io/badge/uAgents-Fetch.ai-purple.svg)](https://docs.fetch.ai/agents/)

A comprehensive multi-agent system built for the ASI Alliance Hackathon, featuring intelligent agents with Chat Protocol support, MeTTa Knowledge Graph integration, and real-time communication capabilities.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Agent System](#agent-system)
10. [Frontend Components](#frontend-components)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Contributing](#contributing)
14. [License](#license)

## Overview

The ASI Autonomous Agents Platform is a sophisticated multi-agent system that demonstrates the integration of Fetch.ai uAgents framework with SingularityNET's MeTTa Knowledge Graph. The platform provides three specialized agents (Healthcare, Financial, and Logistics) that can communicate using both native Chat Protocol and HTTP APIs.

### Key Technologies

- **Backend**: Python Flask with SQLAlchemy
- **Frontend**: Next.js with React and TypeScript
- **Agents**: Fetch.ai uAgents framework
- **Knowledge Graph**: SingularityNET MeTTa
- **Real-time Communication**: WebSocket/Socket.IO
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT-based authentication
- **AI Integration**: ASI:One API integration

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Agent System  │
│   (Next.js)     │◄──►│   (Flask)       │◄──►│   (uAgents)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   Database      │    │   MeTTa KG      │
│   Real-time     │    │   (SQLite/PG)   │    │   Integration   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Agent Architecture

Each agent follows a consistent structure:

- **Agent Core**: Main agent logic with Chat Protocol support
- **Knowledge Integration**: MeTTa Knowledge Graph queries
- **AI Integration**: ASI:One API for enhanced responses
- **HTTP Server**: REST API endpoints for web integration
- **Utilities**: Helper functions and data processing

## Features

### Core Features

- **Multi-Agent System**: Three specialized agents (Healthcare, Financial, Logistics)
- **Chat Protocol**: Native uAgents communication protocol
- **MeTTa Integration**: Knowledge graph queries and reasoning
- **Real-time Communication**: WebSocket-based live updates
- **Web Interface**: Modern React-based dashboard
- **Authentication**: Secure JWT-based user management
- **API Documentation**: Comprehensive REST API

### Agent Capabilities

#### Healthcare Assistant
- Medical analysis and symptom checking
- Treatment planning and recommendations
- Drug interaction checking
- MeTTa Knowledge Graph medical queries
- ASI:One integration for enhanced medical reasoning

#### Financial Advisor
- Portfolio management and analysis
- Risk assessment and mitigation
- DeFi protocol integration
- Market analysis and trends
- Investment strategy recommendations

#### Logistics Coordinator
- Route optimization algorithms
- Inventory management systems
- Delivery tracking and monitoring
- Supply chain analysis
- Cost optimization strategies

### Frontend Features

- **Portfolio Dashboard**: Comprehensive overview of all agents
- **Chat Protocol Manager**: Session management and monitoring
- **Real-time Manager**: WebSocket connection monitoring
- **Knowledge Manager**: MeTTa query interface
- **Learning Analytics**: Agent performance metrics
- **Agent Grid**: Visual agent status and capabilities

## Prerequisites

### System Requirements

- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn package manager
- Git

### External Services

- ASI:One API key (for enhanced AI responses)
- Etherscan API key (for blockchain data)
- MeTTa Knowledge Graph server (optional, uses mock data if unavailable)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/asi-autonomous-agents.git
cd asi-autonomous-agents
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python setup_local_db.py
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Environment Configuration

Create environment files:

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:

```env
# Database
DATABASE_URL=sqlite:///instance/asi_agents.db

# JWT Secret
JWT_SECRET_KEY=your-secret-key-here

# ASI:One Integration
ASI_ONE_API_KEY=your-asi-one-api-key
ASI_BASE_URL=https://api.asi.one
ASI_MODEL=gpt-3.5-turbo

# Etherscan API
ETHERSCAN_API_KEY=your-etherscan-api-key

# MeTTa Knowledge Graph
METTA_SERVER_URL=http://localhost:8080
```

## Configuration

### Agent Configuration

Each agent can be configured through environment variables:

```env
# Healthcare Agent
HEALTHCARE_AGENT_PORT=8002
HEALTHCARE_AGENT_ADDRESS=agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl

# Financial Agent
FINANCIAL_AGENT_PORT=8003
FINANCIAL_AGENT_ADDRESS=agent1qtm6dj5n89vjda5adz223x7t7pdzle3rskugery36w4en3je67whkuke606

# Logistics Agent
LOGISTICS_AGENT_PORT=8004
LOGISTICS_AGENT_ADDRESS=agent1q09g48srfjc74zzlr80ag93qaaev7ue9vhgl2u3jgykca0trwm2hxpw66jl
```

### Database Configuration

The system supports both SQLite (development) and PostgreSQL (production):

```env
# Development (SQLite)
DATABASE_URL=sqlite:///instance/asi_agents.db

# Production (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/asi_agents
```

## Running the Application

### Development Mode

#### 1. Start Backend Services

```bash
# Terminal 1: Main Flask application
cd backend
source venv/bin/activate
python app.py

# Terminal 2: Healthcare Agent
cd backend/agents/healthcare_agent
python agent.py

# Terminal 3: Financial Agent (optional)
cd backend/agents/financial_agent
python agent.py

# Terminal 4: Logistics Agent (optional)
cd backend/agents/logistics_agent
python agent.py
```

#### 2. Start Frontend

```bash
# Terminal 5: Frontend development server
cd frontend
npm run dev
```

### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Start production backend
cd backend
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Healthcare Agent**: http://localhost:8002
- **Financial Agent**: http://localhost:8003
- **Logistics Agent**: http://localhost:8004

## API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
POST /api/auth/logout
```

### Agent Endpoints

```http
GET  /api/agents
GET  /api/agents/{agent_id}
POST /api/agents/{agent_id}/message
```

### Knowledge Graph Endpoints

```http
POST /api/knowledge/metta-query
GET  /api/knowledge/concepts
POST /api/knowledge/concepts
```

### Message Endpoints

```http
POST /api/messages
GET  /api/messages/{session_id}
POST /api/generate-response
```

### Learning Analytics Endpoints

```http
GET /api/learning/metrics
GET /api/learning/patterns
GET /api/learning/knowledge-updates
```

## Agent System

### Agent Communication

Agents communicate using two protocols:

1. **Chat Protocol**: Native uAgents communication
2. **HTTP Protocol**: REST API fallback

### Agent Lifecycle

1. **Initialization**: Agent starts and registers with coordinator
2. **Manifest Publication**: Agent capabilities published to Agentverse
3. **Session Management**: Chat sessions created and managed
4. **Message Processing**: Incoming messages processed and responded to
5. **Knowledge Integration**: MeTTa queries executed for enhanced responses

### Agent Registration

Agents automatically register with the system using their manifests:

```json
{
  "name": "Healthcare Assistant",
  "description": "AI-powered medical diagnosis and treatment recommendations",
  "capabilities": [
    "Medical Analysis",
    "Symptom Checker",
    "Treatment Planning",
    "Drug Interaction Check",
    "MeTTa Knowledge Graph",
    "ASI:One Integration"
  ],
  "protocols": ["chat", "http"],
  "address": "agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl"
}
```

## Frontend Components

### Core Components

- **PortfolioPage**: Main dashboard with agent overview
- **AgentGrid**: Visual representation of agent status
- **ChatProtocolManager**: Session management interface
- **RealtimeManager**: WebSocket monitoring dashboard
- **KnowledgeManager**: MeTTa query interface
- **LearningAnalytics**: Performance metrics visualization

### State Management

The frontend uses React Context for state management:

- **AgentContext**: Agent data and status
- **AuthContext**: User authentication state
- **Web3Context**: Blockchain integration
- **MobileMenuContext**: Responsive navigation

### Real-time Features

- **WebSocket Connection**: Live updates from backend
- **Agent Status Monitoring**: Real-time agent health checks
- **Message Notifications**: Instant chat message alerts
- **Performance Metrics**: Live analytics updates

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
python -m pytest

# Run specific test categories
python -m pytest tests/unit/
python -m pytest tests/integration/

# Run with coverage
python -m pytest --cov=. --cov-report=html
```

### Frontend Testing

```bash
cd frontend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Smoke Tests

```bash
# Run comprehensive smoke tests
python scripts/smoke_test.py
```

## Deployment

### Render Deployment (Recommended)

This project is optimized for deployment on Render.com:

1. **Backend Service**:
   - Runtime: Python 3.9+
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
   - Environment Variables: See `.env.example`

2. **Frontend Service**:
   - Runtime: Node.js 18+
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `out`
   - Environment Variables: `NEXT_PUBLIC_API_URL`

3. **Database**:
   - PostgreSQL service on Render
   - Connection string: `DATABASE_URL`

### Manual Deployment

1. **Backend Deployment**:
```bash
   cd backend
   pip install -r requirements.txt
   gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

2. **Frontend Deployment**:
```bash
   cd frontend
   npm run build
   npm start
```

3. **Agent Deployment**:
```bash
   # Deploy each agent individually
   cd backend/agents/healthcare_agent
   python agent.py
   ```

### Environment Variables for Production

```env
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET_KEY=production-secret-key
ASI_ONE_API_KEY=production-api-key
```

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- **Python**: Follow PEP 8 guidelines
- **TypeScript**: Use strict type checking
- **Testing**: Maintain >80% code coverage
- **Documentation**: Update README for new features

### Pull Request Process

1. Ensure all tests pass
2. Update documentation
3. Add appropriate labels
4. Request review from maintainers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

## Acknowledgments

- Fetch.ai for the uAgents framework
- SingularityNET for MeTTa Knowledge Graph
- ASI Alliance for the hackathon opportunity
- All contributors and testers

---

**Note**: This project was developed for the ASI Alliance Hackathon and demonstrates advanced multi-agent system capabilities with real-world applications in healthcare, finance, and logistics.