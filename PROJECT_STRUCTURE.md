# Project Structure Overview

This document provides a clear overview of the ASI Autonomous Agents Platform project structure.

## Root Directory

```
asi-autonomous-agents/
├── README.md                    # Main project documentation
├── PROJECT_STRUCTURE.md         # This file - project structure guide
├── LICENSE                      # MIT License
├── demo_video_link.txt          # Demo video URL (to be updated)
├── .env.example                 # Environment variables template
├── asi-autonomous-agents.code-workspace  # VS Code workspace file
├── backend/                     # Python Flask backend
├── frontend/                    # Next.js React frontend
├── manifests/                   # Agent manifest files
└── scripts/                     # Utility scripts
```

## Backend Structure

```
backend/
├── app.py                       # Main Flask application
├── models.py                    # Database models
├── requirements.txt             # Python dependencies
├── env.example                  # Environment variables template
├── alembic.ini                  # Database migration config
├── pytest.ini                   # Test configuration
├── setup_local_db.py           # Database initialization
├── run_agents.py               # Agent runner script
├── run_tests.py                # Test runner script
├── deploy_agents.py            # Agent deployment script
├── metta_server.py             # MeTTa server implementation
├── init.sql                    # Database schema
├── instance/                   # Database files
│   └── asi_agents.db           # SQLite database
├── logs/                       # Application logs
│   ├── asi_agents.log         # Main application log
│   ├── errors.log             # Error log
│   └── security.log           # Security log
├── config/                     # Configuration files
│   ├── __init__.py
│   └── metta_config.py         # MeTTa configuration
├── knowledge/                  # Knowledge graph integration
│   ├── __init__.py
│   └── metta_kg/
│       ├── __init__.py
│       └── integration.py      # MeTTa Knowledge Graph integration
├── agents/                     # Agent implementations
│   ├── __init__.py
│   ├── agent_coordinator.py    # Agent coordination logic
│   ├── dynamic_learning.py     # Dynamic learning system
│   ├── integrate_enhanced_features.py  # Feature integration
│   ├── multi_agent_demo.py    # Multi-agent demonstration
│   ├── register_agents.py     # Agent registration
│   ├── healthcare_agent/       # Healthcare agent
│   ├── financial_agent/        # Financial agent
│   └── logistics_agent/        # Logistics agent
├── routes/                     # API route handlers
│   ├── __init__.py
│   ├── agents.py              # Agent-related endpoints
│   ├── auth.py                # Authentication endpoints
│   ├── messages.py            # Message handling endpoints
│   ├── knowledge.py           # Knowledge graph endpoints
│   ├── health.py              # Health check endpoints
│   ├── audit.py               # Audit logging endpoints
│   ├── generate.py            # AI generation endpoints
│   ├── multisig.py            # Multi-signature endpoints
│   ├── sessions.py            # Session management endpoints
│   └── transactions.py        # Transaction endpoints
├── utils/                      # Utility modules
│   ├── __init__.py
│   ├── ai_intelligence.py     # AI integration utilities
│   ├── logging.py             # Logging utilities
│   ├── security.py            # Security utilities
│   ├── sanitization.py        # Input sanitization
│   ├── rate_limiting.py       # Rate limiting
│   ├── multisig.py            # Multi-signature utilities
│   └── smart_contract_auditor.py  # Smart contract auditing
├── migrations/                 # Database migrations
│   ├── __init__.py
│   ├── env.py                 # Migration environment
│   ├── script.py.mako         # Migration template
│   └── versions/              # Migration versions
│       ├── __init__.py
│       └── 001_initial.py     # Initial migration
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── conftest.py            # Test configuration
│   ├── integration/           # Integration tests
│   ├── performance/           # Performance tests
│   └── unit/                  # Unit tests
│       ├── agents/            # Agent unit tests
│       ├── api/               # API unit tests
│       └── models/            # Model unit tests
├── scripts/                    # Utility scripts
│   ├── __init__.py
│   └── start_metta_server.py  # MeTTa server startup
└── venv/                       # Python virtual environment
```

## Agent Structure

Each agent follows a consistent structure:

