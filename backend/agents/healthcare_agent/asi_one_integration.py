# ASI:One API Integration for Healthcare Agent
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
            Analyze this medical query and classify the intent:
            Query: "{query}"
            
            Possible intents:
            - symptom: User is asking about symptoms or conditions
            - treatment: User wants treatment recommendations
            - drug_interaction: User is asking about drug interactions
            - prevention: User wants preventive measures
            - diagnosis: User is asking about diagnosis
            - side_effect: User is asking about medication side effects
            - general: General medical information
            
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
            You are a Healthcare Assistant AI agent. Provide helpful medical information based on the user query and context.
            
            User Query: "{query}"
            
            {context_str}
            
            Guidelines:
            - Provide accurate, helpful medical information
            - Always recommend consulting healthcare professionals for serious conditions
            - Be empathetic and professional
            - Include relevant prevention and treatment advice
            - If information is not available, say so clearly
            
            Respond with a helpful, informative medical response:
            """
            
            response = self._call_asi_one(prompt)
            
            if response and 'response' in response:
                return response['response']
            
            return "I'm here to help with medical questions. Please provide more details about your concern."
            
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
            
            print(f"🔑 Making ASI:One API call with key: {self.api_key[:10]}...")
            print(f"🌐 API URL: {self.base_url}/chat/completions")
            
            payload = {
                "prompt": prompt,
                "max_tokens": 1000,
                "temperature": 0.7
            }
            
            print(f"📤 Sending payload: {payload}")
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            print(f"📥 Response status: {response.status_code}")
            print(f"📥 Response content: {response.text[:200]}...")
            
            if response.status_code == 200:
                data = response.json()
                if 'choices' in data and len(data['choices']) > 0:
                    content = data['choices'][0]['message']['content']
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError:
                        return {"response": content}
            
            logger.error(f"ASI:One API error: {response.status_code}")
            # Fallback to OpenAI
            return self._call_openai_fallback(prompt)
            
        except Exception as e:
            logger.error(f"Error calling ASI:One API: {e}")
            # Fallback to OpenAI
            return self._call_openai_fallback(prompt)
    
    def _call_openai_fallback(self, prompt: str) -> Optional[Dict[str, Any]]:
        """
        Fallback to OpenAI API if ASI:One fails
        """
        try:
            openai_key = os.getenv('OPENAI_API_KEY')
            if not openai_key:
                logger.warning("OpenAI API key not found, using local fallback")
                return None
            
            print(f"🔄 Falling back to OpenAI API")
            
            import openai
            client = openai.OpenAI(api_key=openai_key)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful healthcare assistant AI."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            if response and response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content
                return {"response": content}
            
            return None
            
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return None

# Global ASI:One integration instance
asi_one = ASIOneIntegration()
