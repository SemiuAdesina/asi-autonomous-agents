#!/usr/bin/env python3
"""
Render-Optimized Logistics Agent for Agentverse Deployment
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
    agent_name: str = "Logistics Coordinator"

class StartSessionContent(Model):
    type: str = "start_session"
    message: str = "Hello! I'm your Logistics Coordinator. How can I help you with your supply chain needs today?"

class EndSessionContent(Model):
    type: str = "end_session"
    message: str = "Thank you for using Logistics Coordinator. Optimize your supply chain!"

class ChatAcknowledgement(Model):
    timestamp: datetime
    msg_id: str
    status: str = "acknowledged"

# Initialize ASI:One client
client = OpenAI(
    base_url='https://api.asi1.ai/v1',
    api_key=os.getenv("ASI_ONE_API_KEY"),  
)

# Initialize agent with mailbox for Agentverse connection
agent = Agent(
    name="ASI-Logistics-Coordinator",
    seed="asi-logistics-agent-seed-2024",
    port=8003,
    mailbox=True,  # Enable mailbox for Agentverse
)

# Initialize chat protocol
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
    response = "I apologize, but I wasn't able to process your logistics query at this time."
    
    try:
        # Query ASI:One for logistics assistance
        r = client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {
                    "role": "system", 
                    "content": """You are an expert AI logistics coordinator. Provide insights on supply chain management, 
                    route optimization, inventory management, delivery tracking, and logistics planning. Focus on 
                    efficiency, cost reduction, and operational excellence in logistics operations."""
                },
                {"role": "user", "content": text},
            ],
            max_tokens=2048,
        )
        response = str(r.choices[0].message.content)
        
        ctx.logger.info(f"✅ Processed logistics query: {text[:50]}...")
        
    except Exception as e:
        ctx.logger.exception(f"❌ Error querying ASI:One: {e}")
        response = "I'm experiencing technical difficulties. Please try again later or consult with a logistics expert."

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
    print("🚚 Starting ASI Logistics Coordinator...")
    print("📧 Mailbox enabled for Agentverse connection")
    print("🤖 ASI:One integration active")
    print("=" * 50)
    
    agent.run()
