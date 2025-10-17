from datetime import datetime
from uuid import uuid4
from uagents import Agent, Context, Protocol
from uagents.setup import fund_agent_if_low
# Chat protocol implementation for ASI:One compatibility
from uagents import Model
from typing import List, Optional
from datetime import datetime
import requests
import json
import sys
import os

# Add the backend directory to Python path for MeTTa integration
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from knowledge.metta_kg.integration import MeTTaKnowledgeGraph

# Initialize the healthcare agent with proper Agentverse configuration
healthcare_agent = Agent(
    name="Healthcare Assistant",
    seed="healthcare-agent-seed-phrase-for-asi-hackathon-2024",
    port=8001,
    endpoint=["http://localhost:8001/submit"]
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

class StartSessionContent(Model):
    type: str = "start_session"

class EndSessionContent(Model):
    type: str = "end_session"

# Initialize the chat protocol
chat_proto = Protocol("chat")

# Initialize MeTTa Knowledge Graph
knowledge_graph = MeTTaKnowledgeGraph()

# Utility function to wrap plain text into a ChatMessage
def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    content = [TextContent(type="text", text=text)]
    return ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=content,
    )

# Healthcare knowledge base
HEALTHCARE_KNOWLEDGE = {
    "symptoms": {
        "fever": "Fever is a temporary increase in body temperature, often due to illness.",
        "headache": "Headache is pain or discomfort in the head or neck area.",
        "cough": "Cough is a reflex action to clear the throat and airways.",
        "fatigue": "Fatigue is extreme tiredness resulting from mental or physical exertion."
    },
    "conditions": {
        "common_cold": "A viral infection affecting the upper respiratory tract.",
        "flu": "Influenza is a viral infection that attacks the respiratory system.",
        "hypertension": "High blood pressure, a condition that can lead to serious health problems."
    },
    "treatments": {
        "rest": "Getting adequate rest is essential for recovery from most illnesses.",
        "hydration": "Staying hydrated helps the body fight infections and maintain health.",
        "medication": "Over-the-counter medications can help relieve symptoms."
    }
}

def analyze_symptoms(symptoms_text: str) -> str:
    """Analyze symptoms and provide preliminary assessment"""
    symptoms = symptoms_text.lower().split()
    found_symptoms = []
    
    for symptom in symptoms:
        if symptom in HEALTHCARE_KNOWLEDGE["symptoms"]:
            found_symptoms.append(symptom)
    
    if found_symptoms:
        analysis = f"I've identified the following symptoms: {', '.join(found_symptoms)}. "
        
        # Provide basic guidance
        if "fever" in found_symptoms:
            analysis += "For fever, I recommend monitoring temperature and staying hydrated. "
        if "cough" in found_symptoms:
            analysis += "For cough, consider throat lozenges and staying hydrated. "
        if "headache" in found_symptoms:
            analysis += "For headache, rest in a dark room and consider over-the-counter pain relief. "
        
        analysis += "If symptoms persist or worsen, please consult a healthcare professional."
    else:
        analysis = "I couldn't identify specific symptoms in your message. Please describe your symptoms in more detail."
    
    return analysis

def get_health_recommendations(condition: str) -> str:
    """Get health recommendations for specific conditions"""
    condition_lower = condition.lower()
    
    if condition_lower in HEALTHCARE_KNOWLEDGE["conditions"]:
        condition_info = HEALTHCARE_KNOWLEDGE["conditions"][condition_lower]
        recommendations = HEALTHCARE_KNOWLEDGE["treatments"]
        
        response = f"Information about {condition}: {condition_info}\n\n"
        response += "General recommendations:\n"
        response += f"- {recommendations['rest']}\n"
        response += f"- {recommendations['hydration']}\n"
        response += f"- {recommendations['medication']}\n\n"
        response += "Remember: This is general information. Consult a healthcare professional for proper diagnosis and treatment."
    else:
        response = f"I don't have specific information about '{condition}'. Please consult a healthcare professional for accurate diagnosis and treatment."
    
    return response

