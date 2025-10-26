#!/usr/bin/env python3
"""
MeTTa Knowledge Graph Initialization for Logistics Agent - Real Integration
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
    logistics_metta = MeTTaKnowledgeGraph(metta_url)
    logger.info(f"✅ Connected to real MeTTa Knowledge Graph server at {metta_url}")
except Exception as e:
    logger.warning(f"Failed to connect to MeTTa server: {e}")
    # Fallback to mock implementation
    logistics_metta = MeTTaKnowledgeGraph()  # Uses mock responses
    logger.info("✅ Using MeTTa Knowledge Graph with mock responses")

class LogisticsKnowledgeGraph:
    """Logistics Knowledge Graph using real MeTTa integration"""
    
    def __init__(self):
        self.metta = logistics_metta
    
    def query(self, query: str) -> Dict[str, Any]:
        """Query the logistics knowledge graph"""
        try:
            # Use semantic search from MeTTa
            results = self.metta.semantic_search(query, limit=10)
            return {
                "query": query,
                "results": results,
                "count": len(results)
            }
        except Exception as e:
            logger.error(f"Error querying logistics knowledge: {e}")
            return {"error": str(e)}

print("✅ MeTTa Logistics Knowledge Graph initialized successfully")
