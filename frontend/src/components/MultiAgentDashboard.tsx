'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faNetworkWired, faComments, faArrowRight, faRobot, faHeartbeat, faTruck, faCoins, faPlay, faPause, faRefresh } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import backendAPI from '../services/backendAPI'

interface AgentMessage {
  id: string
  fromAgent: string
  toAgent: string
  message: string
  timestamp: string
  type: 'forward' | 'response' | 'initiate'
}

interface AgentCommunication {
  id: string
  agents: string[]
  messages: AgentMessage[]
  status: 'active' | 'completed' | 'pending'
  createdAt: string
}

const MultiAgentDashboard = () => {
  const [communications, setCommunications] = useState<AgentCommunication[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [selectedCommunication, setSelectedCommunication] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load communications from API
  useEffect(() => {
    const loadCommunications = async () => {
      try {
        const data = await backendAPI.getCommunications()
        setCommunications(data)
      } catch (error) {
        console.error('Failed to load communications:', error)
        toast.error('Failed to load communication data')
      }
    }

    loadCommunications()
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
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'completed': return 'text-blue-400 bg-blue-400/10'
      case 'pending': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const startMonitoring = async () => {
    setIsLoading(true)
    try {
      await backendAPI.startMonitoring()
      setIsMonitoring(true)
      
      // Refresh communications data after starting monitoring
      const data = await backendAPI.getCommunications()
      setCommunications(data)
      
      toast.success('Multi-agent communication monitoring started')
    } catch (error) {
      console.error('Failed to start monitoring:', error)
      toast.error('Failed to start monitoring')
    } finally {
      setIsLoading(false)
    }
  }

  const stopMonitoring = async () => {
    setIsLoading(true)
    try {
      await backendAPI.stopMonitoring()
      setIsMonitoring(false)
      toast.info('Multi-agent communication monitoring stopped')
    } catch (error) {
      console.error('Failed to stop monitoring:', error)
      toast.error('Failed to stop monitoring')
    } finally {
      setIsLoading(false)
    }
  }
12
  const refreshCommunications = async () => {
    setIsLoading(true)
    try {
      const data = await backendAPI.getCommunications()
      setCommunications(data)
      toast.success('Communication logs refreshed')
    } catch (error) {
      console.error('Failed to refresh communications:', error)
      toast.error('Failed to refresh communication data')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedComm = communications.find(c => c.id === selectedCommunication)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="cyber-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faNetworkWired} className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Multi-Agent Communication
            </h2>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Real-time agent-to-agent communication monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshCommunications}
            disabled={isLoading}
            className={`px-3 sm:px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Refresh communications"
          >
            <FontAwesomeIcon 
              icon={faRefresh} 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={isLoading}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              isMonitoring 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isMonitoring ? 'Stop monitoring' : 'Start monitoring'}
          >
            <FontAwesomeIcon 
              icon={isLoading ? faRefresh : (isMonitoring ? faPause : faPlay)} 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
            />
            <span className="hidden sm:inline">
              {isLoading ? 'Processing...' : (isMonitoring ? 'Stop' : 'Start')}
            </span>
          </button>
        </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Active Communications</p>
              <p className="text-xl font-bold text-white">{communications.filter(c => c.status === 'active').length}</p>
            </div>
            <FontAwesomeIcon icon={faComments} className="w-6 h-6 text-green-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Messages</p>
              <p className="text-xl font-bold text-white">{communications.reduce((sum, c) => sum + c.messages.length, 0)}</p>
            </div>
            <FontAwesomeIcon icon={faNetworkWired} className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Monitoring Status</p>
              <p className={`text-sm font-semibold ${isMonitoring ? 'text-green-400' : 'text-gray-400'}`}>
                {isMonitoring ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-400' : 'bg-gray-400'}`} />
          </div>
        </div>
      </div>

      {/* Communications List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Communications List */}
        <div className="cyber-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Recent Communications
          </h3>
          
          <div className="space-y-3">
            {communications.map((comm) => (
              <motion.div
                key={comm.id}
                className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedCommunication === comm.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-dark-800 hover:border-gray-600 hover:bg-dark-700'
                }`}
                onClick={() => setSelectedCommunication(comm.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {comm.agents.map((agent, index) => (
                      <React.Fragment key={agent}>
                        <div className="flex items-center space-x-1">
                          <FontAwesomeIcon 
                            icon={getAgentIcon(agent)} 
                            className="w-4 h-4 text-primary-400" 
                          />
                          <span className="text-sm text-gray-300">{agent}</span>
                        </div>
                        {index < comm.agents.length - 1 && (
                          <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-gray-500" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(comm.status)}`}>
                    {comm.status}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-2">
                  {comm.messages.length} message{comm.messages.length !== 1 ? 's' : ''}
                </p>
                
                <p className="text-xs text-gray-500">
                  {new Date(comm.createdAt).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Communication Details */}
        <div className="cyber-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Communication Details
          </h3>
          
          {selectedComm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {selectedComm.agents.map((agent, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <FontAwesomeIcon 
                        icon={getAgentIcon(agent)} 
                        className="w-4 h-4 text-primary-400" 
                      />
                      <span className="text-sm font-medium text-white">{agent}</span>
                      {index < selectedComm.agents.length - 1 && (
                        <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-gray-400 mx-1" />
                      )}
                    </div>
                  ))}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedComm.status)}`}>
                  {selectedComm.status}
                </span>
              </div>
              
              <div className="space-y-3">
                {selectedComm.messages.map((message) => (
                  <div key={message.id} className="bg-dark-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon 
                          icon={getAgentIcon(message.fromAgent)} 
                          className="w-4 h-4 text-primary-400" 
                        />
                        <span className="text-sm font-medium text-white">{message.fromAgent}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-gray-500" />
                        <FontAwesomeIcon 
                          icon={getAgentIcon(message.toAgent)} 
                          className="w-4 h-4 text-primary-400" 
                        />
                        <span className="text-sm font-medium text-white">{message.toAgent}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        message.type === 'forward' ? 'text-blue-400 bg-blue-400/10' :
                        message.type === 'response' ? 'text-green-400 bg-green-400/10' :
                        'text-yellow-400 bg-yellow-400/10'
                      }`}>
                        {message.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm">{message.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-dark-800 rounded-lg p-6 sm:p-8 border border-gray-700 text-center">
              <FontAwesomeIcon icon={faComments} className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-gray-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Select a communication to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MultiAgentDashboard
