#!/usr/bin/env python3
"""
Medical RAG System - Using Real MeTTa Integration
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'knowledge'))

from metta_kg.integration import MeTTaKnowledgeGraph
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class MedicalRAG:
    """
    Medical RAG (Retrieval-Augmented Generation) system
    Uses real MeTTa Knowledge Graph integration
    """
    
    def __init__(self, metta_instance: MeTTaKnowledgeGraph):
        self.metta = metta_instance
    
    def query_symptom(self, symptom: str) -> List[str]:
        """Query diseases associated with a symptom using MeTTa"""
        try:
            # Query concept from MeTTa knowledge graph
            concept = self.metta.query_concept(symptom)
            if concept:
                return [concept.get('name', symptom)]
            return []
        except Exception as e:
            logger.error(f"Error querying symptom {symptom}: {e}")
            return []
    
    def get_treatment(self, condition: str) -> List[str]:
        """Get treatments for a condition using MeTTa"""
        try:
            # Find related concepts
            relationships = self.metta.find_relationships(condition)
            treatments = []
            for rel in relationships:
                if 'related' in rel:
                    treatments.append(rel['related'].get('name', ''))
            return treatments
        except Exception as e:
            logger.error(f"Error getting treatment for {condition}: {e}")
            return []
    
    def get_side_effects(self, treatment: str) -> List[str]:
        """Get side effects for a treatment using MeTTa"""
        try:
            # Find related concepts
            relationships = self.metta.find_relationships(treatment, 'HAS_SIDE_EFFECT')
            side_effects = []
            for rel in relationships:
                if 'related' in rel:
                    side_effects.append(rel['related'].get('name', ''))
            return side_effects
        except Exception as e:
            logger.error(f"Error getting side effects for {treatment}: {e}")
            return []
    
    def check_drug_interaction(self, drug1: str, drug2: str) -> str:
        """Check for drug interactions using MeTTa"""
        try:
            # Query for interaction
            relationships = self.metta.find_relationships(drug1, 'INTERACTS_WITH')
            for rel in relationships:
                if 'related' in rel and rel['related'].get('name') == drug2:
                    return "Interacting"
            return "No known interaction"
        except Exception as e:
            logger.error(f"Error checking drug interaction: {e}")
            return "Error checking interaction"
    
    def get_prevention(self, condition: str) -> List[str]:
        """Get prevention tips for a condition using MeTTa"""
        try:
            relationships = self.metta.find_relationships(condition)
            prevention_tips = []
            for rel in relationships:
                if 'related' in rel:
                    prevention_tips.append(rel['related'].get('name', ''))
            return prevention_tips
        except Exception as e:
            logger.error(f"Error getting prevention for {condition}: {e}")
            return []
    
    def query_general(self, query: str) -> List[str]:
        """General health knowledge query using MeTTa"""
        try:
            concept = self.metta.query_concept(query)
            if concept:
                return [str(concept)]
            return []
        except Exception as e:
            logger.error(f"Error querying general knowledge for {query}: {e}")
            return []
    
    def add_knowledge(self, category: str, key: str, value: str, source: str = "user"):
        """Add knowledge to the MeTTa knowledge graph"""
        try:
            self.metta.add_concept(key, {category: value, "source": source})
            logger.info(f"Added knowledge: {category}, {key}, {value}")
        except Exception as e:
            logger.error(f"Error adding knowledge: {e}")
