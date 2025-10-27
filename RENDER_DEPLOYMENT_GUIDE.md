# ASI Alliance Agents - Render Deployment Guide

Complete guide for deploying ASI Alliance hackathon agents to Render and connecting them to Agentverse.

##  Overview

This project provides **three specialized AI agents** optimized for Render deployment:

1. ** Healthcare Assistant** - Medical consultation and health guidance
2. ** Financial Advisor** - Investment strategies and DeFi insights  
3. ** Logistics Coordinator** - Supply chain management and optimization

Each agent uses **ASI:One** for advanced AI reasoning and connects to **Agentverse** via mailbox.

##  Project Structure

```
asi-autonomous-agents/
├── backend/
│   └── agents/
│       ├── healthcare_agent/
│       │   ├── app.py              # Render-optimized agent
│       │   ├── requirements.txt    # Minimal dependencies
│       │   ├── env.example         # Environment template
│       │   └── README.md           # Deployment guide
│       ├── financial_agent/
│       │   ├── app.py              # Render-optimized agent
│       │   ├── requirements.txt    # Minimal dependencies
│       │   ├── env.example         # Environment template
│       │   └── README.md           # Deployment guide
│       └── logistics_agent/
│           ├── app.py              # Render-optimized agent
│           ├── requirements.txt   # Minimal dependencies
│           ├── env.example        # Environment template
│           └── README.md          # Deployment guide
```

##  Render Deployment Steps

### Prerequisites

- **ASI:One API Key**: Get from [ASI:One](https://asi1.ai)
- **Render Account**: Sign up at [render.com](https://render.com)
- **GitHub Repository**: Push agents to separate repositories

### Step 1: Prepare Individual Agent Repositories

For each agent, create a separate repository:

```bash
# Healthcare Agent Repository
mkdir asi-healthcare-agent
cd asi-healthcare-agent
cp ../backend/agents/healthcare_agent/* .
git init
git add .
git commit -m "Initial healthcare agent"
git remote add origin https://github.com/yourusername/asi-healthcare-agent.git
git push -u origin main
```

### Step 2: Deploy Healthcare Agent

1. **Create Render Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "+ New" → "Background Worker"
   - Connect GitHub repository: `asi-healthcare-agent`

2. **Configure Service**:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Environment Variables**: 
     - `ASI_ONE_API_KEY`: `sk-your-actual-api-key`

3. **Deploy**:
   - Click "Create Background Worker"
   - Monitor logs for Agent Inspector link

### Step 3: Deploy Financial Agent

Repeat Step 2 with:
- Repository: `asi-financial-agent`
- Port: 8002 (automatically assigned by Render)

### Step 4: Deploy Logistics Agent

Repeat Step 2 with:
- Repository: `asi-logistics-agent`  
- Port: 8003 (automatically assigned by Render)

## 🔗 Agentverse Connection

### After Deployment

1. **Get Agent Inspector Links**:
   - Check Render logs for each deployed agent
   - Look for: `Agent Inspector: https://...`

2. **Connect to Agentverse**:
   - Open Agent Inspector links in browser
   - Follow mailbox connection process
   - Agents will appear under "Local Agents"

3. **Test Chat**:
   - Use Agentverse chat interface
   - Send messages to each agent
   - Verify responses from ASI:One

##  Agent Capabilities

### Healthcare Assistant
- **Medical Consultation**: Symptom analysis, health guidance
- **Treatment Planning**: General medical advice
- **Health Monitoring**: Wellness recommendations
- **Professional Referral**: Guidance to consult healthcare professionals

### Financial Advisor  
- **Investment Strategies**: Portfolio management advice
- **DeFi Integration**: Decentralized finance insights
- **Market Analysis**: Financial market trends
- **Risk Assessment**: Investment risk evaluation

### Logistics Coordinator
- **Supply Chain Management**: End-to-end logistics
- **Route Optimization**: Delivery efficiency
- **Inventory Management**: Stock optimization
- **Delivery Tracking**: Real-time monitoring

##  Technical Details

### Dependencies
Each agent uses minimal dependencies:
```
uagents>=0.4.0
uagents-core>=0.1.0
openai>=1.0.0
python-dotenv>=1.0.0
```

### ASI:One Integration
- **Base URL**: `https://api.asi1.ai/v1`
- **Model**: `asi1-mini`
- **Max Tokens**: 2048
- **Authentication**: API key via environment variable

### Agent Configuration
- **Mailbox**: Enabled for Agentverse connection
- **Manifest**: Published for discoverability
- **Port**: Auto-assigned by Render
- **Protocol**: Chat Protocol v1.0.0

## 🐛 Troubleshooting

### Common Issues

1. **Agent Not Appearing in Agentverse**:
   - Verify Agent Inspector link is accessible
   - Check mailbox connection in logs
   - Ensure network allows outbound connections

2. **No Responses from Agent**:
   - Verify `ASI_ONE_API_KEY` is set correctly
   - Check ASI:One API access and model availability
   - Review Render logs for error messages

3. **Build Failures**:
   - Ensure `requirements.txt` includes all dependencies
   - Check Python version compatibility
   - Verify repository structure is correct

4. **Environment Issues**:
   - Confirm environment variables are set in Render
   - Check `.env` file is not committed to repository
   - Verify API key format and permissions

##  Monitoring

### Render Dashboard
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Health**: Service status and uptime

### Agentverse Dashboard
- **Agent Status**: Online/offline status
- **Message Count**: Chat interactions
- **Performance**: Response times and success rates

##  Success Criteria

 **All three agents deployed on Render**  
 **Agents connected to Agentverse via mailbox**  
 **Chat functionality working with ASI:One**  
 **Agents discoverable and responsive**  
 **Professional medical, financial, and logistics guidance**

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Agentverse Documentation](https://docs.agentverse.ai)
- [ASI:One API Documentation](https://docs.asi1.ai)
- [uAgents Framework](https://docs.uagents.ai)

---

**Ready to deploy? Start with the Healthcare Agent and follow the step-by-step guide above!**
