# Dynamic Learning System for Autonomous Agents
# Enables agents to learn and adapt from user interactions and conversations

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class DynamicLearningSystem:
    """
    System that enables agents to learn dynamically from interactions
    and update their knowledge graphs accordingly
    """
    
    def __init__(self, agent_name: str, learning_data_path: str = "learning_data"):
        self.agent_name = agent_name
        self.learning_data_path = Path(learning_data_path)
        self.learning_data_path.mkdir(exist_ok=True)
        
        # Initialize learning storage files
        self.interaction_file = self.learning_data_path / f"{agent_name}_interactions.json"
        self.knowledge_file = self.learning_data_path / f"{agent_name}_knowledge.json"
        self.patterns_file = self.learning_data_path / f"{agent_name}_patterns.json"
        
        # Load existing data
        self.interactions = self._load_data(self.interaction_file, [])
        self.knowledge_base = self._load_data(self.knowledge_file, {})
        self.patterns = self._load_data(self.patterns_file, {})
    
    def _load_data(self, file_path: Path, default_value: Any) -> Any:
        """Load data from JSON file"""
        try:
            if file_path.exists():
                with open(file_path, 'r') as f:
                    return json.load(f)
            return default_value
        except Exception as e:
            logger.error(f"Error loading data from {file_path}: {e}")
            return default_value
    
    def _save_data(self, file_path: Path, data: Any):
        """Save data to JSON file"""
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving data to {file_path}: {e}")
    
    def record_interaction(self, user_query: str, agent_response: str, 
                          intent: str, context: Dict[str, Any], 
                          satisfaction_score: Optional[float] = None):
        """
        Record a user interaction for learning purposes
        
        Args:
            user_query: The user's query
            agent_response: The agent's response
            intent: Classified intent
            context: Additional context from MeTTa
            satisfaction_score: Optional user satisfaction rating
        """
        interaction = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_query": user_query,
            "agent_response": agent_response,
            "intent": intent,
            "context": context,
            "satisfaction_score": satisfaction_score,
            "agent_name": self.agent_name
        }
        
        self.interactions.append(interaction)
        self._save_data(self.interaction_file, self.interactions)
        
        logger.info(f"Recorded interaction for {self.agent_name}")
    
    def extract_knowledge_patterns(self, min_frequency: int = 3):
        """
        Extract knowledge patterns from recorded interactions
        
        Args:
            min_frequency: Minimum frequency for a pattern to be considered significant
        """
        # Analyze interactions to find common patterns
        intent_patterns = {}
        query_patterns = {}
        response_patterns = {}
        
        for interaction in self.interactions:
            intent = interaction.get("intent", "unknown")
            query = interaction.get("user_query", "").lower()
            response = interaction.get("agent_response", "")
            
            # Track intent patterns
            if intent not in intent_patterns:
                intent_patterns[intent] = 0
            intent_patterns[intent] += 1
            
            # Extract keywords from queries
            keywords = self._extract_keywords(query)
            for keyword in keywords:
                if keyword not in query_patterns:
                    query_patterns[keyword] = {"count": 0, "intents": set()}
                query_patterns[keyword]["count"] += 1
                query_patterns[keyword]["intents"].add(intent)
            
            # Track response effectiveness
            satisfaction = interaction.get("satisfaction_score")
            if satisfaction is not None:
                response_key = self._hash_response(response)
                if response_key not in response_patterns:
                    response_patterns[response_key] = {"scores": [], "count": 0}
                response_patterns[response_key]["scores"].append(satisfaction)
                response_patterns[response_key]["count"] += 1
        
        # Filter patterns by frequency
        significant_patterns = {
            "intent_patterns": {k: v for k, v in intent_patterns.items() if v >= min_frequency},
            "query_patterns": {k: v for k, v in query_patterns.items() if v["count"] >= min_frequency},
            "response_patterns": {k: v for k, v in response_patterns.items() if v["count"] >= min_frequency}
        }
        
        # Convert sets to lists for JSON serialization
        for pattern in significant_patterns["query_patterns"].values():
            pattern["intents"] = list(pattern["intents"])
        
        self.patterns = significant_patterns
        self._save_data(self.patterns_file, self.patterns)
        
        logger.info(f"Extracted knowledge patterns for {self.agent_name}")
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text"""
        # Simple keyword extraction (can be enhanced with NLP)
        stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        words = text.split()
        keywords = [word.lower().strip(".,!?") for word in words if word.lower() not in stop_words and len(word) > 2]
        return keywords
    
    def _hash_response(self, response: str) -> str:
        """Create a hash for response patterns"""
        return str(hash(response[:100]))  # Use first 100 chars for hashing
    
    def update_knowledge_base(self, new_knowledge: Dict[str, Any]):
        """
        Update the agent's knowledge base with new information
        
        Args:
            new_knowledge: New knowledge to add
        """
        timestamp = datetime.utcnow().isoformat()
        
        for category, knowledge_items in new_knowledge.items():
            if category not in self.knowledge_base:
                self.knowledge_base[category] = {}
            
            for key, value in knowledge_items.items():
                if key not in self.knowledge_base[category]:
                    self.knowledge_base[category][key] = []
                
                knowledge_entry = {
                    "value": value,
                    "timestamp": timestamp,
                    "source": "dynamic_learning",
                    "confidence": 0.8  # Default confidence for learned knowledge
                }
                
                self.knowledge_base[category][key].append(knowledge_entry)
        
        self._save_data(self.knowledge_file, self.knowledge_base)
        logger.info(f"Updated knowledge base for {self.agent_name}")
    
    def get_learned_knowledge(self, category: Optional[str] = None) -> Dict[str, Any]:
        """
        Get learned knowledge from the knowledge base
        
        Args:
            category: Optional category to filter by
            
        Returns:
            Learned knowledge dictionary
        """
        if category:
            return self.knowledge_base.get(category, {})
        return self.knowledge_base.copy()
    
    def get_interaction_statistics(self) -> Dict[str, Any]:
        """Get statistics about recorded interactions"""
        if not self.interactions:
            return {"total_interactions": 0}
        
        total_interactions = len(self.interactions)
        intents = [i.get("intent", "unknown") for i in self.interactions]
        satisfaction_scores = [i.get("satisfaction_score") for i in self.interactions if i.get("satisfaction_score") is not None]
        
        statistics = {
            "total_interactions": total_interactions,
            "unique_intents": len(set(intents)),
            "intent_distribution": {intent: intents.count(intent) for intent in set(intents)},
            "average_satisfaction": sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else None,
            "interactions_with_satisfaction": len(satisfaction_scores),
            "latest_interaction": max(self.interactions, key=lambda x: x["timestamp"])["timestamp"] if self.interactions else None
        }
        
        return statistics
    
    def generate_learning_insights(self) -> Dict[str, Any]:
        """Generate insights from learning data"""
        insights = {
            "interaction_statistics": self.get_interaction_statistics(),
            "knowledge_patterns": self.patterns,
            "recommendations": []
        }
        
        # Generate recommendations based on patterns
        if self.patterns.get("intent_patterns"):
            most_common_intent = max(self.patterns["intent_patterns"].items(), key=lambda x: x[1])
            insights["recommendations"].append(
                f"Most common intent is '{most_common_intent[0]}' ({most_common_intent[1]} interactions). Consider optimizing responses for this intent."
            )
        
        if self.patterns.get("response_patterns"):
            high_performing_responses = [
                k for k, v in self.patterns["response_patterns"].items() 
                if v["count"] >= 3 and sum(v["scores"]) / len(v["scores"]) >= 4.0
            ]
            if high_performing_responses:
                insights["recommendations"].append(
                    f"Found {len(high_performing_responses)} high-performing response patterns. Consider using these as templates."
                )
        
        return insights
    
    def export_learning_data(self, export_path: Optional[str] = None) -> str:
        """Export all learning data to a file"""
        if not export_path:
            export_path = self.learning_data_path / f"{self.agent_name}_learning_export.json"
        
        export_data = {
            "agent_name": self.agent_name,
            "export_timestamp": datetime.utcnow().isoformat(),
            "interactions": self.interactions,
            "knowledge_base": self.knowledge_base,
            "patterns": self.patterns,
            "insights": self.generate_learning_insights()
        }
        
        with open(export_path, 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        logger.info(f"Exported learning data to {export_path}")
        return str(export_path)

# Global learning system instances for each agent
healthcare_learning = DynamicLearningSystem("healthcare_agent")
financial_learning = DynamicLearningSystem("financial_agent")
logistics_learning = DynamicLearningSystem("logistics_agent")
