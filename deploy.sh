#!/bin/bash

# ASI Autonomous Agents - Render Deployment Script
# This script deploys the ASI Alliance hackathon project to Render

echo "Deploying ASI Autonomous Agents to Render..."
echo "============================================"

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Render CLI not found. Installing..."
    npm install -g @render/cli
fi

# Login to Render (if not already logged in)
echo "Checking Render authentication..."
if ! render auth info &> /dev/null; then
    echo "Please login to Render:"
    render auth login
fi

# Deploy using render.yaml
echo "Deploying services from render.yaml..."
render services create --file render.yaml

echo "Deployment initiated!"
echo ""
echo "Your services will be available at:"
echo "   Frontend: https://asi-autonomous-agents-frontend.onrender.com"
echo "   Backend:  https://asi-autonomous-agents-backend.onrender.com"
echo "   Healthcare Agent: https://asi-healthcare-agent.onrender.com"
echo "   Financial Agent:  https://asi-financial-agent.onrender.com"
echo "   Logistics Agent:  https://asi-logistics-agent.onrender.com"
echo ""
echo "Monitor deployment at: https://dashboard.render.com"
echo ""
echo "ASI Alliance Hackathon Ready!"
echo "   - uAgents Framework: Ready"
echo "   - Chat Protocol: Ready"
echo "   - MeTTa Integration: Ready"
echo "   - Agentverse Compatible: Ready"
echo "   - Real Blockchain Data: Ready"
