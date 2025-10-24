#!/usr/bin/env python3
"""
Financial Advisor Utilities with Intent Classification
Handles LLM integration, intent classification, and response generation for financial queries.
Based on SingularityNET MeTTa and Fetch.ai integration example
"""

import asyncio
from typing import Tuple, List
from datetime import datetime

async def process_query(query: str, rag, llm) -> Tuple[str, float, List[str]]:
    """
    Process a financial query using RAG and LLM integration with intent classification
    
    Args:
        query: The user's financial query
        rag: FinancialRAG instance
        llm: ASIOneIntegration instance
    
    Returns:
        Tuple of (response_text, confidence, sources)
    """
    try:
        # Extract financial intent and entities
        intent = await classify_financial_intent(query, llm)
        
        # Get relevant knowledge from MeTTa
        knowledge_results = rag.query_knowledge(query)
        
        # Generate response using ASI:One with MeTTa knowledge
        response = await generate_financial_response(query, intent, knowledge_results, llm)
        
        # Calculate confidence based on knowledge match and response quality
        confidence = calculate_confidence(knowledge_results, response)
        
        # Extract sources
        sources = extract_sources(knowledge_results)
        
        return response, confidence, sources
        
    except Exception as e:
        # Fallback response
        fallback_response = f"I apologize, but I encountered an error processing your financial query: {str(e)}. Please try rephrasing your question."
        return fallback_response, 0.3, ["fallback"]

async def classify_financial_intent(query: str, llm) -> str:
    """Classify the financial intent of the query using ASI:One"""
    try:
        prompt = f"""
        Classify the following financial query into one of these intents:
        - risk_profile: Find investments suitable for risk tolerance
        - investment_advice: Get investment recommendations
        - expected_return: Learn about expected returns
        - age_allocation: Age-based asset allocation strategies
        - goal_strategy: Investment strategies for specific goals
        - sector_analysis: Information about market sectors
        - investment_mistakes: Common investment mistakes to avoid
        - general: General financial questions
        
        Query: "{query}"
        
        Respond with only the intent category name.
        """
        
        response = await llm.generate_response(prompt)
        intent = response.strip().lower()
        
        # Validate intent
        valid_intents = [
            "risk_profile", "investment_advice", "expected_return", 
            "age_allocation", "goal_strategy", "sector_analysis", 
            "investment_mistakes", "general"
        ]
        
        if intent in valid_intents:
            return intent
        else:
            return "general"
            
    except Exception as e:
        print(f"Error classifying intent: {e}")
        return "general"

async def generate_financial_response(query: str, intent: str, knowledge_results: dict, llm) -> str:
    """Generate financial response using ASI:One with MeTTa knowledge"""
    try:
        # Build context from MeTTa knowledge
        context = build_context_from_knowledge(knowledge_results)
        
        prompt = f"""
        You are a knowledgeable financial advisor. Use the following MeTTa knowledge graph information to answer the user's query.
        
        User Query: "{query}"
        Intent: {intent}
        
        MeTTa Knowledge Context:
        {context}
        
        Provide a comprehensive, accurate financial response based on the MeTTa knowledge graph data. 
        Include specific recommendations, expected returns, risk levels, and practical advice.
        Always recommend consulting with qualified financial professionals for personalized guidance.
        """
        
        response = await llm.generate_response(prompt)
        return response
        
    except Exception as e:
        print(f"Error generating response: {e}")
        return f"I apologize, but I encountered an error generating a response. Please try rephrasing your question."

def build_context_from_knowledge(knowledge_results: dict) -> str:
    """Build context string from MeTTa knowledge results"""
    try:
        context_parts = []
        
        if knowledge_results.get("intent") == "risk_profile":
            investments = knowledge_results.get("investments", [])
            returns = knowledge_results.get("returns", [])
            risks = knowledge_results.get("risks", [])
            
            context_parts.append(f"Risk Profile: {knowledge_results.get('risk_type', 'unknown')}")
            context_parts.append(f"Recommended Investments: {', '.join(investments)}")
            if returns:
                context_parts.append(f"Expected Returns: {', '.join([str(r) for r in returns])}")
            if risks:
                context_parts.append(f"Risk Levels: {', '.join([str(r) for r in risks])}")
        
        elif knowledge_results.get("intent") == "expected_return":
            investment = knowledge_results.get("investment", "unknown")
            returns = knowledge_results.get("returns", [])
            risks = knowledge_results.get("risks", [])
            
            context_parts.append(f"Investment Type: {investment}")
            if returns:
                context_parts.append(f"Expected Returns: {', '.join([str(r) for r in returns])}")
            if risks:
                context_parts.append(f"Risk Level: {', '.join([str(r) for r in risks])}")
        
        elif knowledge_results.get("intent") == "age_allocation":
            age_group = knowledge_results.get("age_group", "unknown")
            allocation = knowledge_results.get("allocation", [])
            
            context_parts.append(f"Age Group: {age_group}")
            if allocation:
                context_parts.append(f"Recommended Allocation: {', '.join([str(a) for a in allocation])}")
        
        elif knowledge_results.get("intent") == "goal_strategy":
            goal = knowledge_results.get("goal", "unknown")
            strategy = knowledge_results.get("strategy", [])
            
            context_parts.append(f"Investment Goal: {goal}")
            if strategy:
                context_parts.append(f"Recommended Strategy: {', '.join([str(s) for s in strategy])}")
        
        elif knowledge_results.get("intent") == "sector_stocks":
            sector = knowledge_results.get("sector", "unknown")
            stocks = knowledge_results.get("stocks", [])
            
            context_parts.append(f"Market Sector: {sector}")
            if stocks:
                context_parts.append(f"Top Stocks: {', '.join([str(s) for s in stocks])}")
        
        return "\n".join(context_parts) if context_parts else "No specific knowledge found for this query."
        
    except Exception as e:
        print(f"Error building context: {e}")
        return "Error building context from knowledge."

def calculate_confidence(knowledge_results: dict, response: str) -> float:
    """Calculate confidence score based on knowledge match and response quality"""
    try:
        confidence = 0.5  # Base confidence
        
        # Increase confidence if we have specific knowledge
        if knowledge_results.get("intent") != "general":
            confidence += 0.3
        
        # Increase confidence if we have detailed results
        if knowledge_results.get("investments") or knowledge_results.get("returns"):
            confidence += 0.2
        
        # Cap at 1.0
        return min(confidence, 1.0)
        
    except Exception as e:
        print(f"Error calculating confidence: {e}")
        return 0.5

def extract_sources(knowledge_results: dict) -> List[str]:
    """Extract sources from knowledge results"""
    try:
        sources = ["MeTTa Knowledge Graph"]
        
        if knowledge_results.get("intent"):
            sources.append(f"Intent: {knowledge_results['intent']}")
        
        return sources
        
    except Exception as e:
        print(f"Error extracting sources: {e}")
        return ["MeTTa Knowledge Graph"]

print("✅ Financial Advisor Utilities with Intent Classification initialized successfully")