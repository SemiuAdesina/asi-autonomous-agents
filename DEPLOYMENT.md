# ASI Autonomous Agents - Deployment Guide

## Deployment Options

### Option 1: Render (Recommended for ASI Hackathon)

Render offers free hosting perfect for hackathon submissions with automatic deployments.

#### Quick Deploy to Render:

1. Fork this repository to your GitHub account
2. Connect to Render:
   - Go to [render.com](https://render.com)
   - Sign up/login with GitHub
   - Click "New +" → "Blueprint"

3. Deploy using Blueprint:
   - Select your forked repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to deploy all services

4. Monitor Deployment:
   - Services will be available at:
     - Frontend: `https://asi-autonomous-agents-frontend.onrender.com`
     - Backend: `https://asi-autonomous-agents-backend.onrender.com`
     - Healthcare Agent: `https://asi-healthcare-agent.onrender.com`
     - Financial Agent: `https://asi-financial-agent.onrender.com`
     - Logistics Agent: `https://asi-logistics-agent.onrender.com`

#### Manual Deploy with CLI:

```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render auth login

# Deploy from repository
render services create --file render.yaml
```

### Option 2: Docker Compose (Local/Cloud)

Perfect for local development or cloud deployment.

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Manual Deployment

#### Frontend (Next.js):
```bash
cd frontend
npm install
npm run build
npm start
```

#### Backend (Flask):
```bash
cd backend
pip install -r requirements.txt
python3 app.py
```

#### Agents:
```bash
# Healthcare Agent
cd backend/agents/healthcare_agent
python3 main.py

# Financial Agent
cd backend/agents/financial_agent
python3 main.py

# Logistics Agent
cd backend/agents/logistics_agent
python3 main.py
```

## Environment Variables

### Required for Production:

```bash
# Blockchain APIs
ETHERSCAN_API_KEY=your_etherscan_api_key

# Database
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port

# Security
JWT_SECRET_KEY=jXOTT9i3Gk/WmG+snMX0F3SivPM/rIqiXyY9GvczMYM=

# Agent Configuration
AGENT_PORT=8001
AGENT_NAME=Healthcare Assistant
METTA_ENDPOINT=http://localhost:8080
```

## ASI Alliance Hackathon Requirements

### All Requirements Met:

- **uAgents Framework**: All 3 agents implemented
- **Chat Protocol**: ASI:One compatible communication
- **MeTTa Knowledge Graph**: Healthcare agent integration
- **Agentverse Deployment**: Agents ready for deployment
- **Real Blockchain Data**: Etherscan V2 API integration
- **Innovation Lab Badge**: Included in README

### Agent Addresses for Agentverse:

- **Healthcare Assistant**: `agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl`
- **Logistics Coordinator**: `agent1qve8agrlc8yjqa3wqrz7cehwr2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl`
- **Financial Advisor**: `agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g`

## Monitoring & Health Checks

### Health Check Endpoints:

- Frontend: `GET /`
- Backend: `GET /health`
- Healthcare Agent: `GET /health`
- Financial Agent: `GET /health`
- Logistics Agent: `GET /health`

### Agent Inspector URLs:

- Healthcare: `https://agentverse.ai/inspect/?uri=http://127.0.0.1:8001&address=agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl`
- Financial: `https://agentverse.ai/inspect/?uri=http://127.0.0.1:8003&address=agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g`
- Logistics: `https://agentverse.ai/inspect/?uri=http://127.0.0.1:8002&address=agent1qve8agrlc8yjqa3wqrz7cehwr2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl`

## Troubleshooting

### Common Issues:

1. **Port Already in Use**:
   ```bash
   # Kill existing processes
   pkill -f "python3 main.py"
   ```

2. **Module Not Found**:
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Database Connection Error**:
   ```bash
   # Check database status
   docker-compose ps postgres
   ```

4. **Agent Not Responding**:
   ```bash
   # Check agent logs
   docker-compose logs healthcare-agent
   ```

## Submission Checklist

- [ ] All services deployed and running
- [ ] Agents accessible via Agentverse
- [ ] Real blockchain data working
- [ ] Chat Protocol enabled
- [ ] MeTTa integration functional
- [ ] Demo video recorded (3-5 minutes)
- [ ] README updated with agent addresses
- [ ] Innovation Lab badge included

## Ready for ASI Alliance Hackathon

Your ASI Autonomous Agents platform is now ready for submission with:
- Real blockchain data integration
- Autonomous AI agents with Chat Protocol
- MeTTa Knowledge Graph integration
- Agentverse deployment ready
- Production-ready deployment configuration
