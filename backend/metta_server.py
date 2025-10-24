#!/usr/bin/env python3
"""
MeTTa Knowledge Graph Server
FastAPI server providing MeTTa Knowledge Graph functionality
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MeTTa Knowledge Graph Server",
    description="Knowledge Graph server for ASI Autonomous Agents",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Knowledge Graph Storage
knowledge_graph = {
    "concepts": [],
    "relationships": []
}

# Pydantic Models
class Concept(BaseModel):
    name: str
    description: str
    domain: str
    properties: Dict[str, Any] = {}

class Relationship(BaseModel):
    from_concept: str
    to_concept: str
    relationship_type: str
    properties: Dict[str, Any] = {}

class QueryRequest(BaseModel):
    query: str
    parameters: Dict[str, Any] = {}

class QueryResponse(BaseModel):
    query: str
    results: List[Dict[str, Any]]
    status: str
    message: str
    timestamp: str

# Initialize sample knowledge
def initialize_knowledge_graph():
    """Initialize the knowledge graph with sample data"""
    global knowledge_graph
    
    # Healthcare concepts
    healthcare_concepts = [
        {
            "name": "Fever",
            "description": "Elevated body temperature indicating illness",
            "domain": "healthcare",
            "properties": {
                "normal_range": "36.1-37.2°C",
                "dangerous_threshold": "39.4°C",
                "common_causes": ["infection", "inflammation", "dehydration"]
            }
        },
        {
            "name": "Antibiotic",
            "description": "Medication that fights bacterial infections",
            "domain": "healthcare",
            "properties": {
                "mechanism": "inhibits_bacterial_growth",
                "effectiveness": "bacterial_infections_only",
                "side_effects": ["resistance", "allergic_reactions"]
            }
        },
        {
            "name": "Symptom Analysis",
            "description": "Process of analyzing patient symptoms for diagnosis",
            "domain": "healthcare",
            "properties": {
                "methods": ["pattern_recognition", "differential_diagnosis"],
                "tools": ["clinical_guidelines", "medical_databases"]
            }
        }
    ]
    
    # Financial concepts
    financial_concepts = [
        {
            "name": "DeFi",
            "description": "Decentralized Finance protocols",
            "domain": "finance",
            "properties": {
                "protocols": ["Uniswap", "Compound", "Aave"],
                "benefits": ["permissionless", "transparent", "global"],
                "risks": ["smart_contract", "liquidity", "regulatory"]
            }
        },
        {
            "name": "Yield Farming",
            "description": "Earning rewards by providing liquidity",
            "domain": "finance",
            "properties": {
                "mechanism": "liquidity_provision",
                "rewards": ["tokens", "fees", "governance"],
                "risks": ["impermanent_loss", "smart_contract"]
            }
        },
        {
            "name": "Portfolio Management",
            "description": "Strategic management of investment portfolios",
            "domain": "finance",
            "properties": {
                "strategies": ["diversification", "rebalancing", "risk_management"],
                "tools": ["analytics", "monitoring", "optimization"]
            }
        }
    ]
    
    # Logistics concepts
    logistics_concepts = [
        {
            "name": "Route Optimization",
            "description": "Process of finding the most efficient route",
            "domain": "logistics",
            "properties": {
                "algorithms": ["Dijkstra", "A*", "Genetic"],
                "factors": ["distance", "time", "fuel_cost"],
                "complexity": "NP-hard"
            }
        },
        {
            "name": "Inventory Management",
            "description": "Control of stock levels and movement",
            "domain": "logistics",
            "properties": {
                "methods": ["JIT", "EOQ", "ABC_analysis"],
                "technologies": ["RFID", "barcode", "IoT"],
                "benefits": ["cost_reduction", "efficiency"]
            }
        },
        {
            "name": "Supply Chain",
            "description": "Network of organizations involved in product delivery",
            "domain": "logistics",
            "properties": {
                "components": ["suppliers", "manufacturers", "distributors"],
                "optimization": ["cost", "time", "quality"]
            }
        }
    ]
    
    # Add all concepts
    knowledge_graph["concepts"] = healthcare_concepts + financial_concepts + logistics_concepts
    
    # Add relationships
    knowledge_graph["relationships"] = [
        {
            "from_concept": "Fever",
            "to_concept": "Antibiotic",
            "relationship_type": "TREATED_BY",
            "properties": {"effectiveness": "conditional"}
        },
        {
            "from_concept": "Symptom Analysis",
            "to_concept": "Fever",
            "relationship_type": "ANALYZES",
            "properties": {"method": "clinical_assessment"}
        },
        {
            "from_concept": "DeFi",
            "to_concept": "Yield Farming",
            "relationship_type": "ENABLES",
            "properties": {"mechanism": "liquidity_pools"}
        },
        {
            "from_concept": "Portfolio Management",
            "to_concept": "DeFi",
            "relationship_type": "MANAGES",
            "properties": {"strategy": "defi_integration"}
        },
        {
            "from_concept": "Route Optimization",
            "to_concept": "Inventory Management",
            "relationship_type": "SUPPORTS",
            "properties": {"impact": "high"}
        },
        {
            "from_concept": "Supply Chain",
            "to_concept": "Route Optimization",
            "relationship_type": "REQUIRES",
            "properties": {"necessity": "critical"}
        }
    ]
    
    logger.info(f"Initialized knowledge graph with {len(knowledge_graph['concepts'])} concepts and {len(knowledge_graph['relationships'])} relationships")

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the knowledge graph on startup"""
    initialize_knowledge_graph()
    logger.info("MeTTa Knowledge Graph Server started")

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "MeTTa Knowledge Graph Server",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "concepts_count": len(knowledge_graph["concepts"]),
        "relationships_count": len(knowledge_graph["relationships"])
    }

