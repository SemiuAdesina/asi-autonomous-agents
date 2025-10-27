'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments, faPlay, faPause, faStop, faRefresh, faUser, faRobot, faClock, faCheckCircle, faTimesCircle, faSpinner, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

interface ChatSession {
  id: string
  agentId: string
  agentName: string
  status: 'active' | 'paused' | 'stopped'
  startTime: string
  lastActivity: string
  messageCount: number
  protocol: 'chat' | 'http'
}

interface ChatMessage {
  id: string
  sessionId: string
  sender: 'user' | 'agent'
  content: string
  timestamp: string
  protocol: 'chat' | 'http'
}

const ChatProtocolManager = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [newSessionAgent, setNewSessionAgent] = useState('')
  const [currentMessage, setCurrentMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Available agents for Chat Protocol
  const availableAgents = [
    { id: 'healthcare-agent', name: 'Healthcare Assistant', address: 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl' },
    { id: 'financial-agent', name: 'Financial Advisor', address: 'agent1qtm6dj5n89vjda5adz223x7t7pdzle3rskugery36w4en3je67whkuke606' },
    { id: 'logistics-agent', name: 'Logistics Coordinator', address: 'agent1q09g48srfjc74zzlr80ag93qaaev7ue9vhgl2u3jgykca0trwm2hxpw66jl' }
  ]

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - in production, this would call the backend
      const mockSessions: ChatSession[] = [
        {
          id: 'session-1',
          agentId: 'healthcare-agent',
          agentName: 'Healthcare Assistant',
          status: 'active',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          lastActivity: new Date(Date.now() - 300000).toISOString(),
          messageCount: 15,
          protocol: 'chat'
        },
        {
          id: 'session-2',
          agentId: 'financial-agent',
          agentName: 'Financial Advisor',
          status: 'paused',
          startTime: new Date(Date.now() - 7200000).toISOString(),
          lastActivity: new Date(Date.now() - 1800000).toISOString(),
          messageCount: 8,
          protocol: 'http'
        },
        {
          id: 'session-3',
          agentId: 'logistics-agent',
          agentName: 'Logistics Coordinator',
          status: 'active',
          startTime: new Date(Date.now() - 1800000).toISOString(),
          lastActivity: new Date(Date.now() - 600000).toISOString(),
          messageCount: 12,
          protocol: 'chat'
        }
      ]
      setSessions(mockSessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
      toast.error('Failed to load chat sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const createSession = async () => {
    if (!newSessionAgent) {
      toast.error('Please select an agent')
      return
    }

    try {
      const agent = availableAgents.find(a => a.id === newSessionAgent)
      if (!agent) {
        toast.error('Invalid agent selected')
        return
      }

      // Map agent IDs to their Render URLs
      const agentUrls: { [key: string]: string } = {
        'healthcare-agent': 'https://asi-healthcare-agent1.onrender.com',
        'financial-agent': 'https://asi-financial-agent2.onrender.com',
        'logistics-agent': 'https://asi-logistics-agent3.onrender.com'
      }

      // Test connection to agent
      const agentUrl = agentUrls[agent.id]
      if (!agentUrl) {
        toast.error(`Agent ${agent.name} not configured`)
        return
      }

      // Send initial message to agent to verify connection
      const testResponse = await fetch(`${agentUrl}/health`)
      if (!testResponse.ok) {
        throw new Error('Agent not available')
      }

      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        agentId: agent.id,
        agentName: agent.name,
        status: 'active',
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 0,
        protocol: 'chat'
      }

      setSessions(prev => [newSession, ...prev])
      setActiveSession(newSession)
      setShowCreateSession(false)
      setNewSessionAgent('')
      
      toast.success(`Started Chat Protocol session with ${agent.name}`)
    } catch (error) {
      console.error('Failed to create session:', error)
      toast.error('Failed to create chat session')
    }
  }

  const pauseSession = async (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'paused' as const }
        : session
    ))
    
    if (activeSession?.id === sessionId) {
      setActiveSession(prev => prev ? { ...prev, status: 'paused' } : null)
    }
    
    toast.success('Session paused')
  }

  const resumeSession = async (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'active' as const, lastActivity: new Date().toISOString() }
        : session
    ))
    
    if (activeSession?.id === sessionId) {
      setActiveSession(prev => prev ? { ...prev, status: 'active', lastActivity: new Date().toISOString() } : null)
    }
    
    toast.success('Session resumed')
  }

  const stopSession = async (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'stopped' as const }
        : session
    ))
    
    if (activeSession?.id === sessionId) {
      setActiveSession(null)
      setMessages([])
    }
    
    toast.success('Session stopped')
  }

  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId))
    
    if (activeSession?.id === sessionId) {
      setActiveSession(null)
      setMessages([])
    }
    
    toast.success('Session deleted')
  }

  const selectSession = (session: ChatSession) => {
    setActiveSession(session)
    // Load messages for this session
    loadSessionMessages(session.id)
  }

  const loadSessionMessages = async (sessionId: string) => {
    try {
      // Mock messages for now - different messages based on agent type
      const session = sessions.find(s => s.id === sessionId)
      let mockMessages: ChatMessage[] = []
      
      if (session?.agentId === 'healthcare-agent') {
        mockMessages = [
          {
            id: 'msg-1',
            sessionId,
            sender: 'agent',
            content: 'Hello! I\'m your Healthcare Assistant. I can help with medical analysis, symptom checking, and treatment planning. How can I assist you today?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            protocol: 'chat'
          },
          {
            id: 'msg-2',
            sessionId,
            sender: 'user',
            content: 'I have a question about my health',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            protocol: 'chat'
          },
          {
            id: 'msg-3',
            sessionId,
            sender: 'agent',
            content: 'I\'d be happy to help with your health question. What specific concerns do you have?',
            timestamp: new Date(Date.now() - 3400000).toISOString(),
            protocol: 'chat'
          }
        ]
      } else if (session?.agentId === 'financial-agent') {
        mockMessages = [
          {
            id: 'msg-1',
            sessionId,
            sender: 'agent',
            content: 'Hello! I\'m your Financial Advisor. I can help with portfolio management, risk assessment, and DeFi integration. How can I assist you today?',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            protocol: 'http'
          },
          {
            id: 'msg-2',
            sessionId,
            sender: 'user',
            content: 'I need help with my investment strategy',
            timestamp: new Date(Date.now() - 7100000).toISOString(),
            protocol: 'http'
          },
          {
            id: 'msg-3',
            sessionId,
            sender: 'agent',
            content: 'I\'d be happy to help with your investment strategy. What are your current financial goals and risk tolerance?',
            timestamp: new Date(Date.now() - 7000000).toISOString(),
            protocol: 'http'
          }
        ]
      } else if (session?.agentId === 'logistics-agent') {
        mockMessages = [
          {
            id: 'msg-1',
            sessionId,
            sender: 'agent',
            content: 'Hello! I\'m your Logistics Coordinator. I can help with route optimization, inventory management, and supply chain analysis. How can I assist you today?',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            protocol: 'chat'
          },
          {
            id: 'msg-2',
            sessionId,
            sender: 'user',
            content: 'I need help optimizing my delivery routes',
            timestamp: new Date(Date.now() - 1700000).toISOString(),
            protocol: 'chat'
          },
          {
            id: 'msg-3',
            sessionId,
            sender: 'agent',
            content: 'I\'d be happy to help optimize your delivery routes. What are your current delivery locations and constraints?',
            timestamp: new Date(Date.now() - 1600000).toISOString(),
            protocol: 'chat'
          }
        ]
      }
      
      setMessages(mockMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const sendMessageToAgent = async (message: string) => {
    if (!activeSession || !message.trim()) return

    try {
      setIsSending(true)
      
      // Map agent IDs to their Render URLs
      const agentUrls: { [key: string]: string } = {
        'healthcare-agent': 'https://asi-healthcare-agent1.onrender.com',
        'financial-agent': 'https://asi-financial-agent2.onrender.com',
        'logistics-agent': 'https://asi-logistics-agent3.onrender.com'
      }

      const agentUrl = agentUrls[activeSession.agentId]
      if (!agentUrl) {
        toast.error('Agent not configured')
        return
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sessionId: activeSession.id,
        sender: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        protocol: 'chat'
      }

      setMessages(prev => [...prev, userMessage])
      setCurrentMessage('')
      
      // Update session activity
      setSessions(prev => prev.map(s => 
        s.id === activeSession.id 
          ? { ...s, lastActivity: new Date().toISOString(), messageCount: s.messageCount + 1 }
          : s
      ))

      // Send to agent
      const response = await fetch(`${agentUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        throw new Error('Agent response failed')
      }

      const data = await response.json()
      
      // Add agent response
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        sessionId: activeSession.id,
        sender: 'agent',
        content: data.response || data.message || 'No response',
        timestamp: new Date().toISOString(),
        protocol: 'chat'
      }

      setMessages(prev => [...prev, agentMessage])
      
      // Update session activity and message count
      setSessions(prev => prev.map(s => 
        s.id === activeSession.id 
          ? { ...s, lastActivity: new Date().toISOString(), messageCount: s.messageCount + 1 }
          : s
      ))

    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message to agent')
    } finally {
      setIsSending(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FontAwesomeIcon icon={faPlay} className="w-3 h-3 text-green-400" />
      case 'paused':
        return <FontAwesomeIcon icon={faPause} className="w-3 h-3 text-yellow-400" />
      case 'stopped':
        return <FontAwesomeIcon icon={faStop} className="w-3 h-3 text-red-400" />
      default:
        return <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'stopped':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faComments} className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">Chat Protocol Manager</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Manage Chat Protocol sessions with agents</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateSession(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 w-full sm:w-auto"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          <span className="text-sm sm:text-base">New Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-lg font-semibold text-white">Active Sessions</h4>
            </div>
            
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FontAwesomeIcon icon={faComments} className="w-8 h-8 mb-2" />
                  <p>No active sessions</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => selectSession(session)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      activeSession?.id === session.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-dark-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(session.status)}
                        <span className="font-medium text-white text-sm">{session.agentName}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{session.messageCount} messages</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                        <span>{new Date(session.lastActivity).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-1 mt-2">
                      {session.status === 'active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            pauseSession(session.id)
                          }}
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                          title="Pause session"
                        >
                          <FontAwesomeIcon icon={faPause} className="w-3 h-3" />
                        </button>
                      )}
                      {session.status === 'paused' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            resumeSession(session.id)
                          }}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Resume session"
                        >
                          <FontAwesomeIcon icon={faPlay} className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          stopSession(session.id)
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Stop session"
                      >
                        <FontAwesomeIcon icon={faStop} className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(session.id)
                        }}
                        className="text-gray-400 hover:text-red-400 p-1"
                        title="Delete session"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="lg:col-span-2">
          {activeSession ? (
            <div className="bg-dark-800 rounded-lg border border-gray-700 h-full flex flex-col">
              {/* Session Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon={faRobot} className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{activeSession.agentName}</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(activeSession.status)}
                        <span className="text-sm text-gray-400">
                          {activeSession.messageCount} messages
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(activeSession.status)}`}>
                      {activeSession.status}
                    </span>
                    <button
                      onClick={() => {
                        setActiveSession(null)
                        setMessages([])
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto max-h-96 hide-scrollbar">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-700 text-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <FontAwesomeIcon
                            icon={message.sender === 'user' ? faUser : faRobot}
                            className="w-3 h-3"
                          />
                          <span className="text-xs opacity-75">
                            {message.sender === 'user' ? 'You' : activeSession.agentName}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-3 sm:p-4 border-t border-gray-700">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (currentMessage.trim() && !isSending) {
                          sendMessageToAgent(currentMessage)
                        }
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-dark-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none"
                    disabled={isSending}
                  />
                  <button
                    onClick={() => {
                      if (currentMessage.trim() && !isSending) {
                        sendMessageToAgent(currentMessage)
                      }
                    }}
                    disabled={!currentMessage.trim() || isSending}
                    className="px-4 sm:px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm sm:text-base"
                  >
                    {isSending ? (
                      <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Send</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Session Info */}
              <div className="p-3 sm:p-4 border-t border-gray-700 bg-dark-700/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Started:</span>
                    <span className="text-white ml-2">
                      {new Date(activeSession.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Activity:</span>
                    <span className="text-white ml-2">
                      {new Date(activeSession.lastActivity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-dark-800 rounded-lg border border-gray-700 h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <FontAwesomeIcon icon={faComments} className="w-12 h-12 mb-4" />
                <h4 className="text-lg font-semibold mb-2">No Session Selected</h4>
                <p>Select a session from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Create New Session</h3>
                <button
                  onClick={() => setShowCreateSession(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Agent
                  </label>
                  <select
                    value={newSessionAgent}
                    onChange={(e) => setNewSessionAgent(e.target.value)}
                    className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Choose an agent...</option>
                    {availableAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateSession(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createSession}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    Create Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatProtocolManager
