# ASI Autonomous Agents Platform

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)

A comprehensive decentralized AI ecosystem built with ASI Alliance technologies, featuring autonomous agents that perceive, reason, and act across Web3 systems.

## Overview

The ASI Autonomous Agents Platform demonstrates the power of autonomous AI agents in a decentralized ecosystem. Built with uAgents framework, integrated with MeTTa Knowledge Graph, and deployed on Agentverse, this platform showcases the future of decentralized AI applications.

## Key Features

- **Autonomous AI Agents**: Healthcare, Financial, and Logistics agents with specialized capabilities
- **Real-time Communication**: Agent-to-agent messaging and user-agent interaction via Socket.IO
- **Knowledge Integration**: MeTTa Knowledge Graph for structured reasoning and enhanced responses
- **Web3 Connectivity**: Wallet integration with MetaMask and Phantom support
- **DeFi Integration**: Real-time DeFi protocol data and portfolio management
- **Modern UI**: Cyber-themed responsive design with Tailwind CSS and Framer Motion
- **Cross-agent Collaboration**: Agents working together across domains
- **Chat Protocol**: ASI:One compatibility for seamless agent communication

## Technology Stack

### Frontend Technologies
- **Next.js 14** with React 18 and TypeScript
- **Tailwind CSS** with custom cyber-themed styling and glowing effects
- **Framer Motion** and **React Spring** for smooth animations
- **FontAwesome**, **Lucide React**, **React Icons** for comprehensive iconography
- **Web3.js**, **Wagmi**, **RainbowKit** for blockchain integration
- **React Toastify** for Web3-specific notifications
- **Matrix Background** component for immersive cyber aesthetics

### Backend Technologies
- **Flask** with Socket.IO for real-time communication
- **PostgreSQL** with SQLAlchemy ORM for data persistence
- **Redis** for caching and session management
- **Celery** for background task processing
- **JWT** authentication with Flask-JWT-Extended
- **uAgents Framework** for autonomous agent implementation
- **Flask-Migrate** for database migrations
- **Flask-CORS** for cross-origin requests

### ASI Alliance Technologies
- **uAgents Framework**: Core agent implementation with Chat Protocol
- **MeTTa Knowledge Graph**: Structured knowledge access from SingularityNET
- **Agentverse**: Agent registry and orchestration platform
- **Chat Protocol**: ASI:One compatibility for agent communication
- **Fetch.ai Infrastructure**: Decentralized execution environment

### Web3 Integration
- **Ethereum** and **Polygon** network support
- **MetaMask** and **Phantom** wallet integration
- **DeFi Protocols**: Uniswap, Compound, Aave, Curve, Yearn, Lido integration
- **Smart Contracts**: Agent deployment and interaction
- **Wallet State Persistence**: localStorage for maintaining connections

## Project Structure

```
asi-autonomous-agents/
├── frontend/                    # Next.js React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── AgentChat.tsx   # Real-time agent communication
│   │   │   ├── AgentGrid.tsx   # Agent discovery and display
│   │   │   ├── DeFiProtocols.tsx # DeFi protocol integration
│   │   │   ├── PortfolioDashboard.tsx # Portfolio management
│   │   │   ├── Web3Integration.tsx # Web3 wallet integration
│   │   │   ├── MatrixBackground.tsx # Cyber-themed background
│   │   │   └── ...             # Other UI components
│   │   ├── contexts/           # React contexts
│   │   │   ├── AgentContext.tsx # Agent state management
│   │   │   ├── Web3Context.tsx # Web3 wallet management
│   │   │   └── MobileMenuContext.tsx # Mobile menu state
│   │   ├── pages/             # Next.js pages and API routes
│   │   │   ├── api/
│   │   │   │   ├── defi-data.ts # DeFi protocol data API
│   │   │   │   ├── portfolio-data.ts # Portfolio data API
│   │   │   │   ├── discover-agents.ts # Agent discovery API
│   │   │   │   └── generate-response.ts # Agent response API
│   │   │   └── index.tsx       # Main application page
│   │   └── services/          # API services
│   │       ├── agentCommunication.ts # Agent communication service
│   │       └── blockchain.ts  # Blockchain interaction service
│   ├── package.json           # Frontend dependencies
│   └── Dockerfile            # Frontend container
├── backend/                     # Flask API server
│   ├── agents/                 # uAgents implementations
│   │   ├── healthcare_agent/   # Healthcare Assistant
│   │   │   └── main.py        # Healthcare agent with MeTTa integration
│   │   ├── logistics_agent/    # Logistics Coordinator
│   │   │   └── main.py        # Logistics agent with supply chain optimization
│   │   └── financial_agent/    # Financial Advisor
│   │       └── main.py         # Financial agent with DeFi integration
│   ├── knowledge/              # MeTTa Knowledge Graph integration
│   │   └── metta_kg/
│   │       └── integration.py # MeTTa Knowledge Graph client
│   ├── routes/                # API endpoints
│   │   ├── agents.py          # Agent management endpoints
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── messages.py        # Message handling endpoints
│   │   └── knowledge.py       # Knowledge graph endpoints
│   ├── tests/                 # Comprehensive test suite
│   │   ├── unit/              # Unit tests
│   │   └── integration/       # Integration tests
│   ├── models.py              # Database models (User, Agent, Message, etc.)
│   ├── app.py                 # Flask application with Socket.IO
│   ├── metta_server.py        # MeTTa Knowledge Graph server
│   ├── run_agents.py          # Agent orchestration script
│   ├── deploy_agents.py       # Agent deployment script
│   └── requirements.txt       # Backend dependencies
├── scripts/                    # Deployment and utility scripts
│   └── deploy.sh              # Production deployment script
├── .github/workflows/          # CI/CD pipelines
│   ├── integration-tests.yml  # Integration testing workflow
│   ├── deploy.yml             # Deployment workflow
│   └── security-quality.yml   # Security and quality checks
├── docker-compose.yml          # Docker orchestration
├── docker-compose.prod.yml     # Production Docker configuration
└── README.md                  # This file
```

## Quick Start

### Prerequisites

- **Docker** and Docker Compose (recommended)
- **Node.js** 18+ and npm (for local development)
- **Python** 3.9+ (for local development)
- **PostgreSQL** 13+ (for local development)
- **Redis** 6+ (for local development)

### Docker Deployment (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/SemiuAdesina/asi-autonomous-agents.git
cd asi-autonomous-agents
```

2. Start all services:
```bash
docker-compose up --build -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- MeTTa Server: http://localhost:8080

### Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend:
```bash
python app.py
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Agent Registry

All agents are deployed on Agentverse with Chat Protocol enabled for ASI:One compatibility:

### Healthcare Assistant
- **Agent Address**: `agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl`
- **Port**: 8001
- **Capabilities**: 
  - Medical symptom analysis and treatment recommendations
  - Drug interaction checking and safety assessments
  - Health information queries and medical guidance
  - Integration with MeTTa knowledge for medical data
- **Use Case**: AI-powered medical assistance

### Logistics Coordinator
- **Agent Address**: `agent1qve8agrlc8yjqa3wqrz7cehwr2eh06yq4339afd0hhd0ec4g7vwyv5pw40u`
- **Port**: 8002
- **Capabilities**:
  - Supply chain analysis and optimization
  - Route optimization and delivery tracking
  - Inventory management and demand forecasting
  - Cross-agent coordination for complex logistics tasks
- **Use Case**: Supply chain optimization

### Financial Advisor
- **Agent Address**: `agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g`
- **Port**: 8003
- **Capabilities**:
  - Market analysis and investment insights
  - Portfolio optimization and risk assessment
  - DeFi protocol integration and yield farming opportunities
  - Real-time financial data analysis
- **Use Case**: DeFi protocol integration

## API Endpoints

### Agent Management
- `GET /api/agents/` - List all available agents
- `GET /api/agents/{id}` - Get specific agent details
- `POST /api/agents/` - Create new agent
- `GET /api/agents/{id}/messages` - Get agent message history

### DeFi Integration
- `GET /api/defi-data` - Get DeFi protocol data and liquidity pools
- `GET /api/portfolio-data` - Get portfolio information and analytics

### Agent Communication
- `POST /api/generate-response` - Send message to agent and get response

### Knowledge Graph
- `GET /api/knowledge/query` - Query MeTTa Knowledge Graph
- `POST /api/knowledge/concept` - Add new concept to knowledge graph

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

## Database Models

### User Model
- User authentication and profile management
- Wallet address integration
- Agent ownership and permissions

### Agent Model
- Agent metadata and capabilities
- Status tracking and health monitoring
- Agent type classification

### Message Model
- Message content and metadata
- Sender type classification (user, agent, system)
- Timestamp and message type tracking

### KnowledgeGraph Model
- Concept definitions and relationships
- Source tracking and confidence scores
- Domain-specific knowledge organization

### AgentSession Model
- Session management and tracking
- User-agent interaction history
- Session metadata and status

### Transaction Model
- Blockchain transaction tracking
- Gas usage and status monitoring
- Agent transaction history

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

**Test Coverage:**
- Component rendering and interaction
- Context state management
- API service integration
- Web3 wallet functionality
- Error handling and edge cases

### Backend Tests
```bash
cd backend
source venv/bin/activate
pytest tests/
```

**Test Coverage:**
- Unit tests for all models and utilities
- Integration tests for API endpoints
- Agent communication testing
- Database operations and migrations
- MeTTa Knowledge Graph integration

### Integration Tests
```bash
docker-compose -f docker-compose.test.yml up --build
```

## Deployment

### Production Deployment

1. Configure environment variables:
```bash
cp backend/config/env_template.txt .env
# Edit .env with production values
```

2. Deploy using Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. Run health checks:
```bash
./scripts/deploy.sh production
```

### CI/CD Pipeline

The project includes automated CI/CD pipelines:

- **Integration Tests**: Runs on every pull request
- **Deployment Pipeline**: Automated staging and production deployment
- **Security & Quality**: Code analysis and vulnerability scanning
- **Docker Build**: Automated container building and testing

## Configuration

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `FLASK_ENV`: Environment (development/production)
- `JWT_SECRET_KEY`: JWT signing key
- `METTA_ENDPOINT`: MeTTa Knowledge Graph endpoint
- `AGENTVERSE_ENDPOINT`: Agentverse platform endpoint
- `SECRET_KEY`: Flask secret key

#### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: WalletConnect project ID

### Database Setup

1. Start PostgreSQL:
```bash
docker-compose up postgres -d
```

2. Run migrations:
```bash
cd backend
source venv/bin/activate
flask db upgrade
```

## Monitoring

### Health Checks

All services include health check endpoints:
- Backend: `GET /api/health`
- Frontend: Built-in Next.js health checks
- Database: PostgreSQL health monitoring
- Redis: Redis ping checks
- MeTTa Server: Knowledge graph health status

### Logging

- Application logs: Structured JSON logging
- Error tracking: Centralized error collection
- Performance monitoring: Request timing and metrics
- Agent communication logs: Message flow tracking

## Security

### Container Security
- Non-root user execution
- Minimal base images (Alpine Linux)
- Security scanning integration
- Network isolation

### Application Security
- JWT authentication with refresh tokens
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Blockchain Security
- Smart contract audits and best practices
- Multi-signature wallets for critical operations
- Gas limit protection against DoS attacks
- Wallet connection validation

## MeTTa Knowledge Graph Integration

### Features
- **Semantic Search**: Advanced query capabilities across domains
- **Concept Management**: Add, query, and relate concepts
- **Domain Context**: Healthcare, logistics, finance knowledge
- **Relationship Mapping**: Complex concept relationships
- **Confidence Scoring**: Reliability assessment for knowledge

### Integration Points
- Healthcare Agent: Medical knowledge and symptom analysis
- Financial Agent: DeFi protocol knowledge and market insights
- Logistics Agent: Supply chain optimization knowledge
- Cross-agent Knowledge Sharing: Collaborative intelligence

## Web3 Integration

### Wallet Support
- **MetaMask**: Primary Ethereum wallet
- **Phantom**: Solana wallet support
- **WalletConnect**: Multi-wallet compatibility
- **Connection Persistence**: localStorage state management

### DeFi Protocols
- **Uniswap V3**: Concentrated liquidity and multiple fee tiers
- **Compound**: Algorithmic money markets
- **Aave**: Non-custodial liquidity protocol
- **Curve Finance**: Stablecoin-focused exchange
- **Yearn Finance**: Automated yield farming
- **Lido**: Liquid staking protocol

### Blockchain Networks
- **Ethereum**: Primary network support
- **Polygon**: Layer 2 scaling solution
- **Cross-chain Compatibility**: Multi-network support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Update documentation for new features
- Ensure ASI Alliance technology integration

## Troubleshooting

### Common Issues

#### Docker Build Failures
- Ensure Docker is running
- Check available disk space
- Verify network connectivity
- Clear Docker cache if needed

#### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists
- Check firewall settings

#### Frontend Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors
- Verify environment variables

#### Agent Communication Issues
- Check agent status and health
- Verify Socket.IO connections
- Check MeTTa Knowledge Graph availability
- Review agent logs for errors

### Getting Help

- Check the comprehensive test suite for examples
- Review existing issues on GitHub
- Create a new issue with detailed information
- Check agent logs and system health endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **ASI Alliance** for providing the infrastructure and technologies
- **Fetch.ai Innovation Lab** for uAgents framework
- **SingularityNET** for MeTTa Knowledge Graph
- **Open source community** for various dependencies
- **DeFi protocols** for providing integration opportunities

---

**Built for the ASI Alliance Hackathon**

This platform represents the future of decentralized AI applications, showcasing how autonomous agents can work together across Web3 systems to provide comprehensive solutions for healthcare, finance, and logistics domains.