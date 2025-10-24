# ASI Logistics Coordinator - Render Deployment

AI-powered logistics coordinator using ASI:One and uAgents for Agentverse deployment.

## Features

- **Supply Chain Management**: Route optimization and inventory tracking
- **Logistics Planning**: Delivery coordination and operational efficiency
- **ASI:One Integration**: Advanced AI reasoning capabilities
- **Agentverse Compatible**: Mailbox-enabled for seamless chat
- **Render Optimized**: Ready for cloud deployment

## Quick Start

### Local Development

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**:
   ```bash
   cp env.example .env
   # Edit .env and add your ASI_ONE_API_KEY
   ```

3. **Run Agent**:
   ```bash
   python app.py
   ```

4. **Connect to Agentverse**:
   - Use the Agent Inspector link from logs
   - Find agent under "Local Agents" in Agentverse
   - Start chatting!

## Render Deployment

### 1. Prepare Repository
- Push this agent directory to GitHub/GitLab/Bitbucket
- Ensure `app.py`, `requirements.txt`, and `env.example` are included

### 2. Create Render Service
- **Environment**: Python
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python app.py`
- **Environment Variables**: Add `ASI_ONE_API_KEY`

### 3. Deploy
- Click "Create Background Worker"
- Monitor logs for Agent Inspector link
- Connect to Agentverse via mailbox

## Agent Configuration

- **Name**: ASI-Logistics-Coordinator
- **Port**: 8003
- **Mailbox**: Enabled
- **Manifest**: Published to Agentverse

## API Integration

Uses ASI:One OpenAI-compatible API:
- **Base URL**: `https://api.asi1.ai/v1`
- **Model**: `asi1-mini`
- **Max Tokens**: 2048

## Troubleshooting

- **Missing API Key**: Verify `ASI_ONE_API_KEY` is set
- **Mailbox Issues**: Check Agent Inspector link from logs
- **No Responses**: Verify ASI:One API access and model availability
