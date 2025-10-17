#!/usr/bin/env python3
"""
ASI Autonomous Agents Runner
This script starts all the agents and the Flask backend server
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

class AgentRunner:
    def __init__(self):
        self.processes = []
        self.running = True
        
    def start_agent(self, agent_name: str, port: int):
        """Start a specific agent"""
        agent_dir = backend_dir / "agents" / agent_name
        if not agent_dir.exists():
            print(f"Agent directory not found: {agent_dir}")
            return None
            
        main_file = agent_dir / "main.py"
        if not main_file.exists():
            print(f"Main file not found: {main_file}")
            return None
            
        try:
            print(f"Starting {agent_name} on port {port}...")
            process = subprocess.Popen(
                [sys.executable, str(main_file)],
                cwd=str(agent_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            self.processes.append((agent_name, process))
            print(f"✓ {agent_name} started with PID {process.pid}")
            return process
        except Exception as e:
            print(f"✗ Failed to start {agent_name}: {e}")
            return None
    
    def start_flask_app(self):
        """Start the Flask application"""
        try:
            print("Starting Flask application...")
            process = subprocess.Popen(
                [sys.executable, "app.py"],
                cwd=str(backend_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            self.processes.append(("Flask App", process))
            print(f"✓ Flask app started with PID {process.pid}")
            return process
        except Exception as e:
            print(f"✗ Failed to start Flask app: {e}")
            return None
    
    def monitor_processes(self):
        """Monitor running processes"""
        while self.running:
            for name, process in self.processes[:]:
                if process.poll() is not None:
                    print(f"WARNING: {name} process ended unexpectedly")
                    self.processes.remove((name, process))
            time.sleep(1)
    
    def stop_all(self):
        """Stop all running processes"""
        print("\nShutting down all processes...")
        self.running = False
        
        for name, process in self.processes:
            try:
                print(f"Stopping {name}...")
                process.terminate()
                process.wait(timeout=5)
                print(f"✓ {name} stopped")
            except subprocess.TimeoutExpired:
                print(f"Force killing {name}...")
                process.kill()
                print(f"✓ {name} force killed")
            except Exception as e:
                print(f"✗ Error stopping {name}: {e}")
        
        self.processes.clear()
        print("All processes stopped.")
    
    def run(self):
        """Run all agents and the Flask app"""
        print("ASI Autonomous Agents Platform")
        print("=" * 40)
        
        # Define agents to start
        agents = [
            ("healthcare_agent", 8001),
            ("logistics_agent", 8002),
            ("financial_agent", 8003),
        ]
        
        # Start agents
        for agent_name, port in agents:
            self.start_agent(agent_name, port)
            time.sleep(2)  # Give each agent time to start
        
        # Start Flask app
        self.start_flask_app()
        
        # Start monitoring thread
        monitor_thread = threading.Thread(target=self.monitor_processes)
        monitor_thread.daemon = True
        monitor_thread.start()
        
        print("\n" + "=" * 40)
        print("All services started successfully!")
        print("Available services:")
        print("- Healthcare Agent: http://localhost:8001")
        print("- Logistics Agent: http://localhost:8002")
        print("- Financial Agent: http://localhost:8003")
        print("- Flask API: http://localhost:5000")
        print("- Frontend: http://localhost:3000")
        print("\nPress Ctrl+C to stop all services")
        print("=" * 40)
        
        try:
            # Keep the main thread alive
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nReceived interrupt signal...")
        finally:
            self.stop_all()

def signal_handler(signum, frame):
    """Handle interrupt signals"""
    print(f"\nReceived signal {signum}")
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Check if we're in the right directory
    if not (backend_dir / "agents").exists():
        print("Error: Please run this script from the backend directory")
        sys.exit(1)
    
    # Create and run the agent runner
    runner = AgentRunner()
    runner.run()
