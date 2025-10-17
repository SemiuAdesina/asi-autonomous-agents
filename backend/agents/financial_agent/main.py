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

# Initialize the financial agent
financial_agent = Agent(
    name="Financial Advisor",
    seed="financial-agent-seed-phrase-here",
    port=8003,
    endpoint=["http://localhost:8003/submit"],
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

# Financial knowledge base
FINANCIAL_KNOWLEDGE = {
    "defi": {
        "liquidity_pools": "Liquidity pools provide trading liquidity and earn fees for providers.",
        "yield_farming": "Yield farming involves providing liquidity to earn rewards and interest.",
        "staking": "Staking involves locking tokens to secure the network and earn rewards.",
        "swapping": "Token swapping allows exchange of one cryptocurrency for another."
    },
    "investment": {
        "portfolio": "Diversified portfolio reduces risk by spreading investments across assets.",
        "risk_assessment": "Risk assessment evaluates potential losses and volatility of investments.",
        "asset_allocation": "Asset allocation distributes investments across different asset classes."
    },
    "trading": {
        "technical_analysis": "Technical analysis uses price charts to predict future movements.",
        "fundamental_analysis": "Fundamental analysis evaluates intrinsic value of assets.",
        "market_trends": "Market trends indicate general direction of price movements."
    }
}

# Sample portfolio data
SAMPLE_PORTFOLIO = {
    "total_value": 125000,
    "assets": [
        {"name": "Bitcoin", "symbol": "BTC", "amount": 0.5, "value": 25000, "percentage": 20},
        {"name": "Ethereum", "symbol": "ETH", "amount": 10, "value": 30000, "percentage": 24},
        {"name": "DeFi Tokens", "symbol": "DEFI", "amount": 1000, "value": 20000, "percentage": 16},
        {"name": "Stablecoins", "symbol": "USDC", "amount": 50000, "value": 50000, "percentage": 40}
    ]
}

def analyze_portfolio() -> str:
    """Analyze current portfolio"""
    portfolio = SAMPLE_PORTFOLIO
    
    response = "Portfolio Analysis:\n"
    response += f"Total Portfolio Value: ${portfolio['total_value']:,}\n\n"
    response += "Asset Allocation:\n"
    
    for asset in portfolio['assets']:
        response += f"- {asset['name']} ({asset['symbol']}): ${asset['value']:,} ({asset['percentage']}%)\n"
    
    response += "\nRecommendations:\n"
    response += "- Consider rebalancing if allocation deviates from target\n"
    response += "- Monitor DeFi positions for yield opportunities\n"
    response += "- Maintain adequate stablecoin reserves for opportunities\n"
    response += "- Review risk exposure regularly"
    
    return response

def assess_risk(tolerance: str) -> str:
    """Assess investment risk based on tolerance"""
    tolerance_lower = tolerance.lower()
    
    if "conservative" in tolerance_lower or "low" in tolerance_lower:
        response = "Conservative Risk Assessment:\n"
        response += "- Recommended allocation: 70% stable assets, 30% growth\n"
        response += "- Focus on: Stablecoins, blue-chip cryptocurrencies\n"
        response += "- Avoid: High-volatility tokens, leveraged positions\n"
        response += "- Expected return: 5-10% annually\n"
        response += "- Risk level: Low"
    
    elif "moderate" in tolerance_lower or "medium" in tolerance_lower:
        response = "Moderate Risk Assessment:\n"
        response += "- Recommended allocation: 50% stable assets, 50% growth\n"
        response += "- Focus on: Major cryptocurrencies, DeFi protocols\n"
        response += "- Consider: Yield farming, staking rewards\n"
        response += "- Expected return: 10-20% annually\n"
        response += "- Risk level: Medium"
    
    elif "aggressive" in tolerance_lower or "high" in tolerance_lower:
        response = "Aggressive Risk Assessment:\n"
        response += "- Recommended allocation: 30% stable assets, 70% growth\n"
        response += "- Focus on: Emerging tokens, DeFi innovations\n"
        response += "- Consider: Leveraged positions, new protocols\n"
        response += "- Expected return: 20-50% annually\n"
        response += "- Risk level: High"
    
    else:
        response = "Please specify your risk tolerance: conservative, moderate, or aggressive."
    
    return response

def get_defi_opportunities() -> str:
    """Get current DeFi opportunities"""
    opportunities = [
        {"protocol": "Uniswap V3", "apy": "12.5%", "risk": "Medium", "description": "Liquidity provision"},
        {"protocol": "Compound", "apy": "8.2%", "risk": "Low", "description": "Lending and borrowing"},
        {"protocol": "Aave", "apy": "15.3%", "risk": "Medium", "description": "Yield farming"},
        {"protocol": "Yearn Finance", "apy": "18.7%", "risk": "High", "description": "Automated strategies"}
    ]
    
    response = "Current DeFi Opportunities:\n\n"
    
    for opp in opportunities:
        response += f"Protocol: {opp['protocol']}\n"
        response += f"APY: {opp['apy']}\n"
        response += f"Risk: {opp['risk']}\n"
        response += f"Description: {opp['description']}\n\n"
    
    response += "Note: APY rates are variable and subject to market conditions. "
    response += "Always do your own research before investing."
    
    return response

def analyze_market_conditions() -> str:
    """Analyze current market conditions and trends"""
    # Simulate market analysis with realistic data
    market_analysis = {
        "crypto_market": {
            "trend": "Bullish",
            "sentiment": "Positive",
            "key_indicators": {
                "fear_greed_index": "65 (Greed)",
                "btc_dominance": "42.3%",
                "total_market_cap": "$2.1T",
                "24h_volume": "$85.2B"
            }
        },
        "defi_sector": {
            "trend": "Recovering",
            "tvl": "$85.6B",
            "top_protocols": ["Lido", "Aave", "Uniswap", "Maker"],
            "growth_rate": "+12.4%"
        },
        "macro_factors": {
            "fed_rates": "5.25-5.50%",
            "inflation": "3.2%",
            "dollar_index": "103.45",
            "impact": "Neutral to Positive"
        }
    }
    
    response = "MARKET ANALYSIS REPORT\n"
    response += "=" * 40 + "\n\n"
    
    # Crypto Market Overview
    crypto = market_analysis["crypto_market"]
    response += "CRYPTO MARKET OVERVIEW:\n"
    response += f"Trend: {crypto['trend']}\n"
    response += f"Sentiment: {crypto['sentiment']}\n\n"
    response += "Key Indicators:\n"
    for indicator, value in crypto["key_indicators"].items():
        response += f"• {indicator.replace('_', ' ').title()}: {value}\n"
    response += "\n"
    
    # DeFi Sector Analysis
    defi = market_analysis["defi_sector"]
    response += "DeFi SECTOR ANALYSIS:\n"
    response += f"Trend: {defi['trend']}\n"
    response += f"Total Value Locked: {defi['tvl']}\n"
    response += f"Growth Rate: {defi['growth_rate']}\n"
    response += f"Top Protocols: {', '.join(defi['top_protocols'])}\n\n"
    
    # Macro Economic Factors
    macro = market_analysis["macro_factors"]
    response += "MACRO ECONOMIC FACTORS:\n"
    response += f"Fed Rates: {macro['fed_rates']}\n"
    response += f"Inflation: {macro['inflation']}\n"
    response += f"Dollar Index: {macro['dollar_index']}\n"
    response += f"Overall Impact: {macro['impact']}\n\n"
    
    # Investment Recommendations
    response += "INVESTMENT RECOMMENDATIONS:\n"
    response += "• Consider DCA (Dollar Cost Averaging) strategies\n"
    response += "• Diversify across top DeFi protocols\n"
    response += "• Monitor Fed policy changes closely\n"
    response += "• Maintain 20-30% stablecoin allocation\n\n"
    response += "Disclaimer: This analysis is for educational purposes only. Always DYOR."
    
    return response

# Handle incoming chat messages
@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info(f"Financial Agent received message from {sender}")
    
    # Always send back an acknowledgement when a message is received
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.utcnow(), 
        acknowledged_msg_id=msg.msg_id
    ))
    
    # Process each content item inside the chat message
    for item in msg.content:
        # Marks the start of a chat session
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"Financial session started with {sender}")
            welcome_message = create_text_chat(
                "Hello! I'm your Financial Advisor specializing in DeFi and Web3 investments. "
                "I can help you with:\n"
                "- Portfolio analysis and optimization\n"
                "- Risk assessment and management\n"
                "- DeFi opportunities and yield farming\n"
                "- Investment strategies and recommendations\n\n"
                "How can I assist you with your financial goals today?"
            )
            await ctx.send(sender, welcome_message)
        
        # Handles plain text messages
        elif isinstance(item, TextContent):
            ctx.logger.info(f"Text message from {sender}: {item.text}")
            
            user_message = item.text.lower()
            
            if "portfolio" in user_message or "analyze" in user_message:
                response_text = analyze_portfolio()
            
            elif "risk" in user_message or "tolerance" in user_message:
                response_text = assess_risk(item.text)
            
            elif "defi" in user_message or "yield" in user_message or "opportunities" in user_message:
                response_text = get_defi_opportunities()
            
            elif "market" in user_message or "analysis" in user_message or "trend" in user_message or "conditions" in user_message:
                response_text = analyze_market_conditions()
            
            elif any(word in user_message for word in ["hello", "hi", "help", "start"]):
                response_text = (
                    "Welcome to the Financial Advisor! I specialize in:\n"
                    "- Portfolio Management: Optimize your crypto investments\n"
                    "- Risk Assessment: Evaluate your risk tolerance\n"
                    "- DeFi Strategies: Discover yield farming opportunities\n"
                    "- Investment Analysis: Make informed financial decisions\n\n"
                    "What financial service can I help you with today?"
                )
            
            else:
                response_text = (
                    "I can help you with various financial services:\n"
                    "- Say 'portfolio analysis' for investment review\n"
                    "- Say 'risk assessment' for risk evaluation\n"
                    "- Say 'DeFi opportunities' for yield farming options\n"
                    "- Ask about investment strategies\n\n"
                    "What specific financial guidance do you need?"
                )
            
            response_message = create_text_chat(response_text)
            await ctx.send(sender, response_message)
        
        # Marks the end of a chat session
        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"Financial session ended with {sender}")
            goodbye_message = create_text_chat(
                "Thank you for using the Financial Advisor. Remember to always do your own "
                "research and never invest more than you can afford to lose. Good luck with your investments!"
            )
            await ctx.send(sender, goodbye_message)
        
        # Catches anything unexpected
        else:
            ctx.logger.info(f"Received unexpected content type from {sender}")

# Handle acknowledgements for messages this agent has sent out
@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Financial Agent received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")

# Include the chat protocol and publish the manifest to Agentverse
financial_agent.include(chat_proto, publish_manifest=True)

if __name__ == "__main__":
    # Fund the agent if needed
    fund_agent_if_low(financial_agent.wallet.address())
    
    # Run the agent
    financial_agent.run()
