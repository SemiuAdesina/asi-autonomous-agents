// API service for new backend features
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

class APIService {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Multi-signature wallet endpoints
  async createMultisigWallet(data: {
    chain: string
    owners: string[]
    threshold: number
    wallet_name?: string
  }) {
    return this.request('/api/multisig/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createMultisigTransaction(data: {
    multisig_address: string
    to_address: string
    value: string
    data?: string
    chain?: string
  }) {
    return this.request('/api/multisig/transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async approveTransaction(transactionId: string, data: {
    approver_address: string
    signature?: string
  }) {
    return this.request(`/api/multisig/transaction/${transactionId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async rejectTransaction(transactionId: string, data: {
    rejector_address: string
    reason?: string
  }) {
    return this.request(`/api/multisig/transaction/${transactionId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getWalletStatus(multisigAddress: string, chain?: string) {
    const params = chain ? `?chain=${chain}` : ''
    return this.request(`/api/multisig/wallet/${multisigAddress}/status${params}`)
  }

  async getTransactionHistory(multisigAddress: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    return this.request(`/api/multisig/wallet/${multisigAddress}/history${params}`)
  }

  async addOwner(multisigAddress: string, data: {
    new_owner: string
    chain?: string
  }) {
    return this.request(`/api/multisig/wallet/${multisigAddress}/add-owner`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async removeOwner(multisigAddress: string, data: {
    owner_to_remove: string
    chain?: string
  }) {
    return this.request(`/api/multisig/wallet/${multisigAddress}/remove-owner`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async changeThreshold(multisigAddress: string, data: {
    new_threshold: number
    chain?: string
  }) {
    return this.request(`/api/multisig/wallet/${multisigAddress}/change-threshold`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getSupportedChains() {
    return this.request('/api/multisig/supported-chains')
  }

  // Smart contract audit endpoints
  async auditContract(data: {
    contract_code: string
    language: string
    contract_name?: string
  }) {
    return this.request('/api/audit/contract', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async validateContractCode(data: {
    contract_code: string
    language: string
  }) {
    return this.request('/api/audit/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getAuditTemplates() {
    return this.request('/api/audit/templates')
  }

  async getCommonVulnerabilities() {
    return this.request('/api/audit/vulnerabilities')
  }

  async getAuditVulnerabilities() {
    return this.request('/api/audit/vulnerabilities')
  }

  async getBestPractices() {
    return this.request('/api/audit/best-practices')
  }

  async getAuditTools() {
    return this.request('/api/audit/tools')
  }

  async getAuditHistory() {
    return this.request('/api/audit/history')
  }

  // Health and monitoring endpoints
  async getHealthStatus() {
    return this.request('/api/health')
  }

  async getMetrics() {
    return this.request('/api/health/metrics')
  }

  async getReadinessCheck() {
    return this.request('/api/health/ready')
  }

  // Authentication endpoints
  async login(data: { username: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async register(data: {
    username: string
    email: string
    password: string
    wallet_address?: string
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async refreshToken() {
    return this.request('/api/auth/refresh', {
      method: 'POST',
    })
  }

  // Agent endpoints
  async getAgents() {
    return this.request('/api/agents')
  }

  async getAgent(agentId: string) {
    return this.request(`/api/agents/${agentId}`)
  }

  async createAgent(data: {
    name: string
    address: string
    description: string
    agent_type: string
  }) {
    return this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAgent(agentId: string, data: any) {
    return this.request(`/api/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAgent(agentId: string) {
    return this.request(`/api/agents/${agentId}`, {
      method: 'DELETE',
    })
  }

  // Message endpoints
  async getMessages(agentId?: string) {
    const params = agentId ? `?agent_id=${agentId}` : ''
    return this.request(`/api/messages${params}`)
  }

  async sendMessage(data: {
    content: string
    agent_id: string | number
    message_type?: string
    metadata?: any
  }) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Knowledge graph endpoints
  async queryKnowledge(query: string) {
    return this.request(`/api/knowledge/query?q=${encodeURIComponent(query)}`)
  }

  async addKnowledgeConcept(data: {
    concept: string
    definition?: string
    domain?: string
    confidence_score?: number
    relationships?: any
  }) {
    return this.request('/api/knowledge/concept', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getKnowledgeConcepts(page?: number, perPage?: number, domain?: string) {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    if (domain) params.append('domain', domain)
    return this.request(`/api/knowledge/concepts?${params.toString()}`)
  }

  async updateKnowledgeConcept(conceptId: string, data: any) {
    return this.request(`/api/knowledge/concept/${conceptId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteKnowledgeConcept(conceptId: string) {
    return this.request(`/api/knowledge/concept/${conceptId}`, {
      method: 'DELETE',
    })
  }

  async getConcept(conceptName: string) {
    return this.request(`/api/knowledge/concept/${encodeURIComponent(conceptName)}`)
  }

  async searchKnowledge(query: string, limit?: number) {
    const params = new URLSearchParams()
    params.append('q', query)
    if (limit) params.append('limit', limit.toString())
    return this.request(`/api/knowledge/search?${params.toString()}`)
  }

  async createKnowledgeRelationship(data: {
    from_concept: string
    to_concept: string
    relationship_type: string
    properties?: any
  }) {
    return this.request('/api/knowledge/relationships', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Agent session endpoints
  async createSession(data: {
    agent_id: number
    metadata?: any
  }) {
    return this.request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getSessions(page?: number, perPage?: number, status?: string, agentId?: number) {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    if (status) params.append('status', status)
    if (agentId) params.append('agent_id', agentId.toString())
    return this.request(`/api/sessions?${params.toString()}`)
  }

  async getSession(sessionId: string) {
    return this.request(`/api/sessions/${sessionId}`)
  }

  async updateSession(sessionId: string, data: {
    status?: string
    agent_metadata?: any
  }) {
    return this.request(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSession(sessionId: string) {
    return this.request(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  }

  async getActiveSessions() {
    return this.request('/api/sessions/active')
  }

  // Transaction endpoints
  async createTransaction(data: {
    agent_id: number
    transaction_hash: string
    transaction_type: string
    status?: string
    gas_used?: number
    gas_price?: number
    block_number?: number
    metadata?: any
  }) {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTransactions(page?: number, perPage?: number, status?: string, agentId?: number, transactionType?: string) {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    if (status) params.append('status', status)
    if (agentId) params.append('agent_id', agentId.toString())
    if (transactionType) params.append('transaction_type', transactionType)
    return this.request(`/api/transactions?${params.toString()}`)
  }

  async getTransaction(transactionId: string) {
    return this.request(`/api/transactions/${transactionId}`)
  }

  async updateTransaction(transactionId: string, data: {
    status?: string
    gas_used?: number
    gas_price?: number
    block_number?: number
    agent_metadata?: any
  }) {
    return this.request(`/api/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getAgentTransactions(agentId: string, page?: number, perPage?: number, status?: string) {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    if (status) params.append('status', status)
    return this.request(`/api/transactions/agent/${agentId}?${params.toString()}`)
  }

  async getTransactionStats() {
    return this.request('/api/transactions/stats')
  }
}

// Create singleton instance
const apiService = new APIService()

export default apiService
