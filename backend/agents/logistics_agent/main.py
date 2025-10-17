from datetime import datetime
from uuid import uuid4
from uagents import Agent, Context, Protocol
from uagents.setup import fund_agent_if_low
# Chat protocol implementation for ASI:One compatibility
from uagents import Model
from typing import List, Optional
import requests
import json
import random

# Initialize the logistics agent
logistics_agent = Agent(
    name="Logistics Coordinator",
    seed="logistics-agent-seed-phrase-here",
    port=8002,
    endpoint=["http://localhost:8002/submit"],
)

# Define chat protocol models
class TextContent(Model):
    type: str = "text"
    text: str

class ChatMessage(Model):
    timestamp: datetime
    msg_id: str
    content: List[TextContent]

class ChatAcknowledgement(Model):
    timestamp: datetime
    acknowledged_msg_id: str

# Initialize the chat protocol
chat_proto = Protocol("chat")

# Utility function to wrap plain text into a ChatMessage
def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    content = [TextContent(type="text", text=text)]
    return ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=content,
    )

# Logistics knowledge base
LOGISTICS_KNOWLEDGE = {
    "routes": {
        "optimization": "Route optimization minimizes travel time and fuel consumption while maximizing efficiency.",
        "planning": "Effective route planning considers traffic patterns, delivery windows, and vehicle capacity."
    },
    "inventory": {
        "management": "Inventory management ensures optimal stock levels to meet demand without overstocking.",
        "tracking": "Real-time inventory tracking provides visibility into stock levels and movement."
    },
    "delivery": {
        "tracking": "Package tracking provides real-time updates on delivery status and location.",
        "scheduling": "Delivery scheduling optimizes routes and ensures timely deliveries."
    }
}

# Sample delivery data
SAMPLE_DELIVERIES = [
    {"id": "DEL001", "status": "In Transit", "location": "Warehouse A", "eta": "2 hours"},
    {"id": "DEL002", "status": "Delivered", "location": "Customer Site", "eta": "Completed"},
    {"id": "DEL003", "status": "Processing", "location": "Distribution Center", "eta": "4 hours"},
]

def optimize_route(destinations: list) -> str:
    """Simulate route optimization"""
    if not destinations:
        return "Please provide destination addresses for route optimization."
    
    # Simple simulation - in real implementation, this would use actual mapping APIs
    optimized_route = sorted(destinations, key=lambda x: hash(x) % 100)
    
    response = "Route Optimization Complete:\n"
    response += f"Optimized order for {len(destinations)} destinations:\n"
    
    for i, dest in enumerate(optimized_route, 1):
        response += f"{i}. {dest}\n"
    
    response += f"\nEstimated total distance: {len(destinations) * 15} km\n"
    response += f"Estimated travel time: {len(destinations) * 30} minutes\n"
    response += "Route optimized for fuel efficiency and time savings."
    
    return response

def track_delivery(delivery_id: str) -> str:
    """Track delivery status"""
    # Simulate delivery tracking
    delivery = next((d for d in SAMPLE_DELIVERIES if d["id"].lower() == delivery_id.lower()), None)
    
    if delivery:
        response = f"Delivery Tracking for {delivery['id']}:\n"
        response += f"Status: {delivery['status']}\n"
        response += f"Current Location: {delivery['location']}\n"
        response += f"ETA: {delivery['eta']}\n"
        
        if delivery['status'] == 'In Transit':
            response += "\nYour package is on its way! You can track its progress in real-time."
        elif delivery['status'] == 'Delivered':
            response += "\nPackage has been successfully delivered!"
        else:
            response += "\nPackage is being processed and will be dispatched soon."
    else:
        response = f"Delivery ID '{delivery_id}' not found. Please check the tracking number and try again."
    
    return response

