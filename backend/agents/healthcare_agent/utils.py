#!/usr/bin/env python3
"""
LLM Integration and Query Processing Logic - Following Official Workshop Structure
Based on the Fetch.ai Innovation Lab examples
"""

import json
import os
from typing import Dict, List, Any, Optional, Tuple
import logging

# Import requests - it's in requirements.txt
import requests

logger = logging.getLogger(__name__)

class ASIOneIntegration:
    """
    ASI:One Integration for intent classification and response generation
    Following the workshop examples
    """
    
    def __init__(self):
        self.api_key = os.getenv('ASI_ONE_API_KEY')
        self.base_url = os.getenv('ASI_BASE_URL', 'https://api.asi1.ai/v1')
        self.model = os.getenv('ASI_MODEL', 'asi1-mini')
        
        if not self.api_key:
            raise ValueError("ASI_ONE_API_KEY environment variable is required")
        
        print("✅ ASI:One Integration initialized")
    
    def classify_intent(self, text: str) -> Tuple[str, str]:
        """
        Classify user intent using ASI:One API
        """
        try:
            # For demo purposes, we'll use pattern matching
            # In production, this would call the ASI:One API
            text_lower = text.lower()
            
            if any(word in text_lower for word in ["symptom", "pain", "hurt", "ache", "fever", "headache", "nausea", "dizzy"]):
                return "symptom", "general_symptom"
            elif any(word in text_lower for word in ["treatment", "cure", "medicine", "medication", "therapy", "remedy"]):
                return "treatment", "general_treatment"
            elif any(word in text_lower for word in ["side effect", "side_effect", "adverse", "reaction"]):
                return "side_effect", "general_side_effect"
            elif any(word in text_lower for word in ["drug interaction", "interaction", "mix", "together", "combine"]):
                return "drug_interaction", "general_interaction"
            elif any(word in text_lower for word in ["prevent", "avoid", "protection", "vaccination", "prevention"]):
                return "prevention", "general_prevention"
            else:
                return "general", "general_query"
                
        except Exception as e:
            logger.error(f"Error classifying intent: {e}")
            return "general", "general_query"
    
    def generate_response(self, query: str, context: Dict[str, Any]) -> str:
        """
        Generate response using OpenAI API
        """
        try:
            # Use OpenAI for response generation
            openai_key = os.getenv('OPENAI_API_KEY')
            if openai_key:
                import openai
                client = openai.OpenAI(api_key=openai_key)
                
                intent = context.get('intent', 'general')
                
                # Build context for OpenAI
                system_prompt = "You are a helpful AI healthcare assistant. Provide accurate medical information, symptom analysis, and general health guidance. Always recommend consulting with healthcare professionals for serious medical concerns. Be empathetic and professional in your responses."
                
                user_prompt = query
                if intent == 'symptom':
                    user_prompt = f"User is experiencing: {query}. Please provide helpful medical information about this symptom."
                
                r = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=500,
                    temperature=0.7
                )
                
                return r.choices[0].message.content
            
            # Fallback to local generation if no OpenAI key
            intent = context.get('intent', 'general')
            
            if intent == 'symptom':
                diseases = context.get('diseases', [])
                treatments = context.get('treatments', [])
                symptom = context.get('symptom', 'the symptom')
                
                response = f"Based on your symptom '{symptom}', here's what I found:\n\n"
                
                if diseases:
                    response += f"🔍 **Potential Conditions:** {', '.join(diseases)}\n\n"
                
                if treatments:
                    response += f"💊 **Recommended Treatments:** {', '.join(treatments)}\n\n"
                
                response += "⚠️ **Important:** This is for informational purposes only. Please consult with a healthcare professional for proper diagnosis and treatment."
                
                return response
                
            elif intent == 'treatment':
                treatments = context.get('treatments', [])
                side_effects = context.get('side_effects', [])
                condition = context.get('condition', 'the condition')
                
                response = f"For '{condition}', here are the treatment options:\n\n"
                
                if treatments:
                    response += f"💊 **Treatments:** {', '.join(treatments)}\n\n"
                
                if side_effects:
                    response += f"⚠️ **Potential Side Effects:** {', '.join(side_effects)}\n\n"
                
                response += "📋 **Note:** Always follow your healthcare provider's instructions and dosage recommendations."
                
                return response
                
            elif intent == 'drug_interaction':
                interaction = context.get('interaction', 'No specific interaction found')
                drugs = context.get('drugs', ['the medications'])
                
                response = f"🔍 **Drug Interaction Analysis:**\n\n"
                response += f"**Medications:** {', '.join(drugs)}\n\n"
                response += f"**Interaction:** {interaction}\n\n"
                response += "⚠️ **Important:** Always inform your healthcare provider about all medications you're taking."
                
                return response
                
            elif intent == 'prevention':
                prevention_tips = context.get('prevention_tips', [])
                topic = context.get('topic', 'general health')
                
                response = f"🛡️ **Prevention Tips for {topic}:**\n\n"
                
                if prevention_tips:
                    for i, tip in enumerate(prevention_tips, 1):
                        response += f"{i}. {tip.replace('_', ' ').title()}\n"
                
                response += "\n💡 **Remember:** Prevention is the best medicine!"
                
                return response
                
            else:
                # General response
                response = f"🤖 **Healthcare Assistant Response:**\n\n"
                response += f"I understand you're asking about: '{query}'\n\n"
                response += "I'm here to help with healthcare information. You can ask me about:\n"
                response += "• Symptoms and potential conditions\n"
                response += "• Treatment options\n"
                response += "• Drug interactions\n"
                response += "• Prevention strategies\n\n"
                response += "Please provide more specific details so I can give you the most helpful information."
                
                return response
                
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I apologize, but I encountered an error processing your request. Please try again."

