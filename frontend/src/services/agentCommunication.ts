// Direct Agent Communication Service
// This service connects directly to uAgents using HTTP

interface AgentMessage {
  timestamp: string
  msg_id: string
  content: Array<{
    type: string
    text?: string
  }>
}

interface AgentResponse {
  timestamp: string
  acknowledged_msg_id?: string
  content?: Array<{
    type: string
    text?: string
  }>
}

class DirectAgentService {
  private agentConnections: Map<string, boolean> = new Map()
  private agentPorts: Map<string, number> = new Map()
  private agentUrls: Map<string, string> = new Map()

  constructor() {
    // Map agent IDs to their ports (HTTP endpoints) - Updated for Render-optimized agents
    this.agentPorts.set('fetch-healthcare-001', 8001)  // Render-optimized Healthcare Agent
    this.agentPorts.set('fetch-logistics-002', 8002)    // Render-optimized Logistics Agent  
    this.agentPorts.set('fetch-finance-003', 8003)     // Render-optimized Financial Agent
    this.agentPorts.set('fetch-education-004', 8004)
    this.agentPorts.set('fetch-system-005', 8005)
    this.agentPorts.set('fetch-research-006', 8006)
    
    // Map agent names to their IDs for easier lookup - Updated for Render deployment
    this.agentPorts.set('healthcare-agent', 8001)  // Render-optimized Healthcare Agent
    this.agentPorts.set('logistics-agent', 8002)   // Render-optimized Logistics Agent
    this.agentPorts.set('financial-agent', 8003)   // Render-optimized Financial Agent
    this.agentPorts.set('education-agent', 8004)
    this.agentPorts.set('system-agent', 8005)
    this.agentPorts.set('research-agent', 8006)

    // Map agent IDs to Render URLs for production deployment
    this.agentUrls.set('healthcare-agent', process.env.NEXT_PUBLIC_HEALTHCARE_AGENT_URL || 'http://localhost:8001')
    this.agentUrls.set('logistics-agent', process.env.NEXT_PUBLIC_LOGISTICS_AGENT_URL || 'http://localhost:8002')
    this.agentUrls.set('financial-agent', process.env.NEXT_PUBLIC_FINANCIAL_AGENT_URL || 'http://localhost:8003')
  }

  async connectToAgent(agentId: string): Promise<boolean> {
    try {
      // Check if already connected
      if (this.agentConnections.has(agentId)) {
        console.log(`Already connected to agent: ${agentId}`)
        return true
      }

      console.log(`Connecting to Render-optimized agent ${agentId} via backend API`)
      
      // For Render-optimized agents, we connect through the backend API
      // The agents are running as pure uAgents with mailbox enabled
      const response = await fetch('/api/coordinator/agents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const agents = await response.json()
        const agent = agents.find((a: any) => a.id === agentId || a.name.toLowerCase().includes(agentId.toLowerCase()))
        
        if (agent) {
          console.log(`✅ Successfully connected to agent ${agentId} via backend API`)
          this.agentConnections.set(agentId, true)
          return true
        } else {
          console.error(`Agent ${agentId} not found in backend registry`)
          return false
        }
      } else {
        console.error(`Backend API error: ${response.status}`)
        return false
      }
    } catch (error) {
      console.error(`Failed to connect to agent ${agentId}:`, error)
      return false
    }
  }

  async sendMessage(agentId: string, message: string): Promise<string> {
    try {
      console.log(`Sending message to Render-optimized agent ${agentId} via backend API`)
      
      // For Render-optimized agents, send messages through the backend API
      // The backend will route messages to the appropriate agent via Agentverse
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          agentType: agentId,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response || data.message || 'Agent responded successfully'
      } else {
        console.error(`Backend API error for agent ${agentId}: ${response.status}`)
        throw new Error(`Backend API error: ${response.status}`)
      }
    } catch (error) {
      console.error(`Error sending message to agent ${agentId}:`, error)
      throw error
    }
  }

  async disconnectFromAgent(agentId: string): Promise<void> {
    try {
      if (this.agentConnections.has(agentId)) {
        console.log(`Disconnecting from agent ${agentId}`)
        this.agentConnections.delete(agentId)
      }
    } catch (error) {
      console.error(`Error disconnecting from agent ${agentId}:`, error)
    }
  }

  async disconnectFromAllAgents(): Promise<void> {
    console.log('Disconnecting from all agents')
    const disconnectPromises = Array.from(this.agentConnections.keys()).map(agentId => 
      this.disconnectFromAgent(agentId)
    )
    await Promise.all(disconnectPromises)
  }

  isConnectedToAgent(agentId: string): boolean {
    return this.agentConnections.has(agentId)
  }

  getConnectedAgents(): string[] {
    return Array.from(this.agentConnections.keys()).filter(agentId => 
      this.agentConnections.get(agentId)
    )
  }

  private generateMessageId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Fallback method for when direct connection fails
  async sendMessageViaBackend(agentId: string, message: string): Promise<string> {
    try {
      console.log(`Sending message via backend to agent ${agentId}`)
      
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          agentType: agentId
        })
      })

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`)
      }

      const data = await response.json()
      return data.response || 'No response received'

    } catch (error) {
      console.error('Error sending message via backend:', error)
      throw error
    }
  }
}

export default DirectAgentService

// Export convenience functions for backward compatibility
export const sendMessageToAgent = async (agentId: string, message: string) => {
  try {
    const response = await fetch('/api/generate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        prompt: message
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error sending message to agent:', error)
    throw error
  }
}

export const discoverAgents = async () => {
  try {
    const response = await fetch('/api/discover-agents')
    if (!response.ok) {
      throw new Error(`Failed to discover agents: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error discovering agents:', error)
    throw error
  }
}
