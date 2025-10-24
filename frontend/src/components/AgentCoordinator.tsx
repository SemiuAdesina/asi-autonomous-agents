'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faPlay, faPause, faRefresh, faRobot, faHeartbeat, faTruck, faCoins, faChartLine, faNetworkWired, faCog, faEye, faEdit, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import backendAPI from '../services/backendAPI'

interface AgentConfig {
  id: string
  name: string
  address: string
  port: number
  status: 'running' | 'stopped' | 'error'
  capabilities: string[]
  routingRules: RoutingRule[]
  healthScore: number
  lastPing: string
}

interface RoutingRule {
  id: string
  condition: string
  targetAgent: string
  priority: number
  enabled: boolean
}

interface CommunicationFlow {
  id: string
  fromAgent: string
  toAgent: string
  messageType: string
  frequency: number
  lastActivity: string
}

const AgentCoordinator = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [flows, setFlows] = useState<CommunicationFlow[]>([])
  const [isCoordinating, setIsCoordinating] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null)
  const [showRoutingConfig, setShowRoutingConfig] = useState(false)

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [agentsData, flowsData] = await Promise.all([
          backendAPI.getCoordinatorAgents(),
          backendAPI.getCommunicationFlows()
        ])
        setAgents(agentsData)
        setFlows(flowsData)
      } catch (error) {
        console.error('Failed to load coordinator data:', error)
        toast.error('Failed to load coordinator data')
      }
    }

    loadData()
  }, [])

  const getAgentIcon = (agentName: string) => {
    const iconMap: { [key: string]: any } = {
      'Healthcare Assistant': faHeartbeat,
      'Logistics Coordinator': faTruck,
      'Financial Advisor': faCoins
    }
    return iconMap[agentName] || faRobot
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-400/10'
      case 'stopped': return 'text-gray-400 bg-gray-400/10'
      case 'error': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const startCoordination = () => {
    setIsCoordinating(true)
    toast.success('Agent coordination started')
  }

  const stopCoordination = () => {
    setIsCoordinating(false)
    toast.info('Agent coordination stopped')
  }

  const refreshAgents = async () => {
    try {
      const [agentsData, flowsData] = await Promise.all([
        backendAPI.getCoordinatorAgents(),
        backendAPI.getCommunicationFlows()
      ])
      setAgents(agentsData)
      setFlows(flowsData)
      toast.success('Agent status refreshed')
    } catch (error) {
      console.error('Failed to refresh agents:', error)
      toast.error('Failed to refresh agent data')
    }
  }

  const startAgent = async (agentId: string) => {
    try {
      await backendAPI.startAgent(agentId)
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'running', healthScore: 95, lastPing: new Date().toISOString() }
          : agent
      ))
      toast.success('Agent started successfully')
    } catch (error) {
      console.error('Failed to start agent:', error)
      toast.error('Failed to start agent')
    }
  }

  const stopAgent = async (agentId: string) => {
    try {
      await backendAPI.stopAgent(agentId)
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'stopped', healthScore: 0 }
          : agent
      ))
      toast.success('Agent stopped successfully')
    } catch (error) {
      console.error('Failed to stop agent:', error)
      toast.error('Failed to stop agent')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="cyber-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faCogs} className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Agent Coordinator
            </h2>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Manage agent coordination and routing
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshAgents}
            className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faRefresh} className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {isCoordinating ? (
            <button
              onClick={stopCoordination}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faPause} className="w-4 h-4" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              onClick={startCoordination}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faPlay} className="w-4 h-4" />
              <span className="hidden sm:inline">Start</span>
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Agents</p>
              <p className="text-xl font-bold text-white">{agents.length}</p>
            </div>
            <FontAwesomeIcon icon={faRobot} className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Running</p>
              <p className="text-xl font-bold text-green-400">{agents.filter(a => a.status === 'running').length}</p>
            </div>
            <FontAwesomeIcon icon={faPlay} className="w-6 h-6 text-green-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Active Flows</p>
              <p className="text-xl font-bold text-blue-400">{flows.length}</p>
            </div>
            <FontAwesomeIcon icon={faNetworkWired} className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Coordination</p>
              <p className={`text-sm font-semibold ${isCoordinating ? 'text-green-400' : 'text-gray-400'}`}>
                {isCoordinating ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isCoordinating ? 'bg-green-400' : 'bg-gray-400'}`} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Agents List */}
        <div className="cyber-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Agent Registry
          </h3>
          
          <div className="space-y-3">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  selectedAgent?.id === agent.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-dark-800 hover:border-gray-600 hover:bg-dark-700'
                }`}
                onClick={() => setSelectedAgent(agent)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FontAwesomeIcon 
                      icon={getAgentIcon(agent.name)} 
                      className="w-6 h-6 text-primary-400 flex-shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white font-semibold truncate">{agent.name}</h4>
                      <p className="text-sm text-gray-400">Port {agent.port}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                    
                    {agent.status === 'running' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          stopAgent(agent.id)
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <FontAwesomeIcon icon={faPause} className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          startAgent(agent.id)
                        }}
                        className="p-1 text-green-400 hover:text-green-300"
                      >
                        <FontAwesomeIcon icon={faPlay} className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faChartLine} className="w-3 h-3 text-gray-400" />
                    <span className={`font-semibold ${getHealthColor(agent.healthScore)}`}>
                      {agent.healthScore}%
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCog} className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400">{agent.routingRules.length} rules</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Communication Flows */}
        <div className="cyber-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Communication Flows
          </h3>
          
          <div className="space-y-3">
            {flows.map((flow) => (
              <div key={flow.id} className="cyber-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon 
                      icon={getAgentIcon(flow.fromAgent)} 
                      className="w-4 h-4 text-primary-400" 
                    />
                    <span className="text-sm text-white">{flow.fromAgent}</span>
                    <FontAwesomeIcon icon={faNetworkWired} className="w-3 h-3 text-gray-500" />
                    <FontAwesomeIcon 
                      icon={getAgentIcon(flow.toAgent)} 
                      className="w-4 h-4 text-primary-400" 
                    />
                    <span className="text-sm text-white">{flow.toAgent}</span>
                  </div>
                  
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {flow.messageType}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{flow.frequency} messages/hour</span>
                  <span>{new Date(flow.lastActivity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon 
                  icon={getAgentIcon(selectedAgent.name)} 
                  className="w-8 h-8 text-primary-400" 
                />
                <div>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    {selectedAgent.name}
                  </h3>
                  <p className="text-gray-400">{selectedAgent.address}</p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedAgent(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Agent Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedAgent.status)}`}>
                      {selectedAgent.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Port:</span>
                    <span className="text-white">{selectedAgent.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Health Score:</span>
                    <span className={`font-semibold ${getHealthColor(selectedAgent.healthScore)}`}>
                      {selectedAgent.healthScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Ping:</span>
                    <span className="text-white">{new Date(selectedAgent.lastPing).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.capabilities.map((capability, index) => (
                    <span key={index} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">Routing Rules</h4>
                <button
                  onClick={() => setShowRoutingConfig(true)}
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors duration-200 flex items-center space-x-1"
                >
                  <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                  <span>Configure</span>
                </button>
              </div>
              
              <div className="space-y-2">
                {selectedAgent.routingRules.map((rule) => (
                  <div key={rule.id} className="bg-dark-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{rule.condition}</p>
                        <p className="text-gray-400 text-xs">→ {rule.targetAgent}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">Priority: {rule.priority}</span>
                        <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AgentCoordinator
