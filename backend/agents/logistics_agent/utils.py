#!/usr/bin/env python3
"""
Logistics Coordinator Utilities
Handles LLM integration, intent classification, and response generation for logistics queries.
"""

import asyncio
from typing import Tuple, List
from datetime import datetime

async def process_query(query: str, rag, llm) -> Tuple[str, float, List[str]]:
    """
    Process a logistics query using RAG and LLM integration
    
    Args:
        query: The user's logistics query
        rag: LogisticsRAG instance
        llm: ASIOneIntegration instance
    
    Returns:
        Tuple of (response_text, confidence, sources)
    """
    try:
        # Extract logistics intent and entities
        intent = await classify_logistics_intent(query, llm)
        
        # Get relevant knowledge from MeTTa
        knowledge_results = rag.query_knowledge(query)
        
        # Generate response using ASI:One
        response = await generate_logistics_response(query, intent, knowledge_results, llm)
        
        # Calculate confidence based on knowledge match and response quality
        confidence = calculate_confidence(knowledge_results, response)
        
        # Extract sources
        sources = extract_sources(knowledge_results)
        
        return response, confidence, sources
        
    except Exception as e:
        # Fallback response
        fallback_response = f"I apologize, but I encountered an error processing your logistics query: {str(e)}. Please try rephrasing your question."
        return fallback_response, 0.3, ["fallback"]

async def classify_logistics_intent(query: str, llm) -> str:
    """Classify the logistics intent of the query"""
    intent_prompt = f"""
    Classify the following logistics query into one of these categories:
    - route_optimization: Questions about delivery routes, path planning, navigation
    - inventory_management: Questions about stock levels, warehouse management, inventory tracking
    - delivery_tracking: Questions about package tracking, delivery status, shipment monitoring
    - supply_chain_analysis: Questions about supplier relationships, procurement, supply chain optimization
    - cost_optimization: Questions about reducing logistics costs, efficiency improvements
    - general_logistics: General logistics and supply chain questions
    
    Query: "{query}"
    
    Return only the category name.
    """
    
    try:
        response = llm.generate_response(intent_prompt)
        return response.strip().lower()
    except:
        return "general_logistics"

async def generate_logistics_response(query: str, intent: str, knowledge_results: dict, llm) -> str:
    """Generate a logistics response using OpenAI"""
    import os
    
    # Try OpenAI first
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key:
        import openai
        client = openai.OpenAI(api_key=openai_key)
        
        # Build context from knowledge results
        context = ""
        if knowledge_results and 'results' in knowledge_results:
            for result in knowledge_results['results']:
                context += f"- {result.get('description', '')}\n"
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a knowledgeable Logistics Coordinator AI agent. Provide helpful logistics and supply chain advice. Always recommend consulting logistics experts for complex operations. Be professional and informative."
                },
                {
                    "role": "user",
                    "content": f"Query: {query}\nIntent: {intent}\n\nContext: {context}\n\nProvide comprehensive logistics analysis:"
                }
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    # Fallback to ASI:One
    context = ""
    if knowledge_results and 'results' in knowledge_results:
        for result in knowledge_results['results']:
            context += f"- {result.get('description', '')}\n"
    
    response_prompt = f"""
    You are a professional Logistics Coordinator with expertise in supply chain management, route optimization, and delivery operations.
    
    User Query: "{query}"
    Intent: {intent}
    
    Context from Knowledge Base:
    {context}
    
    Provide a comprehensive logistics analysis and recommendations. Include:
    1. Analysis of the logistics situation/question
    2. Relevant supply chain insights
    3. Specific optimization recommendations with reasoning
    4. Cost and efficiency considerations
    5. Implementation steps
    
    Be professional, accurate, and helpful. If you need more information, ask clarifying questions.
    """
    
    try:
        response = await llm.generate_response(response_prompt)
        return response
    except Exception as e:
        return f"I apologize, but I'm having trouble generating a response right now. Please try again later. Error: {str(e)}"

def calculate_confidence(knowledge_results: dict, response: str) -> float:
    """Calculate confidence score based on knowledge match and response quality"""
    base_confidence = 0.7
    
    # Increase confidence if we have relevant knowledge
    if knowledge_results and 'results' in knowledge_results and len(knowledge_results['results']) > 0:
        base_confidence += 0.2
    
    # Increase confidence if response is comprehensive
    if len(response) > 200:
        base_confidence += 0.1
    
    return min(base_confidence, 1.0)

def extract_sources(knowledge_results: dict) -> List[str]:
    """Extract sources from knowledge results"""
    sources = []
    
    if knowledge_results and 'results' in knowledge_results:
        for result in knowledge_results['results']:
            if 'source' in result:
                sources.append(result['source'])
    
    if not sources:
        sources = ["Logistics Knowledge Base", "Supply Chain Data", "ASI:One AI"]
    
    return sources
