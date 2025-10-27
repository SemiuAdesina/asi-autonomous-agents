#!/usr/bin/env python3
"""
Multi-Agent Communication Demo - Alice and Adrian
Following the Fetch.ai Innovation Lab workshop examples
"""

import asyncio
import sys
import os
from datetime import datetime
from uuid import uuid4
from uagents import Agent, Context, Protocol
from uagents import Model
from typing import List, Optional
import json

# Add the healthcare agent directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'healthcare_agent'))

# Import MeTTa components
from knowledge import medical_metta
from medicalrag import MedicalRAG
from asi_one_integration import asi_one

# Initialize Alice (Healthcare Agent)
alice = Agent(
    name="Alice",
    seed="alice-healthcare-agent-seed-phrase-2024",
    port=8005,
    endpoint=["http://localhost:8005/submit"]
)

# Initialize Adrian (Financial Agent) 
adrian = Agent(
    name="Adrian",
    seed="adrian-financial-agent-seed-phrase-2024", 
    port=8006,
    endpoint=["http://localhost:8006/submit"]
)

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
    agent_name: str

class StartSessionContent(Model):
    type: str = "start_session"

class EndSessionContent(Model):
    type: str = "end_session"

# Initialize chat protocol
chat_proto = Protocol("chat", version="1.0.0")

# Initialize RAG system for Alice
alice_rag = MedicalRAG(medical_metta)

def create_response(text: str, msg_id: str, agent_name: str) -> ChatResponse:
    """Create a chat response"""
    return ChatResponse(
        timestamp=datetime.now(),
        msg_id=msg_id,
        content=[TextContent(type="text", text=text)],
        agent_name=agent_name
    )

# Alice's message handler
@chat_proto.on_message(model=ChatMessage, replies={ChatResponse})
async def alice_handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """Alice handles incoming messages"""
    try:
        # Extract text content
        text_content = ""
        for content in msg.content:
            if content.type == "text":
                text_content += content.text + " "
        
        text_content = text_content.strip()
        
        if not text_content:
            response_text = "Alice: I didn't receive any text to process."
        else:
            # Process using MeTTa knowledge graph
            if "health" in text_content.lower() or "medical" in text_content.lower():
                # Medical query - use MeTTa
                response_text = f"Alice: I can help with medical questions. For '{text_content}', let me check my knowledge base..."
                # Add some MeTTa processing here
                response_text += " Based on my medical knowledge, I recommend consulting a healthcare professional."
            else:
                # Forward to Adrian for financial questions
                response_text = f"Alice: I received '{text_content}'. This seems like a financial question. Let me forward this to Adrian..."
                
                # Forward to Adrian
                await ctx.send(adrian.address, msg)
                response_text += " I've forwarded your message to Adrian, our financial expert."
        
        # Send response
        response = create_response(response_text, msg.msg_id, "Alice")
        await ctx.send(sender, response)
        
        print(f" Alice sent response to {sender}: {response_text[:50]}...")
        
    except Exception as e:
        error_response = f"Alice: I encountered an error: {str(e)}"
        response = create_response(error_response, msg.msg_id, "Alice")
        await ctx.send(sender, response)
        print(f" Alice error: {e}")

# Adrian's message handler
@chat_proto.on_message(model=ChatMessage, replies={ChatResponse})
async def adrian_handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """Adrian handles incoming messages"""
    try:
        # Extract text content
        text_content = ""
        for content in msg.content:
            if content.type == "text":
                text_content += content.text + " "
        
        text_content = text_content.strip()
        
        if not text_content:
            response_text = "Adrian: I didn't receive any text to process."
        else:
            # Process financial queries
            if "investment" in text_content.lower() or "financial" in text_content.lower():
                response_text = f"Adrian: I can help with financial questions. For '{text_content}', I recommend diversifying your portfolio and considering risk management strategies."
            else:
                response_text = f"Adrian: I received '{text_content}'. This seems like a medical question. Let me forward this to Alice..."
                
                # Forward to Alice
                await ctx.send(alice.address, msg)
                response_text += " I've forwarded your message to Alice, our medical expert."
        
        # Send response
        response = create_response(response_text, msg.msg_id, "Adrian")
        await ctx.send(sender, response)
        
        print(f" Adrian sent response to {sender}: {response_text[:50]}...")
        
    except Exception as e:
        error_response = f"Adrian: I encountered an error: {str(e)}"
        response = create_response(error_response, msg.msg_id, "Adrian")
        await ctx.send(sender, response)
        print(f" Adrian error: {e}")

# Add protocol to agents
alice.include(chat_proto)
adrian.include(chat_proto)

# Startup handlers
@alice.on_event("startup")
async def alice_startup(ctx: Context):
    """Alice startup handler"""
    print(f"👩‍⚕️ Alice (Healthcare Agent) started at {alice.address}")
    print(f"🔗 Alice endpoint: {alice.endpoint}")
    
    # Send initial message to Adrian
    initial_msg = ChatMessage(
        timestamp=datetime.now(),
        msg_id=str(uuid4()),
        content=[TextContent(type="text", text="Hello Adrian! I'm Alice, your healthcare assistant. I'm ready to help with medical questions.")]
    )
    
    await ctx.send(adrian.address, initial_msg)
    print(" Alice sent initial message to Adrian")

@adrian.on_event("startup")
async def adrian_startup(ctx: Context):
    """Adrian startup handler"""
    print(f"👨‍💼 Adrian (Financial Agent) started at {adrian.address}")
    print(f"🔗 Adrian endpoint: {adrian.endpoint}")
    
    # Send initial message to Alice
    initial_msg = ChatMessage(
        timestamp=datetime.now(),
        msg_id=str(uuid4()),
        content=[TextContent(type="text", text="Hello Alice! I'm Adrian, your financial advisor. I'm ready to help with investment questions.")]
    )
    
    await ctx.send(alice.address, initial_msg)
    print(" Adrian sent initial message to Alice")

# Demo function to simulate user interaction
async def demo_multi_agent_communication():
    """Demo function showing Alice and Adrian communication"""
    print("\n Starting Multi-Agent Communication Demo")
    print("=" * 50)
    
    # Start both agents
    print("Starting Alice and Adrian agents...")
    
    # This would normally be done with agent.run() but for demo purposes
    # we'll simulate the communication
    
    print("\n Demo: User asks Alice about health insurance")
    print("Alice: I can help with medical questions. For 'health insurance', let me check my knowledge base...")
    print("Alice: Based on my medical knowledge, I recommend consulting a healthcare professional.")
    
    print("\n Demo: User asks Adrian about investment")
    print("Adrian: I can help with financial questions. For 'investment advice', I recommend diversifying your portfolio and considering risk management strategies.")
    
    print("\n Demo: Cross-agent communication")
    print("User: I have a headache and want to invest in healthcare stocks")
    print("Alice: I received 'I have a headache and want to invest in healthcare stocks'. This seems like a financial question. Let me forward this to Adrian...")
    print("Adrian: I received 'I have a headache and want to invest in healthcare stocks'. This seems like a medical question. Let me forward this to Alice...")
    
    print("\n Multi-Agent Communication Demo completed!")
    print("=" * 50)

if __name__ == "__main__":
    print(" Multi-Agent Communication System")
    print("Alice (Healthcare) + Adrian (Financial)")
    print("Following Fetch.ai Innovation Lab workshop examples")
    
    # Run the demo
    asyncio.run(demo_multi_agent_communication())
    
    # Note: To actually run the agents, you would use:
    # alice.run()
    # adrian.run()
    # But for demo purposes, we're showing the communication flow