def check_drug_interactions(medications: str) -> str:
    """Check for potential drug interactions"""
    # Common drug interaction database
    INTERACTION_DATABASE = {
        "warfarin": {
            "interactions": ["aspirin", "ibuprofen", "acetaminophen", "alcohol"],
            "severity": "High",
            "description": "Can increase bleeding risk"
        },
        "aspirin": {
            "interactions": ["ibuprofen", "warfarin", "alcohol"],
            "severity": "Medium", 
            "description": "Can increase stomach bleeding risk"
        },
        "ibuprofen": {
            "interactions": ["aspirin", "warfarin", "ace_inhibitors"],
            "severity": "Medium",
            "description": "Can reduce effectiveness of blood pressure medications"
        },
        "acetaminophen": {
            "interactions": ["alcohol"],
            "severity": "High",
            "description": "Can cause liver damage"
        }
    }
    
    medications_lower = medications.lower()
    found_interactions = []
    
    for drug, info in INTERACTION_DATABASE.items():
        if drug in medications_lower:
            for interaction in info["interactions"]:
                if interaction in medications_lower:
                    found_interactions.append({
                        "drug1": drug,
                        "drug2": interaction,
                        "severity": info["severity"],
                        "description": info["description"]
                    })
    
    if found_interactions:
        response = "DRUG INTERACTION ALERT\n\n"
        response += "Potential interactions detected:\n\n"
        
        for interaction in found_interactions:
            response += f"• {interaction['drug1'].title()} + {interaction['drug2'].title()}\n"
            response += f"  Severity: {interaction['severity']}\n"
            response += f"  Risk: {interaction['description']}\n\n"
        
            response += "IMPORTANT: Consult your healthcare provider immediately before taking these medications together."
    else:
        response = "No major drug interactions detected in your medication list.\n\n"
        response += "However, this is a basic check. Always consult your pharmacist or doctor for comprehensive drug interaction analysis."
    
    return response

# Handle incoming chat messages
@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info(f"Healthcare Agent received message from {sender}")
    
    # Always send back an acknowledgement when a message is received
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.utcnow(), 
        acknowledged_msg_id=msg.msg_id
    ))
    
    # Process each content item inside the chat message
    for item in msg.content:
        ctx.logger.info(f"Text message from {sender}: {item.text}")
        
        # Query MeTTa Knowledge Graph for enhanced responses
        kg_response = knowledge_graph.query(item.text)
        
        # Analyze the message and provide appropriate response
        user_message = item.text.lower()
        
        if any(word in user_message for word in ["symptom", "pain", "hurt", "ache", "fever", "cough", "headache"]):
            response_text = analyze_symptoms(item.text)
            # Enhance with knowledge graph insights
            if kg_response.get('status') == 'success':
                response_text += f"\n\nKnowledge Graph Insights: {kg_response.get('message', '')}"
        elif any(word in user_message for word in ["condition", "disease", "illness", "diagnosis"]):
            # Extract potential condition from message
            words = item.text.split()
            potential_condition = next((word for word in words if word.lower() in HEALTHCARE_KNOWLEDGE["conditions"]), "unknown")
            response_text = get_health_recommendations(potential_condition)
            # Enhance with knowledge graph insights
            if kg_response.get('status') == 'success':
                response_text += f"\n\nKnowledge Graph Insights: {kg_response.get('message', '')}"
        elif any(word in user_message for word in ["drug", "medication", "medicine", "interaction", "prescription"]):
            response_text = check_drug_interactions(item.text)
            # Enhance with knowledge graph insights
            if kg_response.get('status') == 'success':
                response_text += f"\n\nKnowledge Graph Insights: {kg_response.get('message', '')}"
        elif any(word in user_message for word in ["hello", "hi", "help", "start"]):
            response_text = (
                "Welcome to the Healthcare Assistant! I can help you with:\n"
                "- Symptom analysis and assessment\n"
                "- General health information\n"
                "- Wellness recommendations\n"
                "- Basic medical guidance\n"
                "- MeTTa Knowledge Graph integration for enhanced insights\n\n"
                "Please describe your symptoms or health concerns, and I'll do my best to assist you."
            )
        else:
            response_text = (
                "I understand you're looking for health information. Please be more specific about:\n"
                "- Your symptoms\n"
                "- Any health conditions you're asking about\n"
                "- The type of assistance you need\n\n"
                "I'm here to help with general health guidance and information."
            )
            # Add knowledge graph insights for general queries
            if kg_response.get('status') == 'success':
                response_text += f"\n\nKnowledge Graph Insights: {kg_response.get('message', '')}"
        
        response_message = create_text_chat(response_text)
        await ctx.send(sender, response_message)

# Handle acknowledgements for messages this agent has sent out
@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Healthcare Agent received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")

if __name__ == "__main__":
    print("Starting Healthcare Assistant Agent...")
    print(f"Agent Address: {healthcare_agent.address}")
    print(f"Agent Name: {healthcare_agent.name}")
    print("Publishing manifest to Agentverse...")
    print("MeTTa Knowledge Graph integration enabled")
    print("Chat Protocol enabled for ASI:One compatibility")
    
    # Include the chat protocol and publish the manifest to Agentverse
    healthcare_agent.include(chat_proto, publish_manifest=True)
    
    # Fund the agent if needed
    fund_agent_if_low(healthcare_agent.wallet.address())
    
    print("Healthcare Assistant Agent is now running!")
    print("=" * 50)
    
    # Run the agent
    healthcare_agent.run()