def manage_inventory(item: str, action: str, quantity: int = 0) -> str:
    """Manage inventory operations"""
    if action.lower() == "check":
        # Simulate inventory check
        stock_level = random.randint(0, 100)
        response = f"Inventory Check for {item}:\n"
        response += f"Current Stock: {stock_level} units\n"
        
        if stock_level > 50:
            response += "Status: In Stock (High)\n"
        elif stock_level > 20:
            response += "Status: In Stock (Medium)\n"
        elif stock_level > 0:
            response += "Status: Low Stock - Reorder Recommended\n"
        else:
            response += "Status: Out of Stock - Urgent Reorder Required\n"
        
        response += f"Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    
    elif action.lower() == "update":
        response = f"Inventory Update for {item}:\n"
        response += f"Quantity {quantity} units processed\n"
        response += f"Update completed at {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
        response += "Inventory levels have been updated successfully."
    
    else:
        response = f"Unknown action '{action}'. Available actions: check, update"
    
    return response

def analyze_supply_chain() -> str:
    """Analyze supply chain performance and provide optimization insights"""
    # Simulate supply chain analysis with realistic metrics
    supply_chain_metrics = {
        "performance_indicators": {
            "on_time_delivery": "94.2%",
            "order_fulfillment": "96.8%",
            "inventory_turnover": "8.5x",
            "cost_per_order": "$12.45",
            "lead_time": "3.2 days"
        },
        "bottlenecks": [
            {"location": "Warehouse A", "issue": "High demand for electronics", "impact": "Medium"},
            {"location": "Distribution Center B", "issue": "Labor shortage", "impact": "High"},
            {"location": "Transportation", "issue": "Fuel cost increase", "impact": "Medium"}
        ],
        "optimization_opportunities": [
            {"area": "Inventory Management", "potential_savings": "$45K", "priority": "High"},
            {"area": "Route Optimization", "potential_savings": "$28K", "priority": "Medium"},
            {"area": "Vendor Consolidation", "potential_savings": "$67K", "priority": "High"}
        ],
        "risk_assessment": {
            "supplier_dependency": "Medium Risk",
            "geographic_risk": "Low Risk", 
            "demand_volatility": "High Risk",
            "overall_risk_score": "6.2/10"
        }
    }
    
    response = "SUPPLY CHAIN ANALYSIS REPORT\n"
    response += "=" * 45 + "\n\n"
    
    # Performance Indicators
    response += "PERFORMANCE INDICATORS:\n"
    for metric, value in supply_chain_metrics["performance_indicators"].items():
        response += f"• {metric.replace('_', ' ').title()}: {value}\n"
    response += "\n"
    
    # Bottleneck Analysis
    response += "IDENTIFIED BOTTLENECKS:\n"
    for bottleneck in supply_chain_metrics["bottlenecks"]:
        impact_indicator = "[HIGH]" if bottleneck["impact"] == "High" else "[MEDIUM]" if bottleneck["impact"] == "Medium" else "[LOW]"
        response += f"{impact_indicator} {bottleneck['location']}: {bottleneck['issue']}\n"
    response += "\n"
    
    # Optimization Opportunities
    response += "OPTIMIZATION OPPORTUNITIES:\n"
    for opportunity in supply_chain_metrics["optimization_opportunities"]:
        priority_indicator = "[HIGH]" if opportunity["priority"] == "High" else "[MEDIUM]" if opportunity["priority"] == "Medium" else "[LOW]"
        response += f"{priority_indicator} {opportunity['area']}: {opportunity['potential_savings']} potential savings\n"
    response += "\n"
    
    # Risk Assessment
    risk = supply_chain_metrics["risk_assessment"]
    response += "RISK ASSESSMENT:\n"
    response += f"• Supplier Dependency: {risk['supplier_dependency']}\n"
    response += f"• Geographic Risk: {risk['geographic_risk']}\n"
    response += f"• Demand Volatility: {risk['demand_volatility']}\n"
    response += f"• Overall Risk Score: {risk['overall_risk_score']}\n\n"
    
    # Recommendations
    response += "STRATEGIC RECOMMENDATIONS:\n"
    response += "1. Implement demand forecasting algorithms\n"
    response += "2. Diversify supplier base to reduce dependency\n"
    response += "3. Optimize warehouse layout for faster picking\n"
    response += "4. Negotiate bulk shipping rates\n"
    response += "5. Implement real-time tracking systems\n\n"
    
    response += "Next Review: Schedule for next quarter"
    
    return response

# Handle incoming chat messages
@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info(f"Logistics Agent received message from {sender}")
    
    # Always send back an acknowledgement when a message is received
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.utcnow(), 
        acknowledged_msg_id=msg.msg_id
    ))
    
    # Process each content item inside the chat message
    for item in msg.content:
        # Marks the start of a chat session
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"Logistics session started with {sender}")
            welcome_message = create_text_chat(
                "Hello! I'm your Logistics Coordinator. I can help you with:\n"
                "- Route optimization and planning\n"
                "- Delivery tracking and status updates\n"
                "- Inventory management\n"
                "- Supply chain coordination\n\n"
                "How can I assist you with your logistics needs today?"
            )
            await ctx.send(sender, welcome_message)
        
        # Handles plain text messages
        elif isinstance(item, TextContent):
            ctx.logger.info(f"Text message from {sender}: {item.text}")
            
            user_message = item.text.lower()
            
            if "route" in user_message or "optimize" in user_message:
                # Extract destinations from message (simplified)
                destinations = ["Location A", "Location B", "Location C"]  # In real implementation, parse from message
                response_text = optimize_route(destinations)
            
            elif "track" in user_message or "delivery" in user_message:
                # Extract delivery ID from message
                words = item.text.split()
                delivery_id = next((word for word in words if word.upper().startswith('DEL')), "DEL001")
                response_text = track_delivery(delivery_id)
            
            elif "inventory" in user_message or "stock" in user_message:
                # Simulate inventory management
                response_text = manage_inventory("General Items", "check", 0)
            
            elif "supply" in user_message or "chain" in user_message or "analysis" in user_message:
                response_text = analyze_supply_chain()
            
            elif any(word in user_message for word in ["hello", "hi", "help", "start"]):
                response_text = (
                    "Welcome to the Logistics Coordinator! I specialize in:\n"
                    "- Route Optimization: Minimize travel time and fuel costs\n"
                    "- Delivery Tracking: Real-time package status updates\n"
                    "- Inventory Management: Stock level monitoring and updates\n"
                    "- Supply Chain: End-to-end logistics coordination\n\n"
                    "Please specify what logistics service you need assistance with."
                )
            
            else:
                response_text = (
                    "I can help you with various logistics operations:\n"
                    "- Say 'route optimization' for route planning\n"
                    "- Say 'track delivery' for package tracking\n"
                    "- Say 'inventory check' for stock management\n"
                    "- Ask about supply chain coordination\n\n"
                    "What specific logistics task can I help you with?"
                )
            
            response_message = create_text_chat(response_text)
            await ctx.send(sender, response_message)
        
        # Marks the end of a chat session
        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"Logistics session ended with {sender}")
            goodbye_message = create_text_chat(
                "Thank you for using the Logistics Coordinator. Your logistics operations "
                "are in good hands. Have a great day!"
            )
            await ctx.send(sender, goodbye_message)
        
        # Catches anything unexpected
        else:
            ctx.logger.info(f"Received unexpected content type from {sender}")

# Handle acknowledgements for messages this agent has sent out
@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Logistics Agent received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")

# Include the chat protocol and publish the manifest to Agentverse
logistics_agent.include(chat_proto, publish_manifest=True)

if __name__ == "__main__":
    # Fund the agent if needed
    fund_agent_if_low(logistics_agent.wallet.address())
    
    # Run the agent
    logistics_agent.run()
