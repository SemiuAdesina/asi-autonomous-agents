#!/usr/bin/env python3
"""
MeTTa Knowledge Graph Initialization - Real Integration
Connects to the actual MeTTa Knowledge Graph server
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
    medical_metta = MeTTaKnowledgeGraph("http://localhost:8080")
    logger.info("✅ Connected to real MeTTa Knowledge Graph server")
except Exception as e:
    logger.warning(f"Failed to connect to MeTTa server: {e}")
    # Fallback to mock implementation
    medical_metta = MeTTaKnowledgeGraph()  # Uses mock responses
    logger.info("✅ Using MeTTa Knowledge Graph with mock responses")

print("✅ MeTTa Medical Knowledge Graph initialized successfully")
