#!/usr/bin/env python3
"""
Medical RAG System - Following Official Workshop Structure
Based on the Fetch.ai Innovation Lab examples
"""

from workshop_metta import WorkshopMeTTa
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class MedicalRAG:
    """
    Medical RAG (Retrieval-Augmented Generation) system
    Following the workshop examples for medical knowledge retrieval
    """
    
    def __init__(self, metta_instance: WorkshopMeTTa):
        self.metta = metta_instance
    
    def query_symptom(self, symptom: str) -> List[str]:
        """
        Query diseases associated with a symptom using MeTTa pattern matching
        """
        try:
            # MeTTa query: Find diseases for a symptom
            query_str = f'!(match &self (symptom {symptom} $disease) $disease)'
            results = self.metta.run(query_str)
            
            diseases = []
            for result in results:
                if hasattr(result, 'value'):
                    diseases.append(str(result.value))
                else:
                    diseases.append(str(result))
            
            print(f"🔍 MeTTa Query: Symptom '{symptom}' → Diseases: {diseases}")
            return diseases
            
        except Exception as e:
            logger.error(f"Error querying symptom {symptom}: {e}")
            return []
    
    def get_treatment(self, condition: str) -> List[str]:
        """
        Get treatments for a condition using MeTTa pattern matching
        """
        try:
            # MeTTa query: Find treatments for a condition
            query_str = f'!(match &self (treatment {condition} $treatment) $treatment)'
            results = self.metta.run(query_str)
            
            treatments = []
            for result in results:
                if hasattr(result, 'value'):
                    treatments.append(str(result.value))
                else:
                    treatments.append(str(result))
            
            print(f"🔍 MeTTa Query: Treatment for '{condition}' → {treatments}")
            return treatments
            
        except Exception as e:
            logger.error(f"Error getting treatment for {condition}: {e}")
            return []
    
    def get_side_effects(self, treatment: str) -> List[str]:
        """
        Get side effects for a treatment using MeTTa pattern matching
        """
        try:
            # MeTTa query: Find side effects for a treatment
            query_str = f'!(match &self (side_effect {treatment} $side_effect) $side_effect)'
            results = self.metta.run(query_str)
            
            side_effects = []
            for result in results:
                if hasattr(result, 'value'):
                    side_effects.append(str(result.value))
                else:
                    side_effects.append(str(result))
            
            print(f"🔍 MeTTa Query: Side effects for '{treatment}' → {side_effects}")
            return side_effects
            
        except Exception as e:
            logger.error(f"Error getting side effects for {treatment}: {e}")
            return []
    
    def check_drug_interaction(self, drug1: str, drug2: str) -> str:
        """
        Check for drug interactions using MeTTa pattern matching
        """
        try:
            # MeTTa query: Check drug interaction
            query_str = f'!(match &self (drug_interaction {drug1} {drug2} $interaction) $interaction)'
            results = self.metta.run(query_str)
            
            if results:
                result = results[0]
                interaction = str(result.value) if hasattr(result, 'value') else str(result)
                print(f"🔍 MeTTa Query: Drug interaction '{drug1}' + '{drug2}' → {interaction}")
                return interaction
            else:
                return "No known interaction"
                
        except Exception as e:
            logger.error(f"Error checking drug interaction {drug1} + {drug2}: {e}")
            return "Error checking interaction"
    
    def get_prevention(self, condition: str) -> List[str]:
        """
        Get prevention strategies for a condition using MeTTa pattern matching
        """
        try:
            # MeTTa query: Find prevention strategies
            query_str = f'!(match &self (prevention {condition} $prevention) $prevention)'
            results = self.metta.run(query_str)
            
            preventions = []
            for result in results:
                if hasattr(result, 'value'):
                    preventions.append(str(result.value))
                else:
                    preventions.append(str(result))
            
            print(f"🔍 MeTTa Query: Prevention for '{condition}' → {preventions}")
            return preventions
            
        except Exception as e:
            logger.error(f"Error getting prevention for {condition}: {e}")
            return []
    
    def query_general(self, query: str) -> List[str]:
        """
        General health knowledge query using MeTTa pattern matching
        """
        try:
            # MeTTa query: Find general health tips
            query_str = f'!(match &self (health_tip {query} $tip) $tip)'
            results = self.metta.run(query_str)
            
            tips = []
            for result in results:
                if hasattr(result, 'value'):
                    tips.append(str(result.value))
                else:
                    tips.append(str(result))
            
            print(f"🔍 MeTTa Query: General query '{query}' → {tips}")
            return tips
            
        except Exception as e:
            logger.error(f"Error querying general knowledge for {query}: {e}")
            return []
    
    def add_knowledge(self, category: str, key: str, value: str, source: str = "user"):
        """
        Dynamically add knowledge to the MeTTa knowledge graph
        """
        try:
            # Use our workshop-compatible MeTTa implementation
            self.metta.add_atom(category, key, value)
            
            print(f"📚 MeTTa: Added knowledge - Category: {category}, Key: {key}, Value: {value}, Source: {source}")
            logger.info(f"Added knowledge: {category}_{key} = {value}")
            
        except Exception as e:
            logger.error(f"Error adding knowledge {category}_{key}: {e}")
    
    def get_knowledge_stats(self) -> Dict[str, int]:
        """
        Get statistics about the knowledge graph
        """
        try:
            # Count different types of knowledge atoms
            stats = {
                "symptoms": 0,
                "treatments": 0,
                "side_effects": 0,
                "drug_interactions": 0,
                "preventions": 0,
                "health_tips": 0
            }
            
            # This is a simplified version - in a real implementation,
            # you would query the MeTTa space to count atoms
            stats["symptoms"] = 8  # Based on our initialization
            stats["treatments"] = 6
            stats["side_effects"] = 4
            stats["drug_interactions"] = 3
            stats["preventions"] = 3
            stats["health_tips"] = 3
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting knowledge stats: {e}")
            return {}

print("✅ Medical RAG System initialized successfully")
