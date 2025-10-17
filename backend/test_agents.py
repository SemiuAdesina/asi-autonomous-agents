#!/usr/bin/env python3
"""
Test script to verify agents are working correctly
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

def test_healthcare_agent():
    """Test healthcare agent import and basic functionality"""
    try:
        from agents.healthcare_agent.main import healthcare_agent
        print(f"Healthcare Agent loaded successfully")
        print(f"   Name: {healthcare_agent.name}")
        print(f"   Address: {healthcare_agent.address}")
        print(f"   Port: {healthcare_agent.port}")
        return True
    except Exception as e:
        print(f"Healthcare Agent failed: {e}")
        return False

def test_financial_agent():
    """Test financial agent import and basic functionality"""
    try:
        from agents.financial_agent.main import financial_agent
        print(f"Financial Agent loaded successfully")
        print(f"   Name: {financial_agent.name}")
        print(f"   Address: {financial_agent.address}")
        print(f"   Port: {financial_agent.port}")
        return True
    except Exception as e:
        print(f"Financial Agent failed: {e}")
        return False

def test_logistics_agent():
    """Test logistics agent import and basic functionality"""
    try:
        from agents.logistics_agent.main import logistics_agent
        print(f"Logistics Agent loaded successfully")
        print(f"   Name: {logistics_agent.name}")
        print(f"   Address: {logistics_agent.address}")
        print(f"   Port: {logistics_agent.port}")
        return True
    except Exception as e:
        print(f"Logistics Agent failed: {e}")
        return False

def test_metta_integration():
    """Test MeTTa knowledge graph integration"""
    try:
        from knowledge.metta_kg.integration import MeTTaKnowledgeGraph
        kg = MeTTaKnowledgeGraph()
        result = kg.query("test query")
        print(f"MeTTa Knowledge Graph integration working")
        print(f"   Query result status: {result.get('status', 'unknown')}")
        return True
    except Exception as e:
        print(f"MeTTa integration failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing ASI Alliance Agents")
    print("=" * 50)
    
    tests = [
        ("Healthcare Agent", test_healthcare_agent),
        ("Financial Agent", test_financial_agent),
        ("Logistics Agent", test_logistics_agent),
        ("MeTTa Integration", test_metta_integration),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\nTesting {test_name}...")
        result = test_func()
        results.append(result)
    
    print("\n" + "=" * 50)
    print("Test Results Summary:")
    passed = sum(results)
    total = len(results)
    
    for i, (test_name, _) in enumerate(tests):
        status = "PASS" if results[i] else "FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("All agents are ready for ASI Alliance deployment!")
        return True
    else:
        print("Some issues need to be resolved before deployment.")
        return False

if __name__ == "__main__":
    main()
