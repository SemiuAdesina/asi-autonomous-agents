#!/usr/bin/env python3
"""
Financial Advisor Agent with Chat Protocol
AI-powered financial analysis and investment recommendations with MeTTa Knowledge Graph and ASI:One integration.
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

from knowledge import FinancialKnowledgeGraph
from financialrag import FinancialRAG
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
    agent_name: str = "Financial Advisor"

class StartSessionContent(Model):
    type: str = "start_session"
    message: str = "Hello! I'm your Financial Advisor. How can I help you with your financial needs today?"

class EndSessionContent(Model):
    type: str = "end_session"
    message: str = "Thank you for using Financial Advisor. Make wise investments!"

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
        agent_name="Financial Advisor"
    )

class FinancialQuery(Model):
    """Financial query message"""
    query: str = Field(description="The financial query or request")
    user_id: str = Field(description="User identifier")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class FinancialResponse(Model):
    """Financial response message"""
    response: str = Field(description="The financial analysis and recommendations")
    confidence: float = Field(description="Confidence score for the response")
    sources: List[str] = Field(description="Sources used for the analysis")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# Initialize the Financial Advisor agent
financial_agent = Agent(
    name="Financial Advisor",
    seed="financial-advisor-seed-key-12345",
    port=8003,
    endpoint=["http://127.0.0.1:8003/submit"],
)

# Initialize components
knowledge_graph = FinancialKnowledgeGraph()
financial_rag = FinancialRAG(knowledge_graph)
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
            response_text = "I didn't receive any text to process. Please send me a financial question."
        else:
            # Process query using MeTTa knowledge graph and ASI:One
            response_text, confidence, sources = await process_query(
                text_content, 
                financial_rag, 
                asi_one
            )
        
        # Create and send response
        response = create_response(response_text, msg.msg_id)
        await ctx.send(sender, response)
        
        print(f"📤 Sent financial response to {sender}: {response_text[:100]}...")
        
    except Exception as e:
        error_response = f"I apologize, but I encountered an error processing your financial query: {str(e)}"
        response = create_response(error_response, msg.msg_id)
        await ctx.send(sender, response)
        print(f"❌ Error handling financial message: {e}")

@chat_proto.on_message(model=StartSessionContent, replies={ChatResponse})
async def handle_start_session(ctx: Context, sender: str, msg: StartSessionContent):
    """Handle session start"""
    response = create_response(msg.message, str(uuid4()))
    await ctx.send(sender, response)
    print(f"🚀 Started financial session with {sender}")

@chat_proto.on_message(model=EndSessionContent, replies={ChatResponse})
async def handle_end_session(ctx: Context, sender: str, msg: EndSessionContent):
    """Handle session end"""
    response = create_response(msg.message, str(uuid4()))
    await ctx.send(sender, response)
    print(f"👋 Ended financial session with {sender}")

@financial_agent.on_message(model=FinancialQuery, replies=FinancialResponse)
async def handle_financial_query(ctx: Context, sender: str, msg: FinancialQuery):
    """Handle financial queries and provide analysis"""
    try:
        ctx.logger.info(f"Received financial query: {msg.query}")
        
        # Process the query using our RAG system and ASI:One
        response_text, confidence, sources = await process_query(
            msg.query, 
            financial_rag, 
            asi_one
        )
        
        # Create response
        response = FinancialResponse(
            response=response_text,
            confidence=confidence,
            sources=sources,
            timestamp=datetime.now().isoformat()
        )
        
        await ctx.send(sender, response)
        ctx.logger.info(f"Sent financial response with confidence: {confidence}")
        
    except Exception as e:
        ctx.logger.error(f"Error processing financial query: {e}")
        error_response = FinancialResponse(
            response=f"I apologize, but I encountered an error processing your financial query: {str(e)}",
            confidence=0.0,
            sources=[],
            timestamp=datetime.now().isoformat()
        )
        await ctx.send(sender, error_response)

@financial_agent.on_interval(period=30.0)
async def periodic_health_check(ctx: Context):
    """Periodic health check and status update"""
    ctx.logger.info("Financial Advisor is healthy and running")

# Include the chat protocol and publish manifest to Agentverse
financial_agent.include(chat_proto, publish_manifest=True)

# Agent startup message
@financial_agent.on_interval(period=1.0)
async def send_initial_message(ctx: Context):
    """Send initial message when agent starts"""
    print("🚀 Starting Financial Advisor Agent")
    print(f"Agent Address: {financial_agent.address}")
    print(f"Agent Name: {financial_agent.name}")
    print("Publishing manifest to Agentverse...")
    print("Chat Protocol enabled for ASI:One compatibility")
    print("MeTTa Knowledge Graph initialized")
    print("ASI:One Integration enabled")
    print("Financial Advisor is now running!")
    print("=" * 50)

if __name__ == "__main__":
    print("Starting Financial Advisor Agent...")
    print(f"Agent address: {financial_agent.address}")
    print(f"Agent endpoint: {financial_agent.endpoint}")
    
    # Fund the agent if needed
    fund_agent_if_low(financial_agent.wallet.address())
    
    # Run the agent
    financial_agent.run()
