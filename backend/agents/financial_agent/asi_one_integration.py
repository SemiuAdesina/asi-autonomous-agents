# ASI:One API Integration for Financial Agent
# This module integrates with ASI:One for intent classification and LLM responses

import requests
import json
import os
from typing import Dict, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class ASIOneIntegration:
    """
    Integration with ASI:One for intent classification and intelligent responses
    """
    
    def __init__(self):
        self.api_key = os.getenv('ASI_ONE_API_KEY')
        self.base_url = "https://asi1.ai/api/v1"
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def classify_intent(self, query: str) -> Tuple[str, str]:
        """
        Classify user intent and extract keywords using ASI:One
        
        Args:
            query: User query string
            
        Returns:
            Tuple of (intent, keyword)
        """
        try:
            prompt = f"""
            Analyze this financial query and classify the intent:
            Query: "{query}"
            
            Possible intents:
            - investment_advice: User wants investment recommendations
            - portfolio_analysis: User wants portfolio analysis
            - risk_assessment: User wants risk evaluation
            - market_analysis: User wants market insights
            - defi_integration: User wants DeFi protocol information
            - returns: User wants return calculations
            - allocation: User wants asset allocation advice
            - general: General financial information
            
            Respond in JSON format:
            {{"intent": "intent_name", "keyword": "extracted_keyword"}}
            """
            
            response = self._call_asi_one(prompt)
            
            if response and 'intent' in response and 'keyword' in response:
                return response['intent'], response['keyword']
            
            return 'general', query.lower()
            
        except Exception as e:
            logger.error(f"Error classifying intent: {e}")
            return 'general', query.lower()
    
    def generate_response(self, query: str, context: Dict[str, Any] = None) -> str:
        """
        Generate intelligent response using ASI:One
        
        Args:
            query: User query
            context: Additional context from MeTTa knowledge graph
            
        Returns:
            Generated response string
        """
        try:
            context_str = ""
            if context:
                context_str = f"Context from knowledge graph: {json.dumps(context, indent=2)}"
            
            prompt = f"""
            You are a Financial Advisor AI agent. Provide helpful financial advice based on the user query and context.
            
            User Query: "{query}"
            
            {context_str}
            
            Guidelines:
            - Provide accurate, helpful financial information
            - Always recommend consulting financial advisors for major decisions
            - Be professional and informative
            - Include relevant risk assessments and market insights
            - If information is not available, say so clearly
            
            Respond with a helpful, informative financial response:
            """
            
            response = self._call_asi_one(prompt)
            
            if response and 'response' in response:
                return response['response']
            
            return "I'm here to help with financial questions. Please provide more details about your investment needs."
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I apologize, but I'm experiencing technical difficulties. Please try again."
    
    def _call_asi_one(self, prompt: str) -> Optional[Dict[str, Any]]:
        """
        Make API call to ASI:One
        
        Args:
            prompt: Prompt to send to ASI:One
            
        Returns:
            Response from ASI:One API
        """
        try:
            if not self.api_key:
                logger.warning("ASI:One API key not found, using fallback")
                return None
            
            payload = {
                "prompt": prompt,
                "max_tokens": 1000,
                "temperature": 0.7
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'choices' in data and len(data['choices']) > 0:
                    content = data['choices'][0]['message']['content']
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError:
                        return {"response": content}
            
            logger.error(f"ASI:One API error: {response.status_code}")
            return None
            
        except Exception as e:
            logger.error(f"Error calling ASI:One API: {e}")
            return None

# Global ASI:One integration instance
asi_one = ASIOneIntegration()
