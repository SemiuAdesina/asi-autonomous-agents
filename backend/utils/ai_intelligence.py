import openai
import requests
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from utils.logging import StructuredLogger

logger = StructuredLogger('ai_intelligence')

class AIAgentIntelligence:
    """Enhanced AI intelligence for agents"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.model_configs = {
            'gpt-4': {'provider': 'openai', 'max_tokens': 4000},
            'gpt-3.5-turbo': {'provider': 'openai', 'max_tokens': 2000},
            'claude-3': {'provider': 'anthropic', 'max_tokens': 4000}
        }
    
    def generate_response(self, agent_type: str, user_message: str, context: Dict[str, Any] = None) -> str:
        """Generate intelligent response using AI"""
        
        try:
            # Get agent-specific prompt
            prompt = self._build_agent_prompt(agent_type, user_message, context)
            
            # Choose model based on agent type
            model = self._select_model(agent_type)
            
            # Generate response
            response = self._call_ai_model(model, prompt)
            
            # Log interaction
            logger.log_event('INFO', 'ai_response_generated', {
                'agent_type': agent_type,
                'model': model,
                'user_message_length': len(user_message),
                'response_length': len(response),
                'context_provided': bool(context)
            })
            
            return response
            
        except Exception as e:
            logger.log_error(e, f"AI response generation failed for {agent_type}")
            return self._fallback_response(agent_type, user_message)
    
    def _build_agent_prompt(self, agent_type: str, user_message: str, context: Dict[str, Any] = None) -> str:
        """Build agent-specific prompt"""
        
        base_prompts = {
            'healthcare': {
                'system': """You are a professional Healthcare Assistant AI agent. You provide medical guidance, symptom analysis, and health recommendations. Always emphasize that you are not a replacement for professional medical advice and encourage users to consult healthcare professionals for serious concerns.""",
                'capabilities': [
                    "Symptom analysis and preliminary assessment",
                    "Health education and wellness guidance", 
                    "Medication information and interactions",
                    "Lifestyle and dietary recommendations",
                    "Mental health support and resources"
                ],
                'guidelines': [
                    "Never provide specific medical diagnoses",
                    "Always recommend professional consultation for serious symptoms",
                    "Maintain patient confidentiality and privacy",
                    "Provide evidence-based information",
                    "Be empathetic and supportive"
                ]
            },
            'financial': {
                'system': """You are a professional Financial Advisor AI agent specializing in DeFi, cryptocurrency, and traditional finance. You provide investment guidance, portfolio analysis, and financial planning advice.""",
                'capabilities': [
                    "Portfolio analysis and optimization",
                    "DeFi protocol recommendations",
                    "Risk assessment and management",
                    "Market analysis and insights",
                    "Tax planning and compliance guidance"
                ],
                'guidelines': [
                    "Always include risk disclaimers",
                    "Provide diversified investment strategies",
                    "Consider user's risk tolerance",
                    "Stay updated on market conditions",
                    "Comply with financial regulations"
                ]
            },
            'logistics': {
                'system': """You are a professional Logistics Coordinator AI agent specializing in supply chain optimization, route planning, and delivery management.""",
                'capabilities': [
                    "Route optimization and planning",
                    "Inventory management strategies",
                    "Supply chain analysis",
                    "Cost reduction recommendations",
                    "Delivery tracking and management"
                ],
                'guidelines': [
                    "Focus on efficiency and cost-effectiveness",
                    "Consider environmental impact",
                    "Provide data-driven recommendations",
                    "Account for real-world constraints",
                    "Optimize for customer satisfaction"
                ]
            }
        }
        
        agent_config = base_prompts.get(agent_type, base_prompts['healthcare'])
        
        # Build context information
        context_info = ""
        if context:
            context_info = f"\n\nAdditional Context:\n{json.dumps(context, indent=2)}"
        
        prompt = f"""{agent_config['system']}

Your capabilities include:
{chr(10).join(f"- {cap}" for cap in agent_config['capabilities'])}

Guidelines to follow:
{chr(10).join(f"- {guideline}" for guideline in agent_config['guidelines'])}

User Message: {user_message}{context_info}

