#!/usr/bin/env python3
"""
Analytics & Ratings System for ASI Agents
Tracks agent performance, user interactions, and provides ratings
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import logging

logger = logging.getLogger(__name__)

@dataclass
class Interaction:
    """Represents a single user-agent interaction"""
    timestamp: datetime
    agent_id: str
    user_query: str
    agent_response: str
    response_time_ms: int
    user_rating: Optional[int] = None
    feedback: Optional[str] = None

@dataclass
class AgentMetrics:
    """Agent performance metrics"""
    agent_id: str
    total_interactions: int
    average_response_time_ms: float
    average_rating: float
    total_ratings: int
    success_rate: float
    last_interaction: datetime
    knowledge_additions: int

class AnalyticsSystem:
    """
    Analytics system for tracking agent performance and user interactions
    """
    
    def __init__(self, data_file: str = "analytics.json"):
        self.data_file = data_file
        self.interactions: List[Interaction] = []
        self.load_data()
    
    def load_data(self):
        """Load analytics data from file"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    self.interactions = [
                        Interaction(
                            timestamp=datetime.fromisoformat(i['timestamp']),
                            agent_id=i['agent_id'],
                            user_query=i['user_query'],
                            agent_response=i['agent_response'],
                            response_time_ms=i['response_time_ms'],
                            user_rating=i.get('user_rating'),
                            feedback=i.get('feedback')
                        )
                        for i in data.get('interactions', [])
                    ]
                logger.info(f"Loaded {len(self.interactions)} interactions from analytics data")
        except Exception as e:
            logger.error(f"Error loading analytics data: {e}")
            self.interactions = []
    
    def save_data(self):
        """Save analytics data to file"""
        try:
            data = {
                'interactions': [
                    {
                        'timestamp': i.timestamp.isoformat(),
                        'agent_id': i.agent_id,
                        'user_query': i.user_query,
                        'agent_response': i.agent_response,
                        'response_time_ms': i.response_time_ms,
                        'user_rating': i.user_rating,
                        'feedback': i.feedback
                    }
                    for i in self.interactions
                ]
            }
            
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            logger.info(f"Saved {len(self.interactions)} interactions to analytics data")
        except Exception as e:
            logger.error(f"Error saving analytics data: {e}")
    
    def log_interaction(self, agent_id: str, user_query: str, agent_response: str, response_time_ms: int):
        """Log a new interaction"""
        interaction = Interaction(
            timestamp=datetime.now(),
            agent_id=agent_id,
            user_query=user_query,
            agent_response=agent_response,
            response_time_ms=response_time_ms
        )
        
        self.interactions.append(interaction)
        self.save_data()
        
        logger.info(f"Logged interaction for agent {agent_id}")
    
    def add_rating(self, agent_id: str, rating: int, feedback: str = None):
        """Add a user rating for an agent"""
        # Find the most recent interaction for this agent
        for interaction in reversed(self.interactions):
            if interaction.agent_id == agent_id and interaction.user_rating is None:
                interaction.user_rating = rating
                interaction.feedback = feedback
                self.save_data()
                logger.info(f"Added rating {rating} for agent {agent_id}")
                return True
        
        logger.warning(f"No recent interaction found for agent {agent_id} to rate")
        return False
    
    def get_agent_metrics(self, agent_id: str) -> AgentMetrics:
        """Get performance metrics for a specific agent"""
        agent_interactions = [i for i in self.interactions if i.agent_id == agent_id]
        
        if not agent_interactions:
            return AgentMetrics(
                agent_id=agent_id,
                total_interactions=0,
                average_response_time_ms=0,
                average_rating=0,
                total_ratings=0,
                success_rate=0,
                last_interaction=datetime.now(),
                knowledge_additions=0
            )
        
        total_interactions = len(agent_interactions)
        average_response_time = sum(i.response_time_ms for i in agent_interactions) / total_interactions
        
        rated_interactions = [i for i in agent_interactions if i.user_rating is not None]
        average_rating = sum(i.user_rating for i in rated_interactions) / len(rated_interactions) if rated_interactions else 0
        
        # Calculate success rate based on ratings (4+ stars = success)
        successful_interactions = len([i for i in rated_interactions if i.user_rating >= 4])
        success_rate = successful_interactions / len(rated_interactions) if rated_interactions else 0
        
        last_interaction = max(i.timestamp for i in agent_interactions)
        
        return AgentMetrics(
            agent_id=agent_id,
            total_interactions=total_interactions,
            average_response_time_ms=average_response_time,
            average_rating=average_rating,
            total_ratings=len(rated_interactions),
            success_rate=success_rate,
            last_interaction=last_interaction,
            knowledge_additions=0  # This would be tracked separately
        )
    
    def get_all_metrics(self) -> Dict[str, AgentMetrics]:
        """Get metrics for all agents"""
        agent_ids = set(i.agent_id for i in self.interactions)
        return {agent_id: self.get_agent_metrics(agent_id) for agent_id in agent_ids}
    
    def get_recent_interactions(self, hours: int = 24) -> List[Interaction]:
        """Get interactions from the last N hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        return [i for i in self.interactions if i.timestamp >= cutoff]
    
    def get_top_agents(self, limit: int = 5) -> List[AgentMetrics]:
        """Get top performing agents by rating"""
        all_metrics = self.get_all_metrics()
        return sorted(all_metrics.values(), key=lambda x: x.average_rating, reverse=True)[:limit]

# Global analytics instance
analytics = AnalyticsSystem()
