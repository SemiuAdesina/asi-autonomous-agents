import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Call the backend API to get real agent data
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    const response = await fetch(`${backendUrl}/api/coordinator/agents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }
    
    const agents = await response.json()
    res.status(200).json(agents)
  } catch (error) {
    console.error('Agent coordinator error:', error)
    // Fallback to mock data if backend is not available
    const mockAgents = [
      {
        id: 'healthcare-agent',
        name: 'Healthcare Assistant',
        address: 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
        status: 'active',
        capabilities: ['Medical Analysis', 'Symptom Checker', 'Treatment Planning', 'Drug Interaction Check', 'MeTTa Knowledge Graph', 'ASI:One Integration', 'Chat Protocol', 'Render-Optimized'],
        lastSeen: new Date(),
        description: 'AI-powered medical diagnosis with MeTTa Knowledge Graph, ASI:One integration, and Chat Protocol. Render-optimized for production deployment on port 8001.'
      },
      {
        id: 'logistics-agent',
        name: 'Logistics Coordinator',
        address: 'agent1qve8agrlc8yjqa3wqrz7cehwr2eh06yq4339afd0hhd0ec4g7vwyv5pw40u',
        status: 'active',
        capabilities: ['Route Optimization', 'Inventory Management', 'Delivery Tracking', 'Supply Chain Analysis', 'MeTTa Knowledge Graph', 'ASI:One Integration', 'Chat Protocol', 'Render-Optimized'],
        lastSeen: new Date(),
        description: 'Supply chain optimization and delivery management with MeTTa Knowledge Graph, ASI:One integration, and Chat Protocol. Render-optimized for production deployment on port 8002.'
      },
      {
        id: 'financial-agent',
        name: 'Financial Advisor',
        address: 'agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g',
        status: 'active',
        capabilities: ['Portfolio Management', 'Risk Assessment', 'DeFi Integration', 'Market Analysis', 'MeTTa Knowledge Graph', 'ASI:One Integration', 'Chat Protocol', 'Render-Optimized'],
        lastSeen: new Date(),
        description: 'DeFi protocol integration and investment strategies with MeTTa Knowledge Graph, ASI:One integration, and Chat Protocol. Render-optimized for production deployment on port 8003.'
      }
    ]
    res.status(200).json(mockAgents)
  }
}
