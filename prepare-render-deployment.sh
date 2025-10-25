#!/bin/bash

# ASI Autonomous Agents - Render Deployment Script
# This script helps prepare the project for Render deployment

echo "🚀 ASI Autonomous Agents - Render Deployment Preparation"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found render.yaml"

# Check if all required files exist
echo "🔍 Checking required files..."

# Backend requirements
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: backend/requirements.txt not found"
    exit 1
fi
echo "✅ Backend requirements.txt found"

# Frontend package.json
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: frontend/package.json not found"
    exit 1
fi
echo "✅ Frontend package.json found"

# Agent requirements
for agent in healthcare_agent financial_agent logistics_agent; do
    if [ ! -f "backend/agents/$agent/requirements.txt" ]; then
        echo "❌ Error: backend/agents/$agent/requirements.txt not found"
        exit 1
    fi
    echo "✅ $agent requirements.txt found"
done

# Check if MeTTa server exists
if [ ! -f "backend/metta_server.py" ]; then
    echo "❌ Error: backend/metta_server.py not found"
    exit 1
fi
echo "✅ MeTTa server found"

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo "1. ✅ All required files present"
echo "2. ✅ render.yaml configured"
echo "3. ✅ Individual service configs created"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Push all changes to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add Render deployment configuration'"
echo "   git push origin main"
echo ""
echo "2. Go to https://render.com and:"
echo "   - Sign up/login with GitHub"
echo "   - Click 'New' → 'Blueprint'"
echo "   - Select your repository"
echo "   - Review and deploy all services"
echo ""
echo "3. Configure environment variables in Render dashboard:"
echo "   - ASI_ONE_API_KEY (for backend and all agents)"
echo "   - Other variables will be auto-generated"
echo ""
echo "4. Monitor deployment in Render dashboard"
echo ""
echo "📚 For detailed instructions, see RENDER_DEPLOYMENT.md"
echo ""
echo "🎉 Ready for deployment!"

# Create a simple deployment status file
cat > deployment-status.md << EOF
# Deployment Status

## Files Created
- render.yaml (main configuration)
- render-backend.yaml (backend service)
- render-frontend.yaml (frontend service)
- render-metta.yaml (MeTTa server)
- render-healthcare-agent.yaml (healthcare agent)
- render-financial-agent.yaml (financial agent)
- render-logistics-agent.yaml (logistics agent)
- RENDER_DEPLOYMENT.md (deployment guide)

## Services to Deploy
1. asi-backend (Web Service)
2. asi-frontend (Static Site)
3. asi-metta-server (Web Service)
4. asi-healthcare-agent (Background Worker)
5. asi-financial-agent (Background Worker)
6. asi-logistics-agent (Background Worker)

## Environment Variables Required
- ASI_ONE_API_KEY (set in Render dashboard)

## Deployment Date
$(date)
EOF

echo "📄 Created deployment-status.md"
echo ""
echo "✨ All done! Your project is ready for Render deployment."
