import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AgentGrid from '../AgentGrid'

// Mock the AgentContext
const mockUseAgent = jest.fn()
jest.mock('../../contexts/AgentContext', () => ({
  useAgent: () => mockUseAgent(),
}))

// Default mock implementation
const defaultMockReturn = {
    agents: [
      {
        id: 'healthcare-agent',
        name: 'Healthcare Assistant',
        address: 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
        status: 'active',
        capabilities: ['Medical Analysis', 'Symptom Checker', 'Treatment Planning', 'Drug Interaction Check'],
        lastSeen: new Date('2024-01-01'),
        description: 'AI-powered medical diagnosis and treatment recommendations',
      },
      {
        id: 'logistics-agent',
        name: 'Logistics Coordinator',
        address: 'agent1qve8agrlc8yjqa3wqrz7cehwr2eh06yq4339afd0hhd0ec4g7vwyv5pw40u',
        status: 'active',
        capabilities: ['Route Optimization', 'Inventory Management', 'Delivery Tracking', 'Supply Chain Analysis'],
        lastSeen: new Date('2024-01-01'),
        description: 'Supply chain optimization and delivery management',
      },
      {
        id: 'financial-agent',
        name: 'Financial Advisor',
        address: 'agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g',
        status: 'active',
        capabilities: ['Portfolio Management', 'Risk Assessment', 'DeFi Integration', 'Market Analysis'],
        lastSeen: new Date('2024-01-01'),
        description: 'DeFi protocol integration and investment strategies',
      },
    ],
    isDiscovering: false,
    connectAgent: jest.fn(),
    disconnectAgent: jest.fn(),
    selectedAgent: null,
    isConnected: false,
    discoverAgents: jest.fn(),
}

// Set default mock return value
mockUseAgent.mockReturnValue(defaultMockReturn)

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, whileInView, initial, transition, viewport, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, whileHover, whileTap, whileInView, initial, transition, viewport, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, whileHover, whileTap, whileInView, initial, transition, viewport, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <div>{children}</div>,
}))

describe('AgentGrid', () => {
  beforeEach(() => {
    // Reset mock to default implementation before each test
    mockUseAgent.mockReturnValue(defaultMockReturn)
  })

  it('should render the component title', () => {
    render(<AgentGrid />)
    expect(screen.getByText('Autonomous Agents')).toBeInTheDocument()
  })

  it('should render all agents', () => {
    render(<AgentGrid />)
    
    expect(screen.getByText('Healthcare Assistant')).toBeInTheDocument()
    expect(screen.getByText('Logistics Coordinator')).toBeInTheDocument()
    expect(screen.getByText('Financial Advisor')).toBeInTheDocument()
  })

  it('should display agent descriptions', () => {
    render(<AgentGrid />)
    
    expect(screen.getByText('AI-powered medical diagnosis and treatment recommendations')).toBeInTheDocument()
    expect(screen.getByText('Supply chain optimization and delivery management')).toBeInTheDocument()
    expect(screen.getByText('DeFi protocol integration and investment strategies')).toBeInTheDocument()
  })

  it('should display agent capabilities', () => {
    render(<AgentGrid />)
    
    expect(screen.getByText('Medical Analysis')).toBeInTheDocument()
    expect(screen.getByText('Symptom Checker')).toBeInTheDocument()
    expect(screen.getByText('Route Optimization')).toBeInTheDocument()
    expect(screen.getByText('Portfolio Management')).toBeInTheDocument()
  })

  it('should show agent status', () => {
    render(<AgentGrid />)
    
    const statusElements = screen.getAllByText('active')
    expect(statusElements).toHaveLength(3) // One for each agent
  })

  it('should display agent addresses', () => {
    render(<AgentGrid />)
    
    // Check that address elements exist (they may be split across text nodes)
    const addressElements = screen.getAllByText(/agent1q/)
    expect(addressElements.length).toBeGreaterThan(0)
  })

  it('should have connect buttons for each agent', () => {
    render(<AgentGrid />)
    
    const connectButtons = screen.getAllByText('Connect')
    expect(connectButtons).toHaveLength(3)
  })

  it('should call connectAgent when connect button is clicked', async () => {
    const mockConnectAgent = jest.fn()
    
    // Override the mock for this test
    mockUseAgent.mockReturnValue({
      ...defaultMockReturn,
      agents: [
        {
          id: 'healthcare-agent',
          name: 'Healthcare Assistant',
          address: 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
          status: 'active',
          capabilities: ['Medical Analysis'],
          lastSeen: new Date(),
          description: 'Test agent',
        },
      ],
      connectAgent: mockConnectAgent,
    })

    render(<AgentGrid />)
    
    const connectButton = screen.getByText('Connect')
    await userEvent.click(connectButton)
    
    expect(mockConnectAgent).toHaveBeenCalled()
  })

  it('should handle empty agents list', () => {
    // Override mock for empty agents
    mockUseAgent.mockReturnValue({
      ...defaultMockReturn,
      agents: [],
    })

    render(<AgentGrid />)
    
    expect(screen.getByText('Autonomous Agents')).toBeInTheDocument()
    expect(screen.queryAllByText('Connect')).toHaveLength(0)
  })

  it('should show loading state', () => {
    // Override mock for loading state
    mockUseAgent.mockReturnValue({
      ...defaultMockReturn,
      agents: [],
      isDiscovering: true,
    })

    render(<AgentGrid />)
    
    expect(screen.getByText('Autonomous Agents')).toBeInTheDocument()
  })

  it('should display connected agent state', () => {
    // Override mock for connected state
    mockUseAgent.mockReturnValue({
      ...defaultMockReturn,
      agents: [
        {
          id: 'healthcare-agent',
          name: 'Healthcare Assistant',
          address: 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
          status: 'active',
          capabilities: ['Medical Analysis'],
          lastSeen: new Date(),
          description: 'Test agent',
        },
      ],
      selectedAgent: {
        id: 'healthcare-agent',
        name: 'Healthcare Assistant',
        address: 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
        status: 'active',
        capabilities: ['Medical Analysis'],
        lastSeen: new Date(),
        description: 'Test agent',
      },
      isConnected: true,
    })

    render(<AgentGrid />)
    
    // Should show "Connected" for the connected agent
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })
})
