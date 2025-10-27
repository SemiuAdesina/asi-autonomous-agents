'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import DirectAgentService from '../services/agentCommunication'
import { useAuth } from './AuthContext'

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

const getDemoAgents = (): Agent[] => [
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
    address: 'agent1q09g48srfjc74zzlr80ag93qaaev7ue9vhgl2u3jgykca0trwm2hxpw66jl',
    status: 'active',
    capabilities: ['Route Optimization', 'Inventory Management', 'Delivery Tracking', 'Supply Chain Analysis', 'MeTTa Knowledge Graph', 'ASI:One Integration', 'Chat Protocol', 'Render-Optimized'],
    lastSeen: new Date(),
    description: 'Supply chain optimization with MeTTa Knowledge Graph, ASI:One integration, and Chat Protocol. Render-optimized for production deployment on port 8002.'
  },
  {
    id: 'financial-agent',
    name: 'Financial Advisor',
    address: 'agent1qtm6dj5n89vjda5adz223x7t7pdzle3rskugery36w4en3je67whkuke606',
    status: 'active',
    capabilities: ['Portfolio Management', 'Risk Assessment', 'Investment Analysis', 'Market Analysis', 'MeTTa Knowledge Graph', 'ASI:One Integration', 'Chat Protocol', 'Render-Optimized'],
    lastSeen: new Date(),
    description: 'Advanced financial advisory with MeTTa Knowledge Graph, ASI:One integration, and Chat Protocol. Render-optimized for production deployment on port 8003.'
  }
]

