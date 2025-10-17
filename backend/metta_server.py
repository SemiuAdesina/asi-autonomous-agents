#!/usr/bin/env python3
"""
MeTTa Knowledge Graph Server
A simplified MeTTa server implementation for the ASI Alliance Hackathon
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MeTTa Knowledge Graph Server",
    description="SingularityNET MeTTa Knowledge Graph for ASI Alliance Hackathon",
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

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    parameters: Optional[Dict[str, Any]] = {}

class QueryResponse(BaseModel):
    results: List[Dict[str, Any]]
    status: str
    message: str
    timestamp: str

class ConceptRequest(BaseModel):
    name: str
    properties: Dict[str, Any]

class RelationshipRequest(BaseModel):
    from_concept: str
    to_concept: str
    relationship_type: str
    properties: Optional[Dict[str, Any]] = {}

# In-memory knowledge graph storage
knowledge_graph = {
    "concepts": {},
    "relationships": []
}

# Sample knowledge base for ASI Alliance domains
SAMPLE_KNOWLEDGE = {
    "healthcare": {
        "concepts": {
            "Fever": {
                "name": "Fever",
                "description": "Elevated body temperature indicating illness",
                "domain": "healthcare",
                "properties": {
                    "normal_range": "36.1-37.2°C",
                    "dangerous_threshold": "39.4°C",
                    "common_causes": ["infection", "inflammation", "dehydration"],
                    "treatments": ["rest", "hydration", "medication"]
                }
            },
            "Antibiotic": {
                "name": "Antibiotic",
                "description": "Medication that fights bacterial infections",
                "domain": "healthcare",
                "properties": {
                    "mechanism": "inhibits_bacterial_growth",
                    "effectiveness": "bacterial_infections_only",
                    "side_effects": ["resistance", "allergic_reactions"]
                }
            },
            "Symptom": {
                "name": "Symptom",
                "description": "Physical or mental indication of disease",
                "domain": "healthcare",
                "properties": {
                    "types": ["physical", "mental", "behavioral"],
                    "severity_levels": ["mild", "moderate", "severe"]
                }
            }
        },
        "relationships": [
            {"from": "Fever", "to": "Antibiotic", "type": "TREATED_BY", "properties": {"effectiveness": "conditional"}},
            {"from": "Fever", "to": "Symptom", "type": "IS_A", "properties": {"category": "physical"}},
            {"from": "Antibiotic", "to": "Symptom", "type": "TREATS", "properties": {"scope": "bacterial"}}
        ]
    },
    "logistics": {
        "concepts": {
            "Route Optimization": {
                "name": "Route Optimization",
                "description": "Process of finding the most efficient route",
                "domain": "logistics",
                "properties": {
                    "algorithms": ["Dijkstra", "A*", "Genetic"],
                    "factors": ["distance", "time", "fuel_cost"],
                    "complexity": "NP-hard"
                }
            },
            "Inventory Management": {
                "name": "Inventory Management",
                "description": "Control of stock levels and movement",
                "domain": "logistics",
                "properties": {
                    "methods": ["JIT", "EOQ", "ABC_analysis"],
                    "technologies": ["RFID", "barcode", "IoT"],
                    "benefits": ["cost_reduction", "efficiency"]
                }
            },
            "Supply Chain": {
                "name": "Supply Chain",
                "description": "Network of organizations involved in product delivery",
                "domain": "logistics",
                "properties": {
                    "components": ["suppliers", "manufacturers", "distributors"],
                    "optimization": ["cost", "time", "quality"]
                }
            }
        },
        "relationships": [
            {"from": "Route Optimization", "to": "Inventory Management", "type": "SUPPORTS", "properties": {"impact": "high"}},
            {"from": "Route Optimization", "to": "Supply Chain", "type": "OPTIMIZES", "properties": {"magnitude": "significant"}},
            {"from": "Inventory Management", "to": "Supply Chain", "type": "PART_OF", "properties": {"importance": "critical"}}
        ]
    },
    "finance": {
        "concepts": {
            "DeFi": {
                "name": "DeFi",
                "description": "Decentralized Finance protocols",
                "domain": "finance",
                "properties": {
                    "protocols": ["Uniswap", "Compound", "Aave"],
                    "benefits": ["permissionless", "transparent", "global"],
                    "risks": ["smart_contract", "liquidity", "regulatory"]
                }
            },
            "Yield Farming": {
                "name": "Yield Farming",
                "description": "Earning rewards by providing liquidity",
                "domain": "finance",
                "properties": {
                    "mechanism": "liquidity_provision",
                    "rewards": ["tokens", "fees", "governance"],
                    "risks": ["impermanent_loss", "smart_contract"]
                }
            },
            "Portfolio Management": {
                "name": "Portfolio Management",
                "description": "Strategic management of investment portfolio",
                "domain": "finance",
                "properties": {
                    "strategies": ["diversification", "rebalancing", "risk_management"],
                    "tools": ["analytics", "monitoring", "optimization"]
                }
            }
        },
        "relationships": [
            {"from": "DeFi", "to": "Yield Farming", "type": "ENABLES", "properties": {"mechanism": "liquidity_pools"}},
            {"from": "Yield Farming", "to": "Portfolio Management", "type": "REQUIRES", "properties": {"importance": "critical"}},
            {"from": "DeFi", "to": "Portfolio Management", "type": "SUPPORTS", "properties": {"integration": "seamless"}}
        ]
    }
}

def initialize_knowledge_graph():
    """Initialize the knowledge graph with sample data"""
    global knowledge_graph
    
    # Add concepts
    for domain, data in SAMPLE_KNOWLEDGE.items():
        for concept_name, concept_data in data["concepts"].items():
            knowledge_graph["concepts"][concept_name] = concept_data
    
    # Add relationships
    for domain, data in SAMPLE_KNOWLEDGE.items():
        knowledge_graph["relationships"].extend(data["relationships"])
    
    logger.info(f"Initialized knowledge graph with {len(knowledge_graph['concepts'])} concepts and {len(knowledge_graph['relationships'])} relationships")

@app.on_event("startup")
async def startup_event():
    """Initialize the knowledge graph on startup"""
    initialize_knowledge_graph()
    logger.info("MeTTa Knowledge Graph Server started")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "MeTTa Knowledge Graph Server",
        "version": "1.0.0",
        "status": "running",
        "concepts": len(knowledge_graph["concepts"]),
        "relationships": len(knowledge_graph["relationships"])
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "concepts": len(knowledge_graph["concepts"]),
        "relationships": len(knowledge_graph["relationships"])
    }

@app.post("/query", response_model=QueryResponse)
async def query_knowledge_graph(request: QueryRequest):
    """Query the knowledge graph"""
    try:
        query_lower = request.query.lower()
        
        # Healthcare queries
        if any(keyword in query_lower for keyword in ['health', 'medical', 'symptom', 'disease', 'treatment', 'fever', 'pain']):
            results = []
            for concept_name, concept_data in knowledge_graph["concepts"].items():
                if concept_data.get("domain") == "healthcare":
                    results.append({
                        "concept": concept_name,
                        "data": concept_data,
                        "relevance": 0.9 if any(keyword in concept_name.lower() for keyword in query_lower.split()) else 0.7
                    })
            
            return QueryResponse(
                results=results[:5],  # Limit to top 5 results
                status="success",
                message="Found relevant healthcare knowledge",
                timestamp=datetime.utcnow().isoformat()
            )
        
        # Logistics queries
        elif any(keyword in query_lower for keyword in ['logistics', 'supply', 'chain', 'delivery', 'inventory', 'route', 'optimization']):
            results = []
            for concept_name, concept_data in knowledge_graph["concepts"].items():
                if concept_data.get("domain") == "logistics":
                    results.append({
                        "concept": concept_name,
                        "data": concept_data,
                        "relevance": 0.9 if any(keyword in concept_name.lower() for keyword in query_lower.split()) else 0.7
                    })
            
            return QueryResponse(
                results=results[:5],
                status="success",
                message="Found relevant logistics knowledge",
                timestamp=datetime.utcnow().isoformat()
            )
        
        # Finance queries
        elif any(keyword in query_lower for keyword in ['finance', 'investment', 'portfolio', 'defi', 'crypto', 'yield', 'farming']):
            results = []
            for concept_name, concept_data in knowledge_graph["concepts"].items():
                if concept_data.get("domain") == "finance":
                    results.append({
                        "concept": concept_name,
                        "data": concept_data,
                        "relevance": 0.9 if any(keyword in concept_name.lower() for keyword in query_lower.split()) else 0.7
                    })
            
            return QueryResponse(
                results=results[:5],
                status="success",
                message="Found relevant financial knowledge",
                timestamp=datetime.utcnow().isoformat()
            )
        
        # General queries
        else:
            results = []
            for concept_name, concept_data in knowledge_graph["concepts"].items():
                if any(keyword in concept_name.lower() for keyword in query_lower.split()):
                    results.append({
                        "concept": concept_name,
                        "data": concept_data,
                        "relevance": 0.8
                    })
            
            return QueryResponse(
                results=results[:3],
                status="success",
                message="Found general knowledge",
                timestamp=datetime.utcnow().isoformat()
            )
    
    except Exception as e:
        logger.error(f"Query error: {e}")
        return QueryResponse(
            results=[],
            status="error",
            message=f"Query failed: {str(e)}",
            timestamp=datetime.utcnow().isoformat()
        )

@app.post("/concepts", response_model=QueryResponse)
async def add_concept(request: ConceptRequest):
    """Add a new concept to the knowledge graph"""
    try:
        knowledge_graph["concepts"][request.name] = {
            "name": request.name,
            "properties": request.properties,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return QueryResponse(
            results=[{"concept": request.name, "status": "added"}],
            status="success",
            message=f"Concept '{request.name}' added successfully",
            timestamp=datetime.utcnow().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Add concept error: {e}")
        return QueryResponse(
            results=[],
            status="error",
            message=f"Failed to add concept: {str(e)}",
            timestamp=datetime.utcnow().isoformat()
        )

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