Please provide a helpful, accurate, and professional response. Be concise but comprehensive."""

        return prompt
    
    def _select_model(self, agent_type: str) -> str:
        """Select appropriate AI model based on agent type"""
        
        # Use GPT-4 for complex financial analysis
        if agent_type == 'financial':
            return 'gpt-4'
        
        # Use GPT-3.5-turbo for healthcare (reliable and cost-effective)
        if agent_type == 'healthcare':
            return 'gpt-3.5-turbo'
        
        # Use GPT-3.5 for logistics (cost-effective)
        return 'gpt-3.5-turbo'
    
    def _call_ai_model(self, model: str, prompt: str) -> str:
        """Call the appropriate AI model"""
        
        model_config = self.model_configs.get(model, self.model_configs['gpt-3.5-turbo'])
        provider = model_config['provider']
        
        if provider == 'openai' and self.openai_api_key:
            return self._call_openai(model, prompt)
        elif provider == 'anthropic' and self.anthropic_api_key:
            return self._call_anthropic(model, prompt)
        else:
            # Fallback to mock response
            return self._mock_ai_response(prompt)
    
    def _call_openai(self, model: str, prompt: str) -> str:
        """Call OpenAI API"""
        try:
            from openai import OpenAI
            
            client = OpenAI(api_key=self.openai_api_key)
            
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.model_configs[model]['max_tokens'],
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.log_error(e, f"OpenAI API call failed for model {model}")
            raise
    
    def _call_anthropic(self, model: str, prompt: str) -> str:
        """Call Anthropic API"""
        try:
            headers = {
                'x-api-key': self.anthropic_api_key,
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': model,
                'prompt': prompt,
                'max_tokens_to_sample': self.model_configs[model]['max_tokens']
            }
            
            response = requests.post(
                'https://api.anthropic.com/v1/complete',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()['completion'].strip()
            else:
                raise Exception(f"Anthropic API error: {response.status_code}")
                
        except Exception as e:
            logger.log_error(e, f"Anthropic API call failed for model {model}")
            raise
    
    def _mock_ai_response(self, prompt: str) -> str:
        """Generate intelligent mock AI response for testing"""
        
        # Extract user message from prompt
        user_message = ""
        if "User Message:" in prompt:
            user_message = prompt.split("User Message:")[-1].strip().lower()
        
        # Healthcare Assistant responses
        if 'Healthcare Assistant' in prompt:
            if any(word in user_message for word in ['headache', 'head', 'pain']):
                return """I understand you're experiencing headaches. Headaches can have various causes including stress, dehydration, poor sleep, or tension. I recommend:

• Stay hydrated by drinking plenty of water
• Get adequate sleep (7-9 hours)
• Practice stress management techniques
• Consider over-the-counter pain relief if appropriate
• Apply a cold compress to your forehead