@app.post("/query", response_model=QueryResponse)
async def query_knowledge_graph(request: QueryRequest):
    """Query the knowledge graph"""
    try:
        query_lower = request.query.lower()
        results = []
        
        # Simple query processing
        if "concept" in query_lower or "find" in query_lower:
            # Search for concepts
            search_term = request.query.replace("concept", "").replace("find", "").strip()
            for concept in knowledge_graph["concepts"]:
                if (search_term.lower() in concept["name"].lower() or 
                    search_term.lower() in concept["description"].lower()):
                    results.append({
                        "concept": concept,
                        "type": "concept",
                        "confidence": 0.9
                    })
        
        elif "relationship" in query_lower or "relate" in query_lower:
            # Search for relationships
            search_term = request.query.replace("relationship", "").replace("relate", "").strip()
            for rel in knowledge_graph["relationships"]:
                if (search_term.lower() in rel["from_concept"].lower() or 
                    search_term.lower() in rel["to_concept"].lower() or
                    search_term.lower() in rel["relationship_type"].lower()):
                    results.append({
                        "relationship": rel,
                        "type": "relationship",
                        "confidence": 0.9
                    })
        
        else:
            # General search
            search_term = request.query.lower()
            for concept in knowledge_graph["concepts"]:
                if (search_term in concept["name"].lower() or 
                    search_term in concept["description"].lower() or
                    search_term in concept["domain"].lower()):
                    results.append({
                        "concept": concept,
                        "type": "concept",
                        "confidence": 0.8
                    })
            
            for rel in knowledge_graph["relationships"]:
                if (search_term in rel["from_concept"].lower() or 
                    search_term in rel["to_concept"].lower() or
                    search_term in rel["relationship_type"].lower()):
                    results.append({
                        "relationship": rel,
                        "type": "relationship",
                        "confidence": 0.8
                    })
        
        return QueryResponse(
            query=request.query,
            results=results,
            status="success",
            message=f"Found {len(results)} results",
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/concepts")
async def get_concepts():
    """Get all concepts"""
    return {
        "concepts": knowledge_graph["concepts"],
        "count": len(knowledge_graph["concepts"]),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/relationships")
async def get_relationships():
    """Get all relationships"""
    return {
        "relationships": knowledge_graph["relationships"],
        "count": len(knowledge_graph["relationships"]),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/concepts")
async def add_concept(concept: Concept):
    """Add a new concept"""
    try:
        knowledge_graph["concepts"].append(concept.dict())
        logger.info(f"Added concept: {concept.name}")
        return {"message": f"Concept '{concept.name}' added successfully"}
    except Exception as e:
        logger.error(f"Error adding concept: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/relationships")
async def add_relationship(relationship: Relationship):
    """Add a new relationship"""
    try:
        knowledge_graph["relationships"].append(relationship.dict())
        logger.info(f"Added relationship: {relationship.from_concept} -> {relationship.to_concept}")
        return {"message": f"Relationship added successfully"}
    except Exception as e:
        logger.error(f"Error adding relationship: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting MeTTa Knowledge Graph Server...")
    print("Server will be available at: http://localhost:8080")
    print("Query endpoint: http://localhost:8080/query")
    print("Health check: http://localhost:8080/health")
    print("=" * 50)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )