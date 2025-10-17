// Direct Agent Communication Service
// This service connects directly to uAgents using WebSocket

import { io, Socket } from 'socket.io-client'

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
  private agentSockets: Map<string, Socket> = new Map()
  private agentPorts: Map<string, number> = new Map()

  constructor() {
    // Map agent IDs to their ports
    this.agentPorts.set('fetch-healthcare-001', 8001)
    this.agentPorts.set('fetch-logistics-002', 8002)
    this.agentPorts.set('fetch-finance-003', 8003)
    this.agentPorts.set('fetch-education-004', 8004)
    this.agentPorts.set('fetch-system-005', 8005)
    this.agentPorts.set('fetch-research-006', 8006)
  }

  async connectToAgent(agentId: string): Promise<boolean> {
    try {
      const port = this.agentPorts.get(agentId)
      if (!port) {
        console.error(`No port mapping found for agent: ${agentId}`)
        return false
      }

      // Check if already connected
      if (this.agentSockets.has(agentId)) {
        console.log(`Already connected to agent: ${agentId}`)
        return true
      }

      console.log(`Connecting directly to agent ${agentId} on port ${port}`)
      
      // Create WebSocket connection to the agent
      const socket = io(`http://localhost:${port}`, {
        transports: ['websocket'],
        timeout: 5000,
        forceNew: true
      })

      // Set up event listeners
      socket.on('connect', () => {
        console.log(`Connected to agent ${agentId}`)
      })

      socket.on('disconnect', () => {
        console.log(`Disconnected from agent ${agentId}`)
        this.agentSockets.delete(agentId)
      })

      socket.on('connect_error', (error) => {
        console.error(`Connection error to agent ${agentId}:`, error)
        this.agentSockets.delete(agentId)
      })

      socket.on('message', (data: AgentResponse) => {
        console.log(`Received message from agent ${agentId}:`, data)
      })

      socket.on('acknowledgement', (data: AgentResponse) => {
        console.log(`Received acknowledgement from agent ${agentId}:`, data)
      })

      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 5000)

        socket.on('connect', () => {
          clearTimeout(timeout)
          resolve(true)
        })

        socket.on('connect_error', (error) => {
          clearTimeout(timeout)
          reject(error)
        })
      })

      this.agentSockets.set(agentId, socket)
      return true

    } catch (error) {
      console.error(`Failed to connect to agent ${agentId}:`, error)
      return false
    }
  }

  async sendMessage(agentId: string, message: string): Promise<string> {
    try {
      const socket = this.agentSockets.get(agentId)
      if (!socket) {
        throw new Error(`Not connected to agent: ${agentId}`)
      }

      if (!socket.connected) {
        throw new Error(`Socket not connected for agent: ${agentId}`)
      }

      // Create message in Chat Protocol format
      const agentMessage: AgentMessage = {
        timestamp: new Date().toISOString(),
        msg_id: this.generateMessageId(),
        content: [
          {
            type: 'text',
            text: message
          }
        ]
      }

      console.log(`Sending message to agent ${agentId}:`, agentMessage)

      // Send message and wait for response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Message timeout'))
        }, 10000)

        // Listen for response
        const responseHandler = (data: AgentResponse) => {
          clearTimeout(timeout)
          socket.off('message', responseHandler)
          
          if (data.content && data.content.length > 0) {
            const textContent = data.content.find(c => c.type === 'text')
            if (textContent && textContent.text) {
              resolve(textContent.text)
            } else {
              resolve('Agent responded but no text content found')
            }
          } else {
            resolve('Agent acknowledged message')
          }
        }

        socket.on('message', responseHandler)
        socket.emit('message', agentMessage)
      })

    } catch (error) {
      console.error(`Error sending message to agent ${agentId}:`, error)
      throw error
    }
  }

  async disconnectFromAgent(agentId: string): Promise<void> {
    try {
      const socket = this.agentSockets.get(agentId)
      if (socket) {
        console.log(`Disconnecting from agent ${agentId}`)
        socket.disconnect()
        this.agentSockets.delete(agentId)
      }
    } catch (error) {
      console.error(`Error disconnecting from agent ${agentId}:`, error)
    }
  }

  async disconnectFromAllAgents(): Promise<void> {
    console.log('Disconnecting from all agents')
    const disconnectPromises = Array.from(this.agentSockets.keys()).map(agentId => 
      this.disconnectFromAgent(agentId)
    )
    await Promise.all(disconnectPromises)
  }

  isConnectedToAgent(agentId: string): boolean {
    const socket = this.agentSockets.get(agentId)
    return socket ? socket.connected : false
  }

  getConnectedAgents(): string[] {
    return Array.from(this.agentSockets.keys()).filter(agentId => 
      this.isConnectedToAgent(agentId)
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
