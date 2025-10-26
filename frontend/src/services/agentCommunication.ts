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
    // Map agent IDs to Render URLs for production deployment
    // Only the three deployed agents: Healthcare, Financial, and Logistics
    const healthcareUrl = process.env.NEXT_PUBLIC_HEALTHCARE_AGENT_URL || 'https://asi-healthcare-agent1.onrender.com'
    const logisticsUrl = process.env.NEXT_PUBLIC_LOGISTICS_AGENT_URL || 'https://asi-logistics-agent3.onrender.com'
    const financialUrl = process.env.NEXT_PUBLIC_FINANCIAL_AGENT_URL || 'https://asi-financial-agent2.onrender.com'
    
    // Map agent IDs to URLs
    this.agentUrls.set('fetch-healthcare-001', healthcareUrl)
    this.agentUrls.set('fetch-logistics-002', logisticsUrl)
    this.agentUrls.set('fetch-finance-003', financialUrl)
    
    // Map agent names to their IDs for easier lookup
    this.agentUrls.set('healthcare-agent', healthcareUrl)
    this.agentUrls.set('logistics-agent', logisticsUrl)
    this.agentUrls.set('financial-agent', financialUrl)
  }

  async connectToAgent(agentId: string): Promise<boolean> {
    try {
      // Check if already connected
      if (this.agentConnections.has(agentId)) {
        console.log(`Already connected to agent: ${agentId}`)
        return true
      }

      console.log(`Connecting to Render-optimized agent ${agentId} directly`)
      
      // For static export deployment, just mark as connected
      // Actual HTTP connection happens when sending messages
      this.agentConnections.set(agentId, true)
      console.log(`✅ Successfully connected to agent ${agentId}`)
      return true
    } catch (error) {
      console.error(`Failed to connect to agent ${agentId}:`, error)
      return false
    }
  }

  async sendMessage(agentId: string, message: string): Promise<string> {
    try {
      console.log(`📤 Sending message to Render-optimized agent ${agentId}`)
      
      // Get the agent URL
      const agentUrl = this.agentUrls.get(agentId) || this.agentUrls.get(`fetch-${agentId}`)
      
      if (!agentUrl) {
        console.error(`❌ Agent URL not found for ${agentId}`)
        throw new Error(`Agent URL not configured for ${agentId}`)
      }
      
      console.log(`🌐 Calling agent endpoint: ${agentUrl}/chat`)
      
      // Call the agent's HTTP endpoint directly
      const response = await fetch(`${agentUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        console.error(`❌ Agent API error for ${agentId}: ${response.status}`)
        const errorText = await response.text()
        console.error(`Error details: ${errorText}`)
        throw new Error(`Agent API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ Received response from ${agentId}:`, data.response)
      
      return data.response || data.message || 'Agent responded successfully'
    } catch (error) {
      console.error(`❌ Error sending message to agent ${agentId}:`, error)
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