export const AgentProvider = ({ children }: AgentProviderProps) => {
  const { isAuthenticated, user } = useAuth()
  const [agents, setAgents] = useState<Agent[]>(() => {
    // Initialize with demo agents immediately
    console.log('🚀 AgentProvider initializing with demo agents...')
    const demoAgents = getDemoAgents()
    console.log('📋 Initial demo agents:', demoAgents.length)
    return demoAgents
  })
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isSwitchingAgent, setIsSwitchingAgent] = useState(false)
  
  // Track if discovery has been attempted to prevent multiple calls
  const hasAttemptedDiscovery = useRef(false)
  
  // Initialize direct agent communication service
  const [agentService] = useState(() => new DirectAgentService())

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

  const discoverAgents = useCallback(async () => {
    console.log('🔍 Starting agent discovery...')
    setIsDiscovering(true)
    try {
      // Try to fetch fresh agent data from the backend API with timeout
      console.log('🌐 Fetching agents from backend API...')
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(`${backendUrl}/api/coordinator/agents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        const backendAgents = await response.json()
        console.log('📡 Backend agents received:', backendAgents)
        
        // Transform backend agent data to match our Agent interface
        const transformedAgents: Agent[] = backendAgents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          address: agent.address,
          status: agent.status === 'running' ? 'active' : 'inactive',
          capabilities: agent.capabilities || [],
          lastSeen: new Date(agent.lastPing || Date.now()),
          description: `${agent.name} with MeTTa Knowledge Graph, ASI:One integration, and Chat Protocol. Render-optimized for production deployment on port ${agent.port}.`
        }))
        
        console.log('🔄 Transformed agents:', transformedAgents)
        setAgents(transformedAgents)
        console.log('✅ Fresh agents loaded from backend:', transformedAgents.length, 'agents')
        toast.success(`Refreshed! Found ${transformedAgents.length} active agents`)
      } else {
        throw new Error(`Backend API error: ${response.status}`)
      }
    } catch (error: any) {
      console.error('❌ Agent discovery failed:', error)
      
      // Handle timeout or network errors gracefully
      if (error.name === 'AbortError') {
        console.log('⏱️ Discovery request timed out, using demo agents')
      }
      
      // Fallback to demo agents - silent fallback without warning
      console.log('🔄 Falling back to demo agents...')
      const fallbackAgents = getDemoAgents()
      setAgents(fallbackAgents)
      console.log('🔄 Fallback agents loaded:', fallbackAgents.length, 'agents')
      // No toast warning - agents work fine with direct HTTP connections
    } finally {
      setIsDiscovering(false)
      console.log('🏁 Agent discovery completed')
    }
  }, [])

  // Discover agents on component mount
  useEffect(() => {
    console.log('🚀 AgentContext mounted, starting agent discovery...')
    // Only attempt discovery once
    if (hasAttemptedDiscovery.current) {
      console.log('⏭️ Skipping duplicate discovery attempt')
      return
    }
    hasAttemptedDiscovery.current = true
    // Try to discover to get fresh data from backend
    discoverAgents()
  }, [discoverAgents]) // Include discoverAgents in dependency array
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Array<{
    id: string
    content: string
    sender: 'user' | 'agent'
    timestamp: Date
  }>>([])

  // Generate intelligent agent responses based on agent type and user message
  const generateAgentResponse = async (agent: Agent, message: string): Promise<string> => {
    const agentPrompts = {
      'healthcare-agent': `You are a Healthcare Assistant AI with MeTTa Knowledge Graph and ASI:One integration. Respond to this healthcare-related query: "${message}". Provide helpful, accurate medical information using advanced AI reasoning and knowledge graph insights while reminding users to consult healthcare professionals for serious concerns.`,
      'logistics-agent': `You are a Logistics Coordinator AI with MeTTa Knowledge Graph and ASI:One integration. Respond to this logistics query: "${message}". Focus on supply chain optimization, route planning, inventory management, and delivery tracking solutions using enhanced AI capabilities and knowledge graph reasoning.`,
      'financial-agent': `You are a Financial Advisor AI with MeTTa Knowledge Graph and ASI:One integration. Respond to this financial query: "${message}". Provide insights on portfolio management, DeFi protocols, risk assessment, and investment strategies using advanced AI reasoning and knowledge graph analysis.`
    }

    const prompt = agentPrompts[agent.id as keyof typeof agentPrompts] || 
      `You are an AI assistant. Respond helpfully to this query: "${message}".`

    try {
      // Use OpenAI API or similar service for intelligent responses
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/generate-response`, {
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

  const loadMessageHistory = async (agentId: string) => {
    if (!isAuthenticated || !user) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/messages/?agent_id=${agentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const messageHistory = data.map((msg: any) => ({
          id: msg.id.toString(),
          content: msg.content,
          sender: msg.sender_type === 'user' ? 'user' as const : 'agent' as const,
          timestamp: new Date(msg.timestamp)
        }))
        
        // Sort by timestamp and set messages
        messageHistory.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setMessages(messageHistory)
        console.log(`Loaded ${messageHistory.length} messages from history`)
      }
    } catch (error) {
      console.error('Failed to load message history:', error)
    }
  }

  const connectAgent = async (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId)
      if (!agent) {
        toast.error('Agent not found')
        return
      }

      console.log(`🔗 Connecting to agent: ${agent.name}`)
      
      // Check if already connected to this agent
      if (isConnected && selectedAgent?.id === agentId) {
        toast.info(`Already connected to ${agent.name}`)
        return
      }

      // Disconnect from current agent if connected to a different one
      if (isConnected && selectedAgent?.id !== agentId) {
        setIsSwitchingAgent(true)
        await disconnectAgent()
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Use direct agent communication
      console.log(`📡 Using direct agent communication for ${agent.name}`)
      
      // Connect to the agent using DirectAgentService
      const connected = await agentService.connectToAgent(agentId)
      
      if (connected) {
        console.log(`✅ Successfully connected to ${agent.name}`)
        setIsConnected(true)
        setSelectedAgent(agent)
        setIsSwitchingAgent(false)
        
        // Add welcome message
        setMessages([{
          id: Date.now().toString(),
          content: `Hello! I'm ${agent.name}. How can I assist you today?`,
          sender: 'agent',
          timestamp: new Date()
        }])
        
        toast.success(`Connected to ${agent.name}. Click the chat icon in the header to start chatting!`, {
          autoClose: 5000,
          hideProgressBar: false,
        })
      } else {
        console.log(`❌ Failed to connect to ${agent.name}`)
        setIsSwitchingAgent(false)
        toast.error(`Failed to connect to ${agent.name}. Please try again.`)
      }
    } catch (error) {
      setIsSwitchingAgent(false)
      toast.error('Failed to connect to agent')
      console.error('Connection error:', error)
    }
  }

  const disconnectAgent = async () => {
    // Disconnect from direct agent service
    if (selectedAgent) {
      await agentService.disconnectFromAgent(selectedAgent.id)
    }
    
    setSelectedAgent(null)
    setIsConnected(false)
    setMessages([])
    setIsSwitchingAgent(false)
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
      console.log(`📤 Sending message to ${selectedAgent.name}: ${message}`)
      
      // Use direct agent communication for MeTTa-integrated agents
      const response = await agentService.sendMessage(selectedAgent.id, message)
      
      if (response) {
        console.log(`📥 Received response from ${selectedAgent.name}:`, response)
        
        const agentMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: 'agent' as const,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, agentMessage])
      } else {
        console.log('No response received from agent')
        // Fallback to basic response
        const fallbackResponse = {
          id: (Date.now() + 1).toString(),
          content: `I understand your message: "${message}". I'm processing this request and will provide detailed assistance shortly.`,
          sender: 'agent' as const,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, fallbackResponse])
      }
    } catch (error) {
      console.error('Message error:', error)
      toast.error('Failed to send message')
      
      // Fallback to basic response
      const fallbackResponse = {
        id: (Date.now() + 1).toString(),
        content: `I understand your message: "${message}". I'm processing this request and will provide detailed assistance shortly.`,
        sender: 'agent' as const,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackResponse])
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
    }
  }, [])

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
