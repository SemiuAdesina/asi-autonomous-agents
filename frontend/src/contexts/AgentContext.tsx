'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-toastify'
import io, { Socket } from 'socket.io-client'
import DirectAgentService from '../services/agentCommunication'

interface Agent {
  id: string
  name: string
  address: string
  status: 'active' | 'inactive' | 'connecting'
  capabilities: string[]
  lastSeen?: Date
  description?: string
}

interface AgentContextType {
  agents: Agent[]
  selectedAgent: Agent | null
  isConnected: boolean
  connectAgent: (agentId: string) => Promise<void>
  disconnectAgent: () => void
  sendMessage: (message: string) => Promise<void>
  messages: Array<{
    id: string
    content: string
    sender: 'user' | 'agent'
    timestamp: Date
  }>
  discoverAgents: () => Promise<void>
  isDiscovering: boolean
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export const useAgent = () => {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}

interface AgentProviderProps {
  children: ReactNode
}

export const AgentProvider = ({ children }: AgentProviderProps) => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isSwitchingAgent, setIsSwitchingAgent] = useState(false)
  
  // Initialize direct agent communication service
  const [agentService] = useState(() => new DirectAgentService())

  const discoverAgents = async () => {
    setIsDiscovering(true)
    try {
      // Simulate fetching agents from Fetch.ai Agentverse registry
      const response = await fetch('/api/discover-agents')
      if (response.ok) {
        const discoveredAgents = await response.json()
        setAgents(discoveredAgents)
      } else {
        // Fallback to demo agents if discovery fails
        setAgents(getDemoAgents())
      }
    } catch (error) {
      console.error('Agent discovery failed:', error)
      // Fallback to demo agents
      setAgents(getDemoAgents())
    } finally {
      setIsDiscovering(false)
    }
  }

  const getDemoAgents = (): Agent[] => [
    {
      id: 'healthcare-agent',
      name: 'Healthcare Assistant',
      address: 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
      status: 'active',
      capabilities: ['Medical Analysis', 'Symptom Checker', 'Treatment Planning', 'Drug Interaction Check'],
      lastSeen: new Date(),
      description: 'AI-powered medical diagnosis and treatment recommendations with MeTTa Knowledge Graph integration'
    },
    {
      id: 'logistics-agent',
      name: 'Logistics Coordinator',
      address: 'agent1qve8agrlc8yjqa3wqrz7cehwr2eh06yq4339afd0hhd0ec4g7vwyv5pw40u',
      status: 'active',
      capabilities: ['Route Optimization', 'Inventory Management', 'Delivery Tracking', 'Supply Chain Analysis'],
      lastSeen: new Date(),
      description: 'Supply chain optimization and delivery management'
    },
    {
      id: 'financial-agent',
      name: 'Financial Advisor',
      address: 'agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g',
      status: 'active',
      capabilities: ['Portfolio Management', 'Risk Assessment', 'DeFi Integration', 'Market Analysis'],
      lastSeen: new Date(),
      description: 'DeFi protocol integration and investment strategies'
    }
  ]

  // Discover agents on component mount
  useEffect(() => {
    discoverAgents()
  }, [])
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Array<{
    id: string
    content: string
    sender: 'user' | 'agent'
    timestamp: Date
  }>>([])

  // Generate intelligent agent responses based on agent type and user message
  const generateAgentResponse = async (agent: Agent, message: string): Promise<string> => {
    const agentPrompts = {
      'healthcare-agent': `You are a Healthcare Assistant AI. Respond to this healthcare-related query: "${message}". Provide helpful, accurate medical information while reminding users to consult healthcare professionals for serious concerns.`,
      'logistics-agent': `You are a Logistics Coordinator AI. Respond to this logistics query: "${message}". Focus on supply chain optimization, route planning, inventory management, and delivery tracking solutions.`,
      'financial-agent': `You are a Financial Advisor AI. Respond to this financial query: "${message}". Provide insights on portfolio management, DeFi protocols, risk assessment, and investment strategies.`
    }

    const prompt = agentPrompts[agent.id as keyof typeof agentPrompts] || 
      `You are an AI assistant. Respond helpfully to this query: "${message}".`

    try {
      // Use OpenAI API or similar service for intelligent responses
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, agentType: agent.name })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response || generateFallbackResponse(agent, message)
      } else {
        return generateFallbackResponse(agent, message)
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      return generateFallbackResponse(agent, message)
    }
  }

  const generateFallbackResponse = (agent: Agent, message: string): string => {
    const responses = {
      'healthcare-agent': [
        `I understand you're asking about "${message}". As a Healthcare Assistant, I can help with medical analysis, symptom checking, and treatment planning. For accurate diagnosis, please consult with a healthcare professional.`,
        `Based on your query "${message}", I recommend consulting with a healthcare professional for accurate diagnosis. I can provide general health guidance and help you understand medical concepts.`,
        `I can analyze symptoms and provide general health guidance. For "${message}", here's what I suggest: maintain a healthy lifestyle, stay hydrated, and consult a doctor if symptoms persist.`
      ],
      'logistics-agent': [
        `I'll help optimize your logistics for "${message}". As a Logistics Coordinator, I specialize in route optimization, inventory management, and delivery tracking. Let me analyze your supply chain needs.`,
        `For your logistics query "${message}", I can analyze supply chain efficiency and suggest improvements. I'll help you reduce costs and improve delivery times.`,
        `I'm processing your logistics request "${message}". Let me check optimal routes and inventory levels. I can help with warehouse management and distribution strategies.`
      ],
      'financial-agent': [
        `I'll analyze your financial query "${message}". As a Financial Advisor, I can help with portfolio management, risk assessment, and DeFi integration. Let me provide investment insights.`,
        `For "${message}", I recommend diversifying your portfolio and considering DeFi protocols for higher yields. I'll help you assess risk and optimize returns.`,
        `I'm evaluating your financial request "${message}". Let me assess risk and suggest investment strategies. I can help with both traditional and DeFi investments.`
      ]
    }
    
    const agentResponses = responses[agent.id as keyof typeof responses] || [
      `I understand your message: "${message}". Let me process that for you and provide detailed assistance.`,
      `Thank you for your input: "${message}". I'm analyzing this information and will provide comprehensive guidance.`,
      `I've received your message: "${message}". Processing your request and preparing detailed recommendations.`
    ]
    
    return agentResponses[Math.floor(Math.random() * agentResponses.length)]
  }

  const connectAgent = async (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId)
      if (!agent) {
        toast.error('Agent not found')
        return
      }

      console.log(`Attempting direct connection to agent: ${agent.name}`)
      
      // Try direct connection first
      const directConnected = await agentService.connectToAgent(agentId)
      
      if (directConnected) {
        console.log(`Direct connection to ${agent.name} successful`)
        setSelectedAgent(agent)
        setIsConnected(true)
        toast.success(`Connected to ${agent.name} (Direct)`)
        return
      }
      
      // Fallback to backend connection
      console.log(`Direct connection failed, trying backend connection`)
      
      // Check if already connected to this agent via backend
      if (isConnected && selectedAgent?.id === agentId) {
        toast.info(`Already connected to ${agent.name}`)
        return
      }

      // Disconnect from current agent if connected to a different one
      if (isConnected && selectedAgent?.id !== agentId) {
        setIsSwitchingAgent(true)
        // Disconnect without showing notifications
        if (socket) {
          socket.disconnect()
          setSocket(null)
        }
        setSelectedAgent(null)
        setIsConnected(false)
        setMessages([])
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Initialize WebSocket connection to backend
      const newSocket = io('http://localhost:5001', {
        transports: ['websocket', 'polling']
      })

      newSocket.on('connect', () => {
        console.log('Connected to backend WebSocket')
        setIsConnected(true)
        setSelectedAgent(agent)
        setIsSwitchingAgent(false) // Reset switching flag after successful connection
        
        // Join agent room
        newSocket.emit('join_agent', { agent_id: agentId })
        
        // Only show connection success notification
        toast.success(`Connected to ${agent.name}`)
        
        // Add welcome message
        setMessages([{
          id: Date.now().toString(),
          content: `Hello! I'm ${agent.name}. How can I assist you today?`,
          sender: 'agent',
          timestamp: new Date()
        }])
      })

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from backend WebSocket:', reason)
        setIsConnected(false)
        // Only show connection lost if we're not switching agents and it's not a manual disconnect
        if (!isSwitchingAgent && reason !== 'io client disconnect') {
          toast.error('Connection lost')
        }
      })

      newSocket.on('agent_response', (data) => {
        console.log('Received agent response:', data)
        const agentMessage = {
          id: Date.now().toString(),
          content: data.message,
          sender: 'agent' as const,
          timestamp: new Date(data.timestamp)
        }
        setMessages(prev => [...prev, agentMessage])
      })

      newSocket.on('status', (data) => {
        console.log('Status update:', data)
        // Don't show toast for status updates to avoid duplicate notifications
        // toast.info(data.message)
      })

      newSocket.on('connect_error', (error) => {
        console.log('WebSocket connection error:', error)
        setIsSwitchingAgent(false) // Reset switching flag on error
        // Fallback to simulated connection if backend is not available
        setIsConnected(true)
        setSelectedAgent(agent)
        toast.success(`${agent.name} connected (Demo Mode)`)
        
        // Add welcome message
        setMessages([{
          id: Date.now().toString(),
          content: `Hello! I'm ${agent.name}. I'm running in demo mode. How can I assist you today?`,
          sender: 'agent',
          timestamp: new Date()
        }])
      })

      setSocket(newSocket)
      
      // Connection timeout
      let connectionEstablished = false
      const connectionTimeout = setTimeout(() => {
        if (!connectionEstablished) {
          setIsSwitchingAgent(false)
          toast.error('Connection timeout - please try again')
        }
      }, 10000)
      
      // Clear timeout on successful connection
      newSocket.on('connect', () => {
        connectionEstablished = true
        clearTimeout(connectionTimeout)
      })
      
      // Safety timeout to reset switching flag
      setTimeout(() => {
        setIsSwitchingAgent(false)
      }, 5000)
    } catch (error) {
      setIsSwitchingAgent(false) // Reset switching flag on error
      toast.error('Failed to connect to agent')
      console.error('Connection error:', error)
    }
  }

  const disconnectAgent = async () => {
    // Disconnect from direct agent service
    if (selectedAgent) {
      await agentService.disconnectFromAgent(selectedAgent.id)
    }
    
    // Disconnect from backend WebSocket
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
    
    setSelectedAgent(null)
    setIsConnected(false)
    setMessages([])
    // Don't show disconnect notification when switching agents
    // toast.info('Disconnected from agent')
  }

  const sendMessage = async (message: string) => {
    if (!selectedAgent || !isConnected) {
      toast.error('No agent connected')
      return
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user' as const,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      if (socket && socket.connected) {
        // Send message via WebSocket
        socket.emit('send_message', {
          agent_id: selectedAgent.id,
          message: message
        })
      } else {
        // Generate intelligent response based on agent type and message
        setTimeout(async () => {
          try {
            const agentResponse = await generateAgentResponse(selectedAgent, message)
            const response = {
              id: (Date.now() + 1).toString(),
              content: agentResponse,
              sender: 'agent' as const,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, response])
          } catch (error) {
            // Fallback to basic response if AI generation fails
            const fallbackResponse = {
              id: (Date.now() + 1).toString(),
              content: `I understand your message: "${message}". I'm processing this request and will provide detailed assistance shortly.`,
              sender: 'agent' as const,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, fallbackResponse])
          }
        }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
      }
    } catch (error) {
      toast.error('Failed to send message')
      console.error('Message error:', error)
    }
  }

  useEffect(() => {
    // Simulate periodic agent status updates
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        lastSeen: new Date()
      })))
    }, 30000) // Update every 30 seconds

    return () => {
      clearInterval(interval)
      // Cleanup WebSocket connection
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  const value: AgentContextType = {
    agents,
    selectedAgent,
    isConnected,
    connectAgent,
    disconnectAgent,
    sendMessage,
    messages,
    discoverAgents,
    isDiscovering
  }

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  )
}
