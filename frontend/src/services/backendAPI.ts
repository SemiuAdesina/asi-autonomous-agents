// API Service for Backend Integration
// Handles all API calls to the backend endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Type definitions for API responses
interface Agent {
  id: string
  name: string
  address: string
  status: 'active' | 'inactive' | 'pending'
  capabilities: string[]
  description: string
  registeredAt: string
  lastSeen: string
}

interface AgentConfig {
  id: string
  name: string
  address: string
  port: number
  status: 'running' | 'stopped' | 'error'
  capabilities: string[]
  routingRules: Array<{
    id: string
    condition: string
    targetAgent: string
    priority: number
    enabled: boolean
  }>
  healthScore: number
  lastPing: string
}

interface CommunicationFlow {
  id: string
  fromAgent: string
  toAgent: string
  messageType: string
  frequency: number
  lastActivity: string
}

interface AgentCommunication {
  id: string
  agents: string[]
  messages: Array<{
    id: string
    fromAgent: string
    toAgent: string
    message: string
    timestamp: string
    type: 'forward' | 'response' | 'initiate'
  }>
  status: 'active' | 'completed' | 'pending'
  createdAt: string
}

interface LearningMetric {
  agentId: string
  agentName: string
  interactions: number
  knowledgeUpdates: number
  accuracy: number
  learningRate: number
  lastUpdate: string
}

interface KnowledgeUpdate {
  id: string
  agentId: string
  category: string
  concept: string
  confidence: number
  source: string
  timestamp: string
}

interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  accuracy: number
  lastSeen: string
}

interface APIResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
  error?: string
}

interface RegisterAgentResponse {
  status: 'success'
  agent: Agent
}

interface ToggleLearningResponse {
  status: 'success'
  isActive: boolean
}

class BackendAPIService {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Multi-Agent Communication APIs
  async getCommunications(): Promise<AgentCommunication[]> {
    return this.request<AgentCommunication[]>('/api/multi-agent/communications')
  }

  async startMonitoring(): Promise<APIResponse<null>> {
    return this.request<APIResponse<null>>('/api/multi-agent/start-monitoring', { method: 'POST' })
  }

  async stopMonitoring(): Promise<APIResponse<null>> {
    return this.request<APIResponse<null>>('/api/multi-agent/stop-monitoring', { method: 'POST' })
  }

  // Agentverse Registry APIs
  async getAgentverseAgents(): Promise<Agent[]> {
    return this.request<Agent[]>('/api/agentverse/agents')
  }

  async registerAgent(agentData: {
    name: string
    description: string
    capabilities: string[]
  }): Promise<RegisterAgentResponse> {
    return this.request<RegisterAgentResponse>('/api/agentverse/register', {
      method: 'POST',
      body: JSON.stringify(agentData),
    })
  }

  async updateAgentStatus(agentId: string, status: 'active' | 'inactive'): Promise<APIResponse<null>> {
    return this.request<APIResponse<null>>(`/api/agentverse/agents/${agentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async deleteAgent(agentId: string): Promise<APIResponse<null>> {
    return this.request<APIResponse<null>>(`/api/agentverse/agents/${agentId}`, {
      method: 'DELETE',
    })
  }

  // Agent Coordinator APIs
  async getCoordinatorAgents(): Promise<AgentConfig[]> {
    return this.request<AgentConfig[]>('/api/coordinator/agents')
  }

  async startAgent(agentId: string): Promise<APIResponse<null>> {
    return this.request<APIResponse<null>>(`/api/coordinator/agents/${agentId}/start`, {
      method: 'POST',
    })
  }

  async stopAgent(agentId: string): Promise<APIResponse<null>> {
    return this.request<APIResponse<null>>(`/api/coordinator/agents/${agentId}/stop`, {
      method: 'POST',
    })
  }

  async getCommunicationFlows(): Promise<CommunicationFlow[]> {
    return this.request<CommunicationFlow[]>('/api/coordinator/flows')
  }

  // Learning Analytics APIs
  async getLearningMetrics(): Promise<LearningMetric[]> {
    return this.request<LearningMetric[]>('/api/learning/metrics')
  }

  async getKnowledgeUpdates(agentId?: string): Promise<KnowledgeUpdate[]> {
    const params = agentId ? `?agent_id=${agentId}` : ''
    return this.request<KnowledgeUpdate[]>(`/api/learning/knowledge-updates${params}`)
  }

  async getLearningPatterns(agentId?: string): Promise<LearningPattern[]> {
    const params = agentId ? `?agent_id=${agentId}` : ''
    return this.request<LearningPattern[]>(`/api/learning/patterns${params}`)
  }

  async toggleLearning(isActive: boolean): Promise<ToggleLearningResponse> {
    return this.request<ToggleLearningResponse>('/api/learning/toggle', {
      method: 'POST',
      body: JSON.stringify({ isActive }),
    })
  }

  // Health check
  async healthCheck(): Promise<APIResponse<null>> {
    return this.request<APIResponse<null>>('/api/health')
  }
}

export const backendAPI = new BackendAPIService()
export default backendAPI
