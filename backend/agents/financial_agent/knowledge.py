#!/usr/bin/env python3
"""
MeTTa Knowledge Graph Initialization for Financial Agent
Based on SingularityNET MeTTa and Fetch.ai integration example
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'knowledge'))

from metta_kg.integration import MeTTaKnowledgeGraph
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Initialize real MeTTa Knowledge Graph
try:
    import os
    metta_url = os.getenv('METTA_SERVER_URL') or os.getenv('METTA_ENDPOINT', 'http://localhost:8080')
    financial_metta = MeTTaKnowledgeGraph(metta_url)
    logger.info(f"✅ Connected to real MeTTa Knowledge Graph server at {metta_url}")
except Exception as e:
    logger.warning(f"Failed to connect to MeTTa server: {e}")
    # Fallback to mock implementation
    financial_metta = MeTTaKnowledgeGraph()  # Uses mock responses
    logger.info("✅ Using MeTTa Knowledge Graph with mock responses")

class FinancialKnowledgeGraph:
    """Financial Knowledge Graph using real MeTTa integration"""
    
    def __init__(self):
        self.metta = financial_metta
        self._initialize_financial_knowledge()
    
    def _initialize_financial_knowledge(self):
        """Initialize comprehensive financial knowledge base"""
        try:
            # Risk Profile → Investment Types
            risk_investments = [
                ("conservative", "bonds"),
                ("conservative", "treasury_bills"),
                ("conservative", "money_market"),
                ("moderate", "index_funds"),
                ("moderate", "balanced_funds"),
                ("moderate", "blue_chip_stocks"),
                ("aggressive", "growth_stocks"),
                ("aggressive", "cryptocurrency"),
                ("aggressive", "emerging_markets"),
                ("ultra_conservative", "cds"),
                ("ultra_conservative", "treasury_bills")
            ]
            
            # Investment Types → Expected Returns
            investment_returns = [
                ("bonds", "3-5% annually"),
                ("treasury_bills", "2-4% annually"),
                ("money_market", "2-3% annually"),
                ("index_funds", "6-10% annually"),
                ("balanced_funds", "5-8% annually"),
                ("blue_chip_stocks", "7-12% annually"),
                ("growth_stocks", "10-15% annually"),
                ("cryptocurrency", "highly volatile"),
                ("emerging_markets", "8-15% annually"),
                ("cds", "1-3% annually")
            ]
            
            # Investment Types → Risk Levels
            investment_risks = [
                ("bonds", "low risk, stable income"),
                ("treasury_bills", "very low risk, government backed"),
                ("money_market", "low risk, liquid"),
                ("index_funds", "moderate risk, diversified"),
                ("balanced_funds", "moderate risk, balanced"),
                ("blue_chip_stocks", "moderate-high risk, established companies"),
                ("growth_stocks", "high risk, potential for high returns"),
                ("cryptocurrency", "very high risk, speculative"),
                ("emerging_markets", "high risk, developing economies"),
                ("cds", "very low risk, fixed term")
            ]
            
            # Age Groups → Asset Allocations
            age_allocations = [
                ("20s", "80% stocks, 20% bonds"),
                ("30s", "70% stocks, 30% bonds"),
                ("40s", "60% stocks, 40% bonds"),
                ("50s", "50% stocks, 50% bonds"),
                ("60s", "40% stocks, 60% bonds"),
                ("70s", "30% stocks, 70% bonds")
            ]
            
            # Investment Goals → Strategies
            goal_strategies = [
                ("retirement", "diversified index funds with dollar-cost averaging"),
                ("emergency_fund", "high-yield savings account or money market"),
                ("house_down_payment", "short-term bonds or CDs"),
                ("education", "529 plan or education savings account"),
                ("wealth_building", "growth stocks and index funds"),
                ("income_generation", "dividend stocks and bonds")
            ]
            
            # Market Sectors → Top Stocks
            sector_stocks = [
                ("technology", "Apple, Microsoft, Google, Amazon, Tesla"),
                ("healthcare", "Johnson & Johnson, Pfizer, UnitedHealth"),
                ("financial", "JPMorgan, Bank of America, Berkshire Hathaway"),
                ("energy", "Exxon Mobil, Chevron, NextEra Energy"),
                ("consumer", "Procter & Gamble, Coca-Cola, Walmart")
            ]
            
            # Common Mistakes → Warnings
            investment_mistakes = [
                ("emotional_trading", "avoid panic selling during market downturns"),
                ("market_timing", "time in market beats timing the market"),
                ("lack_diversification", "don't put all eggs in one basket"),
                ("high_fees", "avoid high-fee mutual funds and advisors"),
                ("chasing_hot_stocks", "avoid FOMO and stick to fundamentals")
            ]
            
            # Add all knowledge to MeTTa using correct methods
            for risk, investment in risk_investments:
                self.metta.add_concept(f"risk_profile_{risk}_{investment}", {
                    "type": "risk_profile",
                    "risk_level": risk,
                    "investment": investment,
                    "category": "risk_investment"
                })
            
            for investment, returns in investment_returns:
                self.metta.add_concept(f"return_{investment}", {
                    "type": "expected_return",
                    "investment": investment,
                    "returns": returns,
                    "category": "investment_return"
                })
            
            for investment, risk in investment_risks:
                self.metta.add_concept(f"risk_{investment}", {
                    "type": "risk_level",
                    "investment": investment,
                    "risk_description": risk,
                    "category": "investment_risk"
                })
            
            for age, allocation in age_allocations:
                self.metta.add_concept(f"allocation_{age}", {
                    "type": "age_allocation",
                    "age_group": age,
                    "allocation": allocation,
                    "category": "age_based_allocation"
                })
            
            for goal, strategy in goal_strategies:
                self.metta.add_concept(f"strategy_{goal}", {
                    "type": "goal_strategy",
                    "goal": goal,
                    "strategy": strategy,
                    "category": "goal_based_strategy"
                })
            
            for sector, stocks in sector_stocks:
                self.metta.add_concept(f"sector_{sector}", {
                    "type": "sector_stocks",
                    "sector": sector,
                    "stocks": stocks,
                    "category": "sector_analysis"
                })
            
            for mistake, warning in investment_mistakes:
                self.metta.add_concept(f"mistake_{mistake}", {
                    "type": "investment_mistake",
                    "mistake": mistake,
                    "warning": warning,
                    "category": "investment_education"
                })
            
            logger.info("✅ Financial knowledge base initialized with comprehensive data")
            
        except Exception as e:
            logger.error(f"Error initializing financial knowledge: {e}")
    
    def query_risk_profile(self, risk_type: str) -> List[str]:
        """Query investments suitable for risk profile using MeTTa semantic search"""
        try:
            # Use semantic search to find risk profile concepts
            results = self.metta.semantic_search(f"{risk_type} investment", limit=10)
            investments = []
            
            for result in results:
                properties = result.get('properties', {})
                if properties.get('risk_level') == risk_type and properties.get('type') == 'risk_profile':
                    investment = properties.get('investment')
                    if investment:
                        investments.append(investment)
            
            logger.info(f"🔍 MeTTa Query: Risk profile '{risk_type}' → {investments}")
            return investments
        except Exception as e:
            logger.error(f"Error querying risk profile {risk_type}: {e}")
            return []
    
    def get_expected_return(self, investment: str) -> List[str]:
        """Get expected returns for an investment using MeTTa semantic search"""
        try:
            # Search for the exact concept name
            search_term = f"{investment}_returns"
            results = self.metta.semantic_search(search_term, limit=5)
            returns = []
            
            for result in results:
                properties = result.get('properties', {})
                if properties.get('investment') == investment and properties.get('type') == 'expected_return':
                    return_val = properties.get('returns')
                    if return_val and return_val not in returns:
                        returns.append(return_val)
            
            logger.info(f"🔍 MeTTa Query: Expected return for '{investment}' → {returns}")
            return returns
        except Exception as e:
            logger.error(f"Error getting expected return for {investment}: {e}")
            return []
    
    def get_risk_level(self, investment: str) -> List[str]:
        """Get risk level for an investment using MeTTa semantic search"""
        try:
            # Search for the exact concept name
            search_term = f"{investment}_risk"
            results = self.metta.semantic_search(search_term, limit=5)
            risks = []
            
            for result in results:
                properties = result.get('properties', {})
                if properties.get('investment') == investment and properties.get('type') == 'risk_level':
                    risk_val = properties.get('risk_description')
                    if risk_val and risk_val not in risks:
                        risks.append(risk_val)
            
            logger.info(f"🔍 MeTTa Query: Risk level for '{investment}' → {risks}")
            return risks
        except Exception as e:
            logger.error(f"Error getting risk level for {investment}: {e}")
            return []
    
    def get_age_allocation(self, age_group: str) -> List[str]:
        """Get asset allocation for age group using MeTTa semantic search"""
        try:
            results = self.metta.semantic_search(f"age allocation {age_group}", limit=5)
            allocations = []
            
            for result in results:
                if result.get('properties', {}).get('age_group') == age_group:
                    allocation = result.get('properties', {}).get('allocation')
                    if allocation:
                        allocations.append(allocation)
            
            logger.info(f"🔍 MeTTa Query: Age allocation for '{age_group}' → {allocations}")
            return allocations
        except Exception as e:
            logger.error(f"Error getting age allocation for {age_group}: {e}")
            return []
    
    def get_goal_strategy(self, goal: str) -> List[str]:
        """Get investment strategy for goal using MeTTa semantic search"""
        try:
            results = self.metta.semantic_search(f"goal strategy {goal}", limit=5)
            strategies = []
            
            for result in results:
                if result.get('properties', {}).get('goal') == goal:
                    strategy = result.get('properties', {}).get('strategy')
                    if strategy:
                        strategies.append(strategy)
            
            logger.info(f"🔍 MeTTa Query: Goal strategy for '{goal}' → {strategies}")
            return strategies
        except Exception as e:
            logger.error(f"Error getting goal strategy for {goal}: {e}")
            return []
    
    def get_sector_stocks(self, sector: str) -> List[str]:
        """Get top stocks for sector using MeTTa semantic search"""
        try:
            results = self.metta.semantic_search(f"sector stocks {sector}", limit=5)
            stocks = []
            
            for result in results:
                if result.get('properties', {}).get('sector') == sector:
                    stock_list = result.get('properties', {}).get('stocks')
                    if stock_list:
                        stocks.append(stock_list)
            
            logger.info(f"🔍 MeTTa Query: Sector stocks for '{sector}' → {stocks}")
            return stocks
        except Exception as e:
            logger.error(f"Error getting sector stocks for {sector}: {e}")
            return []
    
    def add_knowledge(self, category: str, key: str, value: str, source: str = "user"):
        """Dynamically add knowledge to the MeTTa knowledge graph"""
        try:
            concept_name = f"{category}_{key}_{source}"
            properties = {
                "type": category,
                "key": key,
                "value": value,
                "source": source,
                "category": "dynamic_knowledge"
            }
            self.metta.add_concept(concept_name, properties)
            logger.info(f"📚 MeTTa: Added knowledge - Category: {category}, Key: {key}, Value: {value}, Source: {source}")
        except Exception as e:
            logger.error(f"Error adding knowledge {category}_{key}: {e}")
    
    def query(self, query: str) -> Dict[str, Any]:
        """Generic query method for MeTTa knowledge graph"""
        try:
            results = self.metta.semantic_search(query, limit=10)
            return {
                "query": query,
                "results": results,
                "count": len(results)
            }
        except Exception as e:
            logger.error(f"Error querying financial knowledge: {e}")
            return {"error": str(e)}

print("✅ MeTTa Financial Knowledge Graph initialized successfully")