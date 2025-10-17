import { createMocks } from 'node-mocks-http'
import handler from '../discover-agents'

describe('/api/discover-agents', () => {
  it('should return agents data', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const data = JSON.parse(res._getData())
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(3)
    
    // Check agent structure
    const agent = data[0]
    expect(agent).toHaveProperty('id')
    expect(agent).toHaveProperty('name')
    expect(agent).toHaveProperty('address')
    expect(agent).toHaveProperty('status')
    expect(agent).toHaveProperty('capabilities')
    expect(agent).toHaveProperty('lastSeen')
    expect(agent).toHaveProperty('description')
    
    // Check specific agents
    const agentNames = data.map(agent => agent.name)
    expect(agentNames).toContain('Healthcare Assistant')
    expect(agentNames).toContain('Logistics Coordinator')
    expect(agentNames).toContain('Financial Advisor')
  })

  it('should return correct agent addresses', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    const healthcareAgent = data.find(agent => agent.id === 'healthcare-agent')
    expect(healthcareAgent.address).toBe('agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl')
    
    const logisticsAgent = data.find(agent => agent.id === 'logistics-agent')
    expect(logisticsAgent.address).toBe('agent1qve8agrlc8yjqa3wqrz7cehwr2eh06yq4339afd0hhd0ec4g7vwyv5pw40u')
    
    const financialAgent = data.find(agent => agent.id === 'financial-agent')
    expect(financialAgent.address).toBe('agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g')
  })

  it('should return correct capabilities for each agent', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    const healthcareAgent = data.find(agent => agent.id === 'healthcare-agent')
    expect(healthcareAgent.capabilities).toContain('Medical Analysis')
    expect(healthcareAgent.capabilities).toContain('Symptom Checker')
    expect(healthcareAgent.capabilities).toContain('Treatment Planning')
    expect(healthcareAgent.capabilities).toContain('Drug Interaction Check')
    
    const logisticsAgent = data.find(agent => agent.id === 'logistics-agent')
    expect(logisticsAgent.capabilities).toContain('Route Optimization')
    expect(logisticsAgent.capabilities).toContain('Inventory Management')
    expect(logisticsAgent.capabilities).toContain('Delivery Tracking')
    expect(logisticsAgent.capabilities).toContain('Supply Chain Analysis')
    
    const financialAgent = data.find(agent => agent.id === 'financial-agent')
    expect(financialAgent.capabilities).toContain('Portfolio Management')
    expect(financialAgent.capabilities).toContain('Risk Assessment')
    expect(financialAgent.capabilities).toContain('DeFi Integration')
    expect(financialAgent.capabilities).toContain('Market Analysis')
  })

  it('should return active status for all agents', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    data.forEach(agent => {
      expect(agent.status).toBe('active')
    })
  })

  it('should return valid lastSeen dates', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    data.forEach(agent => {
      expect(agent.lastSeen).toBeDefined()
      expect(new Date(agent.lastSeen)).toBeInstanceOf(Date)
      expect(new Date(agent.lastSeen).getTime()).not.toBeNaN()
    })
  })

  it('should return proper descriptions', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    const healthcareAgent = data.find(agent => agent.id === 'healthcare-agent')
    expect(healthcareAgent.description).toBe('AI-powered medical diagnosis and treatment recommendations with MeTTa Knowledge Graph integration')
    
    const logisticsAgent = data.find(agent => agent.id === 'logistics-agent')
    expect(logisticsAgent.description).toBe('Supply chain optimization and delivery management')
    
    const financialAgent = data.find(agent => agent.id === 'financial-agent')
    expect(financialAgent.description).toBe('DeFi protocol integration and investment strategies')
  })

  it('should handle POST method', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
  })

  it('should return JSON content type', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getHeaders()['content-type']).toBe('application/json')
  })

  it('should simulate delay in agent discovery', async () => {
    const startTime = Date.now()
    
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Should have some delay (at least 100ms as per the simulation)
    expect(duration).toBeGreaterThanOrEqual(100)
  })
})
