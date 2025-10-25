#!/usr/bin/env python3
"""
Render-Optimized Healthcare Agent for Agentverse Deployment
Based on ASI Alliance Render deployment guide
"""

from datetime import datetime
from uuid import uuid4
import os
from typing import List
from dotenv import load_dotenv
from openai import OpenAI
from uagents import Context, Protocol, Agent, Model
from pydantic import Field

# Load environment variables
load_dotenv()

# Define Chat Protocol models
class TextContent(Model):
    type: str = "text"
    text: str

class ChatMessage(Model):
    timestamp: datetime
    msg_id: str
    content: List[TextContent]

class ChatResponse(Model):
    timestamp: datetime
    msg_id: str
    content: List[TextContent]
    agent_name: str = "Healthcare Assistant"

class StartSessionContent(Model):
    type: str = "start_session"
    message: str = "Hello! I'm your Healthcare Assistant. How can I help you with your health needs today?"

class EndSessionContent(Model):
    type: str = "end_session"
    message: str = "Thank you for using Healthcare Assistant. Take care of your health!"

class ChatAcknowledgement(Model):
    timestamp: datetime
    msg_id: str
    status: str = "acknowledged"

# Initialize ASI:One client (lazy initialization)
def get_asi_client():
    api_key = os.getenv("ASI_ONE_API_KEY")
    if not api_key:
        raise ValueError("ASI_ONE_API_KEY environment variable is required")
    return OpenAI(
        base_url='https://api.asi1.ai/v1',
        api_key=api_key,
    )

# Initialize agent with mailbox for Agentverse connection
agent = Agent(
    name="ASI-Healthcare-Assistant",
    seed="asi-healthcare-agent-seed-2024",
    port=8001,
    mailbox=True,  # Enable mailbox for Agentverse
)

# Initialize the chat protocol
protocol = Protocol("chat", version="1.0.0")

@protocol.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """Handle incoming chat messages using ASI:One"""
    
    # Send acknowledgement
    await ctx.send(
        sender,
        ChatAcknowledgement(timestamp=datetime.now(), acknowledged_msg_id=msg.msg_id),
    )
    
    # Extract text content
    text = ""
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text

    # Default response
    response = "I apologize, but I wasn't able to process your medical query at this time."
    
    try:
        # Query ASI:One for medical assistance
        client = get_asi_client()
        r = client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {
                    "role": "system", 
                    "content": """You are a helpful AI healthcare assistant. Provide accurate medical information, 
                    symptom analysis, and general health guidance. Always recommend consulting with healthcare 
                    professionals for serious medical concerns. Be empathetic and professional in your responses."""
                },
                {"role": "user", "content": text},
            ],
            max_tokens=2048,
        )
        response = str(r.choices[0].message.content)
        
        ctx.logger.info(f"✅ Processed medical query: {text[:50]}...")
        
    except Exception as e:
        ctx.logger.exception(f"❌ Error querying ASI:One: {e}")
        response = "I'm experiencing technical difficulties. Please try again later or consult with a healthcare professional."

    # Send response with end session
    await ctx.send(sender, ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[
            TextContent(type="text", text=response),
            EndSessionContent(type="end-session"),
        ]
    ))

@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle chat acknowledgements"""
    ctx.logger.info(f"✅ Message acknowledged by {sender}")

# Include protocol with manifest publishing
agent.include(protocol, publish_manifest=True)

if __name__ == "__main__":
    print("🏥 Starting ASI Healthcare Assistant...")
    print("📧 Mailbox enabled for Agentverse connection")
    print("🤖 ASI:One integration active")
    print("=" * 50)
    
    agent.run()