def get_intent_and_keyword(query: str, llm: ASIOneIntegration) -> Tuple[str, str]:
    """
    Extract intent and keyword from user query
    """
    return llm.classify_intent(query)

def process_query(query: str, rag, llm: ASIOneIntegration) -> str:
    """
    Process user query using MeTTa knowledge graph and ASI:One
    Following the workshop data flow: User Query → Intent Classification → MeTTa Query → Knowledge Retrieval → LLM Response → User
    """
    try:
        print(f"🔄 Processing query: '{query}'")
        
        # Step 1: Intent Classification
        intent, keyword = get_intent_and_keyword(query, llm)
        print(f"🧠 Intent classified as: {intent}, keyword: {keyword}")
        
        # Step 2: MeTTa Query based on intent
        context = {'intent': intent, 'query': query}
        
        if intent == 'symptom':
            # Extract symptom from query
            symptom = keyword if keyword != 'general_symptom' else extract_symptom_from_query(query)
            diseases = rag.query_symptom(symptom)
            treatments = []
            if diseases:
                treatments = rag.get_treatment(diseases[0])
            
            print(f"🔍 Symptom analysis - Symptom: {symptom}, Diseases: {diseases}, Treatments: {treatments}")
            
            context.update({
                'symptom': symptom,
                'diseases': diseases,
                'treatments': treatments
            })
            
        elif intent == 'treatment':
            condition = keyword if keyword != 'general_treatment' else extract_condition_from_query(query)
            treatments = rag.get_treatment(condition)
            side_effects = []
            if treatments:
                side_effects = rag.get_side_effects(treatments[0])
            
            context.update({
                'condition': condition,
                'treatments': treatments,
                'side_effects': side_effects
            })
            
        elif intent == 'drug_interaction':
            drugs = extract_drugs_from_query(query)
            interaction = "No specific interaction found"
            if len(drugs) >= 2:
                interaction = rag.check_drug_interaction(drugs[0], drugs[1])
            
            context.update({
                'drugs': drugs,
                'interaction': interaction
            })
            
        elif intent == 'prevention':
            topic = keyword if keyword != 'general_prevention' else extract_topic_from_query(query)
            prevention_tips = rag.get_prevention(topic)
            
            context.update({
                'topic': topic,
                'prevention_tips': prevention_tips
            })
            
        else:
            # General query
            general_info = rag.query_general(query)
            context.update({
                'general_info': general_info
            })
        
        # Step 3: Generate response using ASI:One
        response = llm.generate_response(query, context)
        
        # Step 4: Dynamic knowledge addition if needed
        if intent == 'general' and not context.get('general_info'):
            rag.add_knowledge("general_query", query.lower().replace(" ", "_"), "User asked about this topic", "user")
        
        print(f"✅ Query processed successfully")
        return response
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return "I apologize, but I encountered an error processing your request. Please try again."

def extract_symptom_from_query(query: str) -> str:
    """Extract symptom from query"""
    query_lower = query.lower()
    symptoms = ["headache", "fever", "pain", "nausea", "dizzy", "chest pain", "fatigue"]
    for symptom in symptoms:
        if symptom in query_lower:
            return symptom
    return "general_symptom"

def extract_condition_from_query(query: str) -> str:
    """Extract condition from query"""
    query_lower = query.lower()
    conditions = ["flu", "covid", "migraine", "heart attack", "angina"]
    for condition in conditions:
        if condition in query_lower:
            return condition
    return "general_condition"

def extract_drugs_from_query(query: str) -> List[str]:
    """Extract drugs from query"""
    query_lower = query.lower()
    drugs = []
    common_drugs = ["aspirin", "ibuprofen", "acetaminophen", "warfarin", "nitroglycerin"]
    for drug in common_drugs:
        if drug in query_lower:
            drugs.append(drug)
    return drugs

def extract_topic_from_query(query: str) -> str:
    """Extract topic from query"""
    query_lower = query.lower()
    if "flu" in query_lower:
        return "flu"
    elif "heart" in query_lower:
        return "heart_disease"
    elif "migraine" in query_lower:
        return "migraine"
    return "general_health"

print("✅ Utils module initialized successfully")