```
agents/{agent_name}/
├── agent.py                    # Main agent implementation
├── http_server.py             # HTTP API server
├── knowledge.py               # Knowledge graph integration
├── utils.py                   # Agent utilities
├── requirements.txt           # Agent-specific dependencies
├── {agent_name}rag.py         # RAG (Retrieval-Augmented Generation)
└── asi_one_integration.py     # ASI:One API integration
```

## Frontend Structure

```
frontend/
├── package.json                # Node.js dependencies
├── package-lock.json           # Dependency lock file
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest test configuration
├── jest.setup.js               # Jest setup file
├── next-env.d.ts               # Next.js TypeScript definitions
├── scripts/                    # Build and test scripts
│   └── test-setup.js          # Test setup script
├── src/                        # Source code
│   ├── components/             # React components
│   ├── contexts/               # React contexts
│   ├── pages/                  # Next.js pages
│   ├── services/               # API services
│   ├── styles/                 # CSS styles
│   └── types/                  # TypeScript type definitions
├── coverage/                   # Test coverage reports
└── node_modules/              # Node.js dependencies
```

## Component Structure

```
src/components/
├── PortfolioPage.tsx           # Main portfolio dashboard
├── AgentGrid.tsx              # Agent grid display
├── ChatProtocolManager.tsx     # Chat protocol management
├── RealtimeManager.tsx        # Real-time monitoring
├── KnowledgeManager.tsx       # Knowledge management
├── MeTTaQueryInterface.tsx    # MeTTa query interface
├── LearningAnalytics.tsx      # Learning analytics
├── BlockchainDashboard.tsx   # Blockchain integration
├── Web3Integration.tsx        # Web3 functionality
├── Authentication.tsx         # Authentication components
├── Navigation.tsx             # Navigation components
└── ...                        # Other UI components
```

## Context Structure

```
src/contexts/
├── AgentContext.tsx            # Agent state management
├── AuthContext.tsx             # Authentication state
├── Web3Context.tsx             # Web3 integration state
├── MobileMenuContext.tsx       # Mobile navigation state
└── __tests__/                  # Context tests
```

## Service Structure

```
src/services/
├── api.ts                      # Main API service
├── backendAPI.ts              # Backend API client
├── agentCommunication.ts      # Agent communication
├── blockchain.ts              # Blockchain services
└── __tests__/                 # Service tests
```

## Manifest Files

```
manifests/
├── healthcare_agent.json       # Healthcare agent manifest
├── financial_agent.json        # Financial agent manifest
└── logistics_agent.json        # Logistics agent manifest
```

## Scripts

```
scripts/
└── smoke_test.py               # Comprehensive smoke tests
```

## Key Files Explained

### Backend Core Files

- **app.py**: Main Flask application with all routes and middleware
- **models.py**: SQLAlchemy database models for users, agents, messages, etc.
- **requirements.txt**: Python dependencies for the backend
- **setup_local_db.py**: Database initialization and setup

### Agent Files

- **agent.py**: Main agent implementation with Chat Protocol support
- **http_server.py**: HTTP API server for web integration
- **knowledge.py**: MeTTa Knowledge Graph integration
- **utils.py**: Agent-specific utilities and helper functions
- **{agent}rag.py**: Retrieval-Augmented Generation implementation

### Frontend Core Files

- **package.json**: Node.js dependencies and scripts
- **next.config.js**: Next.js configuration
- **tailwind.config.js**: Tailwind CSS configuration
- **tsconfig.json**: TypeScript configuration

### Configuration Files

- **.env.example**: Environment variables template
- **alembic.ini**: Database migration configuration
- **pytest.ini**: Test configuration
- **jest.config.js**: Frontend test configuration

## Development Workflow

1. **Backend Development**: Work in `backend/` directory
2. **Frontend Development**: Work in `frontend/` directory
3. **Agent Development**: Work in `backend/agents/{agent_name}/` directories
4. **Testing**: Use `backend/tests/` and `frontend/src/__tests__/`
5. **Documentation**: Update `README.md` and `PROJECT_STRUCTURE.md`

## Deployment Structure

- **Development**: Local SQLite database, individual agent processes
- **Production**: PostgreSQL database, containerized services
- **Testing**: Comprehensive test suite with coverage reports

This structure provides a clear separation of concerns while maintaining consistency across all components of the multi-agent system.
