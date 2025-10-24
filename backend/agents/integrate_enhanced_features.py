#!/usr/bin/env python3
"""
Integration script to enable enhanced features in existing agents
This script updates the existing agent files to use enhanced ASI:One and MeTTa integrations
"""

import os
import shutil
from pathlib import Path

def integrate_enhanced_features():
    """Integrate enhanced features into existing agents"""
    
    agents_dir = Path(__file__).parent
    
    print("🚀 Integrating Enhanced Features into ASI Autonomous Agents")
    print("=" * 60)
    
    # List of agents to enhance
    agents = ["healthcare_agent", "financial_agent", "logistics_agent"]
    
    for agent_name in agents:
        print(f"\n📋 Processing {agent_name}...")
        
        agent_dir = agents_dir / agent_name
        
        # Check if enhanced files exist
        enhanced_main = agent_dir / "enhanced_main.py"
        asi_one_file = agent_dir / "asi_one_integration.py"
        enhanced_metta = agent_dir / "enhanced_metta.py"
        
        if enhanced_main.exists() and asi_one_file.exists() and enhanced_metta.exists():
            # Backup original main.py
            original_main = agent_dir / "main.py"
            backup_main = agent_dir / "main_backup.py"
            
            if original_main.exists():
                shutil.copy2(original_main, backup_main)
                print(f"  ✅ Backed up original main.py to main_backup.py")
            
            # Replace main.py with enhanced version
            shutil.copy2(enhanced_main, original_main)
            print(f"  ✅ Updated {agent_name} with enhanced features")
            
            # Check requirements
            requirements_enhanced = agent_dir / "requirements_enhanced.txt"
            if requirements_enhanced.exists():
                print(f"  ✅ Enhanced requirements available: requirements_enhanced.txt")
            
        else:
            print(f"  ❌ Enhanced files not found for {agent_name}")
    
    print(f"\n🎯 Integration Summary:")
    print(f"  - Enhanced ASI:One API integration")
    print(f"  - Advanced MeTTa Knowledge Graph with space-based architecture")
    print(f"  - Complete Chat Protocol implementation")
    print(f"  - Agent-to-Agent communication capabilities")
    print(f"  - Dynamic learning system")
    print(f"  - Proper Agentverse registration")
    
    print(f"\n📝 Next Steps:")
    print(f"  1. Set up ASI:One API key in .env file")
    print(f"  2. Install enhanced requirements: pip install -r requirements_enhanced.txt")
    print(f"  3. Start agents with: python main.py")
    print(f"  4. Test enhanced features")
    
    print(f"\n🔧 Environment Setup:")
    print(f"  Copy env_template.txt to .env and add your API keys:")
    print(f"  ASI_ONE_API_KEY=your_asi_one_api_key_here")
    print(f"  OPENAI_API_KEY=your_openai_api_key_here")
    print(f"  ANTHROPIC_API_KEY=your_anthropic_api_key_here")

if __name__ == "__main__":
    integrate_enhanced_features()
