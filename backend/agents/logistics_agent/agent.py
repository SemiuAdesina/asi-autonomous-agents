#!/usr/bin/env python3
"""
Logistics Coordinator Agent with Chat Protocol
AI-powered supply chain optimization and delivery management with MeTTa Knowledge Graph and ASI:One integration.
"""

import os
import sys
import asyncio
from datetime import datetime
from uuid import uuid4
from typing import Dict, Any, List
from uagents import Agent, Context, Model, Protocol
from uagents.setup import fund_agent_if_low
from pydantic import Field
import json

# Add the parent directory to the path to import our modules
sys.path.append(os.path.dirname(__file__))

from knowledge import LogisticsKnowledgeGraph
from logisticsrag import LogisticsRAG
from asi_one_integration import ASIOneIntegration
from utils import process_query

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
    message: str = "Hello! I'm your Logistics Coordinator. How can I help optimize your supply chain today?"

class EndSessionContent(Model):
    type: str = "end_session"
    message: str = "Thank you for using Logistics Coordinator. Safe travels!"

def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    """Create a chat message with text content"""
    return ChatMessage(
        timestamp=datetime.now(),
        msg_id=str(uuid4()),
        content=[TextContent(type="text", text=text)]
    )

def create_response(text: str, msg_id: str) -> ChatResponse:
    """Create a chat response"""
    return ChatResponse(
        timestamp=datetime.now(),
        msg_id=msg_id,
        content=[TextContent(type="text", text=text)],
        agent_name="Logistics Coordinator"
    )

class LogisticsQuery(Model):
    """Logistics query message"""
    query: str = Field(description="The logistics query or request")
    user_id: str = Field(description="User identifier")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class LogisticsResponse(Model):
    """Logistics response message"""
    response: str = Field(description="The logistics analysis and recommendations")
    confidence: float = Field(description="Confidence score for the response")
    sources: List[str] = Field(description="Sources used for the analysis")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# Initialize the Logistics Coordinator agent
logistics_agent = Agent(
    name="Logistics Coordinator",
    seed="logistics-coordinator-seed-key-12345",
    port=8004,
    endpoint=["http://127.0.0.1:8004/submit"],
)

# Initialize components
knowledge_graph = LogisticsKnowledgeGraph()
logistics_rag = LogisticsRAG(knowledge_graph)
asi_one = ASIOneIntegration()

# Initialize the chat protocol
chat_proto = Protocol("chat", version="1.0.0")

@chat_proto.on_message(model=ChatMessage, replies={ChatResponse})
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    """Handle incoming chat messages using MeTTa knowledge graph and ASI:One"""
    try:
        # Extract text content from message
        text_content = ""
        for content in msg.content:
            if content.type == "text":
                text_content += content.text + " "
        
        text_content = text_content.strip()
        
        if not text_content:
            response_text = "I didn't receive any text to process. Please send me a logistics question."
        else:
            # Process query using MeTTa knowledge graph and ASI:One
            response_text, confidence, sources = await process_query(
                text_content, 
                logistics_rag, 
                asi_one
            )
        
        # Create and send response
        response = create_response(response_text, msg.msg_id)
        await ctx.send(sender, response)
        
        print(f" Sent logistics response to {sender}: {response_text[:100]}...")
        
    except Exception as e:
        error_response = f"I apologize, but I encountered an error processing your logistics query: {str(e)}"
        response = create_response(error_response, msg.msg_id)
        await ctx.send(sender, response)
        print(f" Error handling logistics message: {e}")

@chat_proto.on_message(model=StartSessionContent, replies={ChatResponse})
async def handle_start_session(ctx: Context, sender: str, msg: StartSessionContent):
    """Handle session start"""
    response = create_response(msg.message, str(uuid4()))
    await ctx.send(sender, response)
    print(f" Started logistics session with {sender}")

@chat_proto.on_message(model=EndSessionContent, replies={ChatResponse})
async def handle_end_session(ctx: Context, sender: str, msg: EndSessionContent):
    """Handle session end"""
    response = create_response(msg.message, str(uuid4()))
    await ctx.send(sender, response)
    print(f"👋 Ended logistics session with {sender}")

@logistics_agent.on_message(model=LogisticsQuery, replies=LogisticsResponse)
async def handle_logistics_query(ctx: Context, sender: str, msg: LogisticsQuery):
    """Handle logistics queries and provide analysis"""
    try:
        ctx.logger.info(f"Received logistics query: {msg.query}")
        
        # Process the query using our RAG system and ASI:One
        response_text, confidence, sources = await process_query(
            msg.query, 
            logistics_rag, 
            asi_one
        )
        
        # Create response
        response = LogisticsResponse(
            response=response_text,
            confidence=confidence,
            sources=sources,
            timestamp=datetime.now().isoformat()
        )
        
        await ctx.send(sender, response)
        ctx.logger.info(f"Sent logistics response with confidence: {confidence}")
        
    except Exception as e:
        ctx.logger.error(f"Error processing logistics query: {e}")
        error_response = LogisticsResponse(
            response=f"I apologize, but I encountered an error processing your logistics query: {str(e)}",
            confidence=0.0,
            sources=[],
            timestamp=datetime.now().isoformat()
        )
        await ctx.send(sender, error_response)

@logistics_agent.on_interval(period=30.0)
async def periodic_health_check(ctx: Context):
    """Periodic health check and status update"""
    ctx.logger.info("Logistics Coordinator is healthy and running")

# Include the chat protocol and publish manifest to Agentverse
logistics_agent.include(chat_proto, publish_manifest=True)

# Agent startup message
@logistics_agent.on_interval(period=1.0)
async def send_initial_message(ctx: Context):
    """Send initial message when agent starts"""
    print(" Starting Logistics Coordinator Agent")
    print(f"Agent Address: {logistics_agent.address}")
    print(f"Agent Name: {logistics_agent.name}")
    print("Publishing manifest to Agentverse...")
    print("Chat Protocol enabled for ASI:One compatibility")
    print("MeTTa Knowledge Graph initialized")
    print("ASI:One Integration enabled")
    print("Logistics Coordinator is now running!")
    print("=" * 50)

if __name__ == "__main__":
    print("Starting Logistics Coordinator Agent...")
    print(f"Agent address: {logistics_agent.address}")
    print(f"Agent endpoint: {logistics_agent.endpoint}")
    
    # Fund the agent if needed
    fund_agent_if_low(logistics_agent.wallet.address())
    
    # Run the agent
    logistics_agent.run()
