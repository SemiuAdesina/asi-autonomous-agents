# Getting Started Guide

This guide will help you quickly set up and run the ASI Autonomous Agents Platform.

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/asi-autonomous-agents.git
cd asi-autonomous-agents

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python setup_local_db.py

# Setup frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables (optional for basic functionality)
nano .env
```

### 3. Run the Application

```bash
# Terminal 1: Backend API
cd backend
source venv/bin/activate
python app.py

# Terminal 2: Healthcare Agent
cd backend/agents/healthcare_agent
python agent.py

# Terminal 3: Frontend
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Healthcare Agent**: http://localhost:8002

## Basic Usage

### 1. Login to the Platform

- Navigate to http://localhost:3000
- Use the demo credentials or register a new account
- Access the portfolio dashboard

### 2. Interact with Agents

- **Agent Grid**: View all available agents and their status
- **Chat Protocol Manager**: Manage agent communication sessions
- **Real-time Manager**: Monitor WebSocket connections
- **Knowledge Manager**: Query the MeTTa Knowledge Graph

### 3. Test Agent Communication

- Click on the Healthcare Assistant in the Agent Grid
- Start a new Chat Protocol session
- Send messages and receive AI-powered responses
- Monitor real-time updates in the Real-time Manager

## Key Features to Explore

### Portfolio Dashboard
- View agent status and capabilities
- Monitor real-time agent health
- Access all platform features

### Chat Protocol Manager
- Create new agent sessions
- Manage active conversations
- Monitor message counts and protocols

### Real-time Manager
- Monitor WebSocket connections
- View live event logs
- Track connection status and latency

### Knowledge Manager
- Query MeTTa Knowledge Graph
- Manage knowledge concepts
- Test AI reasoning capabilities

### Learning Analytics
- View agent performance metrics
- Monitor learning patterns
- Track knowledge updates

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes using ports
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5001 | xargs kill -9
   lsof -ti:8002 | xargs kill -9
   ```

2. **Database Issues**
   ```bash
   # Recreate database
   cd backend
   rm instance/asi_agents.db
   python setup_local_db.py
   ```

3. **Frontend Build Issues**
   ```bash
   # Clear cache and reinstall
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Agent Connection Issues**
   ```bash
   # Check agent status
   curl http://localhost:8002/health
   ```

### Environment Variables

If you encounter issues, ensure these environment variables are set:

```env
# Required for basic functionality
DATABASE_URL=sqlite:///instance/asi_agents.db
JWT_SECRET_KEY=your-secret-key

# Optional for enhanced features
ASI_ONE_API_KEY=your-api-key
ETHERSCAN_API_KEY=your-api-key
METTA_SERVER_URL=http://localhost:8080
```

## Next Steps

1. **Explore the Code**: Review the project structure in `PROJECT_STRUCTURE.md`
2. **Read Documentation**: Check the main `README.md` for detailed information
3. **Run Tests**: Execute the test suite to verify functionality
4. **Customize Agents**: Modify agent behavior in `backend/agents/`
5. **Extend Frontend**: Add new components in `frontend/src/components/`

## Support

- **Issues**: Create an issue in the GitHub repository
- **Documentation**: Check the main README.md
- **Community**: Join the ASI Alliance community

## Demo Credentials

For testing purposes, you can use these demo credentials:
- **Email**: demo@example.com
- **Password**: demo123

Or register a new account through the frontend interface.

---

**Note**: This is a demonstration platform built for the ASI Alliance Hackathon. For production use, ensure proper security configurations and environment variable management.