If headaches persist for more than a few days, become severe, or are accompanied by other symptoms like vision changes or nausea, please consult with a healthcare professional immediately. I'm here to provide general guidance, but persistent headaches may require medical evaluation."""

            elif any(word in user_message for word in ['blood pressure', 'hypertension', 'pressure']):
                return """High blood pressure is a serious condition that requires medical attention. Here are some general lifestyle recommendations:

• Reduce sodium intake (aim for less than 2,300mg daily)
• Maintain a healthy weight
• Exercise regularly (at least 150 minutes per week)
• Limit alcohol consumption
• Manage stress through relaxation techniques
• Quit smoking if applicable

Please consult with your healthcare provider for proper diagnosis, monitoring, and treatment. Blood pressure management often requires medication and regular monitoring."""

            elif any(word in user_message for word in ['anxious', 'anxiety', 'stressed', 'stress']):
                return """I understand you're feeling anxious and stressed. These are common experiences that can be managed with various strategies:

• Practice deep breathing exercises
• Try meditation or mindfulness techniques
• Maintain a regular sleep schedule
• Exercise regularly (even light activity helps)
• Limit caffeine and alcohol
• Stay connected with supportive friends and family
• Consider professional counseling if symptoms persist

If anxiety is significantly impacting your daily life, please consider speaking with a mental health professional who can provide personalized treatment options."""

            elif any(word in user_message for word in ['diabetes', 'sugar', 'glucose']):
                return """Diabetes symptoms can include increased thirst, frequent urination, unexplained weight loss, fatigue, blurred vision, and slow-healing wounds. However, symptoms can vary:

• Type 1 diabetes often develops quickly with severe symptoms
• Type 2 diabetes may develop gradually with mild or no symptoms
• Gestational diabetes occurs during pregnancy

If you're experiencing these symptoms, please consult with a healthcare provider for proper testing and diagnosis. Early detection and management are crucial for preventing complications."""

            elif any(word in user_message for word in ['sleep', 'insomnia', 'tired', 'fatigue']):
                return """Improving sleep quality involves several lifestyle adjustments:

• Maintain a consistent sleep schedule
• Create a comfortable, dark, and cool sleep environment
• Avoid screens 1 hour before bedtime
• Limit caffeine after 2 PM
• Exercise regularly but not too close to bedtime
• Practice relaxation techniques before bed
• Avoid large meals and alcohol before sleep

If sleep problems persist despite these changes, consider consulting with a healthcare provider to rule out underlying conditions like sleep apnea."""

            else:
                return """I understand your health concern. As a Healthcare Assistant, I can provide general health guidance and information. However, I must emphasize that I am not a replacement for professional medical advice. For any serious symptoms or concerns, please consult with a qualified healthcare professional who can provide proper diagnosis and treatment. I'm here to support your health journey with evidence-based information and general wellness guidance."""

        # Financial Advisor responses
        elif 'Financial Advisor' in prompt:
            if any(word in user_message for word in ['bitcoin', 'crypto', 'cryptocurrency', 'btc']):
                return """Bitcoin and cryptocurrency investments carry significant risk and volatility. Here's what you should consider:

• Only invest what you can afford to lose completely
• Cryptocurrency is highly speculative and volatile
• Consider it a small portion (5-10%) of a diversified portfolio
• Research thoroughly before investing
• Be prepared for significant price swings
• Consider dollar-cost averaging to reduce timing risk

Remember: Past performance doesn't guarantee future results. Cryptocurrency investments are not suitable for everyone and should be approached with caution."""

            elif any(word in user_message for word in ['defi', 'yield', 'staking', 'liquidity']):
                return """DeFi (Decentralized Finance) offers opportunities but also significant risks:

• Research protocols thoroughly before investing
• Start with well-established, audited protocols
• Understand impermanent loss in liquidity pools
• Consider smart contract risks
• Never invest more than you can afford to lose
• Diversify across different protocols
• Keep track of gas fees and transaction costs

Popular DeFi protocols include Uniswap, Compound, Aave, and Curve Finance. Always do your own research and consider consulting with a financial advisor."""

            elif any(word in user_message for word in ['portfolio', 'diversify', 'investment', 'invest']):
                return """A well-diversified portfolio is key to managing investment risk:

• Spread investments across different asset classes (stocks, bonds, real estate)
• Consider geographic diversification
• Include both growth and value investments
• Rebalance periodically to maintain target allocation
• Consider your risk tolerance and time horizon
• Don't put all eggs in one basket
• Consider low-cost index funds for broad market exposure

For personalized investment advice, consider consulting with a certified financial planner who can assess your specific situation."""

            else:
                return """Thank you for your financial inquiry. As a Financial Advisor, I can help you with investment strategies, portfolio analysis, and DeFi opportunities. Please remember that all investments carry risk, and past performance doesn't guarantee future results. I recommend diversifying your portfolio and only investing what you can afford to lose. For personalized financial planning, consider consulting with a certified financial planner."""

        # Logistics Coordinator responses
        elif 'Logistics Coordinator' in prompt:
            if any(word in user_message for word in ['route', 'delivery', 'optimization', 'shipping']):
                return """Route optimization can significantly reduce costs and improve efficiency:

• Use route planning software to minimize distance and time
• Consider traffic patterns and peak hours
• Group deliveries by geographic proximity
• Implement dynamic routing based on real-time conditions
• Consider vehicle capacity and load optimization
• Track fuel consumption and maintenance costs
• Use GPS tracking for real-time monitoring

Popular route optimization tools include Google Maps API, Route4Me, and OptimoRoute. The key is balancing cost, time, and customer satisfaction."""

            elif any(word in user_message for word in ['inventory', 'stock', 'warehouse', 'storage']):
                return """Effective inventory management strategies include:

• Implement just-in-time (JIT) inventory systems
• Use demand forecasting to predict stock needs
• Maintain safety stock for critical items
• Regular inventory audits and cycle counting
• ABC analysis to prioritize high-value items
• Consider dropshipping for low-demand products
• Use inventory management software for tracking
• Optimize warehouse layout for efficiency

The goal is to minimize carrying costs while ensuring product availability."""

            elif any(word in user_message for word in ['supply chain', 'vendor', 'supplier', 'procurement']):
                return """Supply chain optimization involves multiple strategies:

• Develop strong relationships with reliable suppliers
• Implement vendor management systems
• Consider multiple suppliers to reduce risk
• Negotiate better terms and pricing
• Use data analytics for demand planning
• Implement quality control processes
• Consider sustainability in supplier selection
• Use technology for supply chain visibility

A resilient supply chain can adapt to disruptions and maintain operations."""

            else:
                return """I'll help you optimize your logistics operations. As a Logistics Coordinator, I specialize in route planning, inventory management, and supply chain optimization. I can analyze your current processes and suggest improvements to reduce costs, improve efficiency, and enhance customer satisfaction. Let me know more about your specific logistics challenges, and I'll provide tailored recommendations."""

        else:
            return """I understand your request and I'm here to help. As an AI assistant, I can provide information, analysis, and guidance within my area of expertise. Please let me know more details about what you need assistance with, and I'll do my best to provide helpful and accurate information."""
    
    def _fallback_response(self, agent_type: str, user_message: str) -> str:
        """Fallback response when AI fails"""
        
        fallback_responses = {
            'healthcare': f"I understand your health concern: '{user_message}'. While I'm experiencing technical difficulties with my AI systems, I can still provide general health guidance. For specific medical concerns, please consult with a healthcare professional. I recommend maintaining a healthy lifestyle and seeking medical advice if symptoms persist.",
            'financial': f"I'm analyzing your financial query: '{user_message}'. Due to technical issues with my AI systems, I'm using my fallback knowledge base. I can help with general investment guidance and DeFi strategies. Remember to diversify your portfolio and consider your risk tolerance. For complex financial planning, consult with a certified financial advisor.",
            'logistics': f"I'm processing your logistics request: '{user_message}'. While my advanced AI systems are temporarily unavailable, I can still provide logistics guidance based on my knowledge base. I specialize in route optimization, inventory management, and supply chain efficiency. Let me know more about your specific needs, and I'll provide practical recommendations."
        }
        
        return fallback_responses.get(agent_type, f"I understand your message: '{user_message}'. I'm currently experiencing technical difficulties but I'm still here to help. Please try again in a moment, or let me know if you need immediate assistance.")
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of user input"""
        try:
            # Simple sentiment analysis (in production, use a proper NLP library)
            positive_words = ['good', 'great', 'excellent', 'happy', 'satisfied', 'love', 'amazing', 'wonderful']
            negative_words = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed', 'worried']
            
            text_lower = text.lower()
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            if positive_count > negative_count:
                sentiment = 'positive'
                confidence = min(0.9, 0.5 + (positive_count - negative_count) * 0.1)
            elif negative_count > positive_count:
                sentiment = 'negative'
                confidence = min(0.9, 0.5 + (negative_count - positive_count) * 0.1)
            else:
                sentiment = 'neutral'
                confidence = 0.5
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'positive_words': positive_count,
                'negative_words': negative_count
            }
            
        except Exception as e:
            logger.log_error(e, "Sentiment analysis failed")
            return {'sentiment': 'neutral', 'confidence': 0.5}
    
    def extract_intent(self, text: str, agent_type: str) -> Dict[str, Any]:
        """Extract user intent from text"""
        
        intent_patterns = {
            'healthcare': {
                'symptom_check': ['symptom', 'pain', 'ache', 'hurt', 'feel'],
                'medication_question': ['medication', 'drug', 'pill', 'medicine', 'prescription'],
                'health_advice': ['advice', 'recommendation', 'should i', 'what should'],
                'emergency': ['emergency', 'urgent', 'immediate', 'call 911', 'ambulance']
            },
            'financial': {
                'investment_advice': ['invest', 'investment', 'portfolio', 'buy', 'sell'],
                'defi_question': ['defi', 'yield', 'staking', 'liquidity', 'protocol'],
                'risk_assessment': ['risk', 'safe', 'dangerous', 'volatile', 'stable'],
                'market_analysis': ['market', 'price', 'trend', 'analysis', 'forecast']
            },
            'logistics': {
                'route_optimization': ['route', 'path', 'delivery', 'shipping', 'transport'],
                'inventory_management': ['inventory', 'stock', 'warehouse', 'storage'],
                'cost_reduction': ['cost', 'expensive', 'cheap', 'budget', 'save money'],
                'supply_chain': ['supply chain', 'vendor', 'supplier', 'procurement']
            }
        }
        
        text_lower = text.lower()
        agent_patterns = intent_patterns.get(agent_type, {})
        
        detected_intents = []
        for intent, keywords in agent_patterns.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_intents.append(intent)
        
        return {
            'intents': detected_intents,
            'primary_intent': detected_intents[0] if detected_intents else 'general_inquiry',
            'confidence': len(detected_intents) / len(agent_patterns) if agent_patterns else 0
        }

# Global AI intelligence instance
ai_intelligence = AIAgentIntelligence()

# Decorator for AI-enhanced agent responses
def ai_enhanced_response(agent_type: str):
    """Decorator to enhance agent responses with AI"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                # Get original response
                original_response = func(*args, **kwargs)
                
                # Enhance with AI if available
                if ai_intelligence.openai_api_key or ai_intelligence.anthropic_api_key:
                    user_message = args[1] if len(args) > 1 else kwargs.get('user_message', '')
                    enhanced_response = ai_intelligence.generate_response(agent_type, user_message)
                    return enhanced_response
                else:
                    return original_response
                    
            except Exception as e:
                logger.log_error(e, f"AI enhancement failed for {agent_type}")
                return func(*args, **kwargs)
        
        return wrapper
    return decorator
