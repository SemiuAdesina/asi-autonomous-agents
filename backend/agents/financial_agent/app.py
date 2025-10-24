#!/usr/bin/env python3
"""
Render-Optimized Financial Agent for Agentverse Deployment
Based on ASI Alliance Render deployment guide
"""

from datetime import datetime
from uuid import uuid4
import os
from dotenv import load_dotenv
from openai import OpenAI
from uagents import Context, Protocol, Agent
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

# Load environment variables
load_dotenv()

# Initialize ASI:One client
client = OpenAI(
    base_url='https://api.asi1.ai/v1',
    api_key=os.getenv("ASI_ONE_API_KEY"),  
)

# Initialize agent with mailbox for Agentverse connection
agent = Agent(
    name="ASI-Financial-Advisor",
    seed="asi-financial-agent-seed-2024",
    port=8002,
    mailbox=True,  # Enable mailbox for Agentverse
)

# Initialize chat protocol
protocol = Protocol(spec=chat_protocol_spec)

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
    response = "I apologize, but I wasn't able to process your financial query at this time."
    
    try:
        # Query ASI:One for financial advice
        r = client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {
                    "role": "system", 
                    "content": """You are a knowledgeable AI financial advisor. Provide insights on investment strategies, 
                    portfolio management, DeFi protocols, market analysis, and risk assessment. Always emphasize 
                    that this is general advice and users should consult with qualified financial professionals 
                    for personalized guidance."""
                },
                {"role": "user", "content": text},
            ],
            max_tokens=2048,
        )
        response = str(r.choices[0].message.content)
        
        ctx.logger.info(f"✅ Processed financial query: {text[:50]}...")
        
    except Exception as e:
        ctx.logger.exception(f"❌ Error querying ASI:One: {e}")
        response = "I'm experiencing technical difficulties. Please try again later or consult with a financial advisor."

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
    print("💰 Starting ASI Financial Advisor...")
    print("📧 Mailbox enabled for Agentverse connection")
    print("🤖 ASI:One integration active")
    print("=" * 50)
    
    agent.run()
