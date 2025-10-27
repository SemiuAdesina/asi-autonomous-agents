#!/usr/bin/env python3
"""
Main uAgent Implementation with Chat Protocol - Following Official Workshop Structure
Based on the Fetch.ai Innovation Lab examples
"""

from datetime import datetime
from uuid import uuid4
from uagents import Agent, Context, Protocol
from uagents.setup import fund_agent_if_low
from uagents import Model
from typing import List, Optional
import sys
import os
import json
from flask import Flask, request, jsonify

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

# Import MeTTa knowledge graph and RAG system
from knowledge import medical_metta
from medicalrag import MedicalRAG
from utils import ASIOneIntegration, process_query

# Initialize the healthcare agent with proper Agentverse configuration
healthcare_agent = Agent(
    name="Healthcare Assistant",
    seed="healthcare-agent-seed-phrase-for-asi-hackathon-2024",
    port=8001,
    endpoint=["http://localhost:8001/submit"]
)

# Initialize RAG system and ASI:One integration
rag = MedicalRAG(medical_metta)
asi_one = ASIOneIntegration()

# Define complete Chat Protocol models as shown in workshop
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
    message: str = "Hello! I'm your Healthcare Assistant. How can I help you today?"

class EndSessionContent(Model):
    type: str = "end_session"
    message: str = "Thank you for using Healthcare Assistant. Take care!"

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
        agent_name="Healthcare Assistant"
    )

# Initialize the chat protocol
chat_proto = Protocol("chat", version="1.0.0")

@chat_proto.on_message(model=ChatMessage, replies={ChatResponse})
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """
    Handle incoming chat messages using MeTTa knowledge graph and ASI:One
    Following the workshop data flow
    """
    try:
        # Extract text content from message
        text_content = ""
        for content in msg.content:
            if content.type == "text":
                text_content += content.text + " "
        
        text_content = text_content.strip()
        
        if not text_content:
            response_text = "I didn't receive any text to process. Please send me a message."
        else:
            # Process query using MeTTa knowledge graph and ASI:One
            response_text = process_query(text_content, rag, asi_one)
        
        # Create and send response
        response = create_response(response_text, msg.msg_id)
        await ctx.send(sender, response)
        
        print(f" Sent response to {sender}: {response_text[:100]}...")
        
    except Exception as e:
        error_response = f"I apologize, but I encountered an error processing your message: {str(e)}"
        response = create_response(error_response, msg.msg_id)
        await ctx.send(sender, response)
        print(f" Error handling message: {e}")

@chat_proto.on_message(model=StartSessionContent, replies={ChatResponse})
async def handle_start_session(ctx: Context, sender: str, msg: StartSessionContent):
    """Handle session start"""
    response = create_response(msg.message, str(uuid4()))
    await ctx.send(sender, response)
    print(f" Started session with {sender}")

@chat_proto.on_message(model=EndSessionContent, replies={ChatResponse})
async def handle_end_session(ctx: Context, sender: str, msg: EndSessionContent):
    """Handle session end"""
    response = create_response(msg.message, str(uuid4()))
    await ctx.send(sender, response)
    print(f"👋 Ended session with {sender}")

# Include the chat protocol and publish manifest to Agentverse
healthcare_agent.include(chat_proto, publish_manifest=True)

# Agent startup message
@healthcare_agent.on_interval(period=1.0)
async def send_initial_message(ctx: Context):
    """Send initial message when agent starts"""
    print(" Starting Healthcare Agent")
    print(f"Agent Address: {healthcare_agent.address}")
    print(f"Agent Name: {healthcare_agent.name}")
    print("Publishing manifest to Agentverse...")
    print("Chat Protocol enabled for ASI:One compatibility")
    print("REST API endpoints available")
    print("MeTTa Knowledge Graph initialized")
    print("ASI:One Integration enabled")
    print("Healthcare Agent is now running!")
    print("=" * 50)

# Create Flask app for HTTP endpoints
app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    """HTTP endpoint for chat messages from frontend"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        print(f" Frontend message received: {message}")
        
        # Process the message using MeTTa and ASI:One
        response = process_query(message)
        
        print(f"🧠 MeTTa response: {response}")
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'agent': 'Healthcare Assistant',
            'metta_integration': True
        })
        
    except Exception as e:
        print(f" Error in chat endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'agent': 'Healthcare Assistant',
        'metta_integration': True,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == "__main__":
    # Start Flask app in a separate thread on port 8002
    import threading
    flask_thread = threading.Thread(target=lambda: app.run(host='0.0.0.0', port=8002, debug=False))
    flask_thread.daemon = True
    flask_thread.start()
    
    print(" Flask HTTP endpoints available on port 8002")
    
    # Fund the agent if needed
    fund_agent_if_low(healthcare_agent.wallet.address())
    
    # Run the agent
    healthcare_agent.run()
