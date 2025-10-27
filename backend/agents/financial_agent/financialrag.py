#!/usr/bin/env python3
"""
Financial RAG System with Real MeTTa Integration
Based on SingularityNET MeTTa and Fetch.ai integration example
"""

from knowledge import financial_metta
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class FinancialRAG:
    """
    Financial RAG (Retrieval-Augmented Generation) system
    Using real MeTTa knowledge graph for structured financial reasoning
    """
    
    def __init__(self, metta_instance):
        self.metta = metta_instance
    
    def query_risk_profile(self, risk_type: str) -> List[str]:
        """
        Query investments suitable for risk profile using MeTTa pattern matching
        """
        try:
            investments = self.metta.query_risk_profile(risk_type)
            print(f" MeTTa Query: Risk profile '{risk_type}' → Investments: {investments}")
            return investments
        except Exception as e:
            logger.error(f"Error querying risk profile {risk_type}: {e}")
            return []
    
    def get_expected_return(self, investment: str) -> List[str]:
        """
        Get expected returns for an investment using MeTTa pattern matching
        """
        try:
            returns = self.metta.get_expected_return(investment)
            print(f" MeTTa Query: Expected return for '{investment}' → {returns}")
            return returns
        except Exception as e:
            logger.error(f"Error getting expected return for {investment}: {e}")
            return []
    
    def get_risk_level(self, investment: str) -> List[str]:
        """
        Get risk level for an investment using MeTTa pattern matching
        """
        try:
            risks = self.metta.get_risk_level(investment)
            print(f" MeTTa Query: Risk level for '{investment}' → {risks}")
            return risks
        except Exception as e:
            logger.error(f"Error getting risk level for {investment}: {e}")
            return []
    
    def get_age_allocation(self, age_group: str) -> List[str]:
        """
        Get asset allocation for age group using MeTTa pattern matching
        """
        try:
            allocation = self.metta.get_age_allocation(age_group)
            print(f" MeTTa Query: Age allocation for '{age_group}' → {allocation}")
            return allocation
        except Exception as e:
            logger.error(f"Error getting age allocation for {age_group}: {e}")
            return []
    
    def get_goal_strategy(self, goal: str) -> List[str]:
        """
        Get investment strategy for goal using MeTTa pattern matching
        """
        try:
            strategy = self.metta.get_goal_strategy(goal)
            print(f" MeTTa Query: Goal strategy for '{goal}' → {strategy}")
            return strategy
        except Exception as e:
            logger.error(f"Error getting goal strategy for {goal}: {e}")
            return []
    
    def get_sector_stocks(self, sector: str) -> List[str]:
        """
        Get top stocks for sector using MeTTa pattern matching
        """
        try:
            stocks = self.metta.get_sector_stocks(sector)
            print(f" MeTTa Query: Sector stocks for '{sector}' → {stocks}")
            return stocks
        except Exception as e:
            logger.error(f"Error getting sector stocks for {sector}: {e}")
            return []
    
    def query_knowledge(self, query: str) -> Dict[str, Any]:
        """
        Query the financial knowledge graph with intent classification
        """
        try:
            query_lower = query.lower()
            
            # Risk Profile Queries
            if any(word in query_lower for word in ["conservative", "moderate", "aggressive", "risk tolerance", "risk profile"]):
                if "conservative" in query_lower:
                    investments = self.query_risk_profile("conservative")
                    returns = [self.get_expected_return(inv) for inv in investments[:3]]
                    risks = [self.get_risk_level(inv) for inv in investments[:3]]
                    return {
                        "intent": "risk_profile",
                        "risk_type": "conservative",
                        "investments": investments,
                        "returns": returns,
                        "risks": risks
                    }
                elif "moderate" in query_lower:
                    investments = self.query_risk_profile("moderate")
                    returns = [self.get_expected_return(inv) for inv in investments[:3]]
                    risks = [self.get_risk_level(inv) for inv in investments[:3]]
                    return {
                        "intent": "risk_profile",
                        "risk_type": "moderate",
                        "investments": investments,
                        "returns": returns,
                        "risks": risks
                    }
                elif "aggressive" in query_lower:
                    investments = self.query_risk_profile("aggressive")
                    returns = [self.get_expected_return(inv) for inv in investments[:3]]
                    risks = [self.get_risk_level(inv) for inv in investments[:3]]
                    return {
                        "intent": "risk_profile",
                        "risk_type": "aggressive",
                        "investments": investments,
                        "returns": returns,
                        "risks": risks
                    }
            
            # Expected Returns Queries
            elif any(word in query_lower for word in ["return", "yield", "performance", "earnings"]):
                if "bond" in query_lower:
                    returns = self.get_expected_return("bonds")
                    risks = self.get_risk_level("bonds")
                    return {
                        "intent": "expected_return",
                        "investment": "bonds",
                        "returns": returns,
                        "risks": risks
                    }
                elif "index" in query_lower:
                    returns = self.get_expected_return("index_funds")
                    risks = self.get_risk_level("index_funds")
                    return {
                        "intent": "expected_return",
                        "investment": "index_funds",
                        "returns": returns,
                        "risks": risks
                    }
                elif "crypto" in query_lower:
                    returns = self.get_expected_return("cryptocurrency")
                    risks = self.get_risk_level("cryptocurrency")
                    return {
                        "intent": "expected_return",
                        "investment": "cryptocurrency",
                        "returns": returns,
                        "risks": risks
                    }
            
            # Age-Based Allocation Queries
            elif any(word in query_lower for word in ["age", "years old", "allocation", "portfolio"]):
                if "25" in query_lower or "20s" in query_lower:
                    allocation = self.get_age_allocation("20s")
                    return {
                        "intent": "age_allocation",
                        "age_group": "20s",
                        "allocation": allocation
                    }
                elif "30" in query_lower or "30s" in query_lower:
                    allocation = self.get_age_allocation("30s")
                    return {
                        "intent": "age_allocation",
                        "age_group": "30s",
                        "allocation": allocation
                    }
                elif "40" in query_lower or "40s" in query_lower:
                    allocation = self.get_age_allocation("40s")
                    return {
                        "intent": "age_allocation",
                        "age_group": "40s",
                        "allocation": allocation
                    }
                elif "50" in query_lower or "50s" in query_lower:
                    allocation = self.get_age_allocation("50s")
                    return {
                        "intent": "age_allocation",
                        "age_group": "50s",
                        "allocation": allocation
                    }
            
            # Goal-Oriented Queries
            elif any(word in query_lower for word in ["retirement", "emergency", "house", "education", "goal"]):
                if "retirement" in query_lower:
                    strategy = self.get_goal_strategy("retirement")
                    return {
                        "intent": "goal_strategy",
                        "goal": "retirement",
                        "strategy": strategy
                    }
                elif "emergency" in query_lower:
                    strategy = self.get_goal_strategy("emergency_fund")
                    return {
                        "intent": "goal_strategy",
                        "goal": "emergency_fund",
                        "strategy": strategy
                    }
                elif "house" in query_lower:
                    strategy = self.get_goal_strategy("house_down_payment")
                    return {
                        "intent": "goal_strategy",
                        "goal": "house_down_payment",
                        "strategy": strategy
                    }
            
            # Sector-Specific Queries
            elif any(word in query_lower for word in ["technology", "healthcare", "financial", "energy", "sector"]):
                if "tech" in query_lower or "technology" in query_lower:
                    stocks = self.get_sector_stocks("technology")
                    return {
                        "intent": "sector_stocks",
                        "sector": "technology",
                        "stocks": stocks
                    }
                elif "health" in query_lower:
                    stocks = self.get_sector_stocks("healthcare")
                    return {
                        "intent": "sector_stocks",
                        "sector": "healthcare",
                        "stocks": stocks
                    }
                elif "financial" in query_lower:
                    stocks = self.get_sector_stocks("financial")
                    return {
                        "intent": "sector_stocks",
                        "sector": "financial",
                        "stocks": stocks
                    }
            
            # Default fallback
            return {
                "intent": "general",
                "message": "I can help with risk profiles, expected returns, age-based allocation, goal planning, and sector analysis. Please be more specific about what you'd like to know."
            }
            
        except Exception as e:
            logger.error(f"Error querying knowledge: {e}")
            return {"error": str(e)}
    
    def get_prevention(self, topic: str) -> List[str]:
        """Get prevention strategies for financial topic"""
        try:
            # Use query_knowledge for prevention-related queries
            results = self.query_knowledge(f"prevention {topic}")
            if results.get('intent') != 'general':
                return [str(results)]
            return []
        except Exception as e:
            logger.error(f"Error getting prevention for {topic}: {e}")
            return []
    
    def query_general(self, query: str) -> List[str]:
        """General financial knowledge query"""
        try:
            results = self.query_knowledge(query)
            if results.get('intent') != 'general':
                return [str(results)]
            return []
        except Exception as e:
            logger.error(f"Error querying general knowledge for {query}: {e}")
            return []
    
    def add_knowledge(self, category: str, key: str, value: str, source: str = "user"):
        """
        Dynamically add knowledge to the MeTTa knowledge graph
        """
        try:
            self.metta.add_knowledge(category, key, value, source)
            print(f"📚 MeTTa: Added knowledge - Category: {category}, Key: {key}, Value: {value}, Source: {source}")
            logger.info(f"Added knowledge: {category}_{key} = {value}")
        except Exception as e:
            logger.error(f"Error adding knowledge {category}_{key}: {e}")

print(" Financial RAG System with MeTTa integration initialized successfully")