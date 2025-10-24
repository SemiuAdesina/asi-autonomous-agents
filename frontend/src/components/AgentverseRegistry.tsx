'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket, faPlus, faSearch, faCheckCircle, faTimesCircle, faSpinner, faRobot, faHeartbeat, faTruck, faCoins, faEye, faEdit, faTrash, faSlidersH, faFunnelDollar, faFilter, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import backendAPI from '../services/backendAPI'

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

const AgentverseRegistry = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    capabilities: [] as string[]
  })

  // Advanced search state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'registeredAt' | 'lastSeen'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all')
  const [capabilityFilter, setCapabilityFilter] = useState<string>('')

  // Load agents from API
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await backendAPI.getAgentverseAgents()
        setAgents(data)
      } catch (error) {
        console.error('Failed to load agents:', error)
        toast.error('Failed to load agent data')
      }
    }

    loadAgents()
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
      case 'inactive': return 'text-gray-400 bg-gray-400/10'
      case 'pending': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return faCheckCircle
      case 'inactive': return faTimesCircle
      case 'pending': return faSpinner
      default: return faTimesCircle
    }
  }

  const filteredAgents = agents
    .filter(agent => {
      // Basic search filter
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
      
      // Capability filter
      const matchesCapability = !capabilityFilter || 
        agent.capabilities.some(cap => cap.toLowerCase().includes(capabilityFilter.toLowerCase()))
      
      return matchesSearch && matchesStatus && matchesCapability
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'registeredAt':
          aValue = new Date(a.registeredAt).getTime()
          bValue = new Date(b.registeredAt).getTime()
          break
        case 'lastSeen':
          aValue = new Date(a.lastSeen).getTime()
          bValue = new Date(b.lastSeen).getTime()
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const registerAgent = async () => {
    if (!newAgent.name || !newAgent.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await backendAPI.registerAgent({
        name: newAgent.name,
        description: newAgent.description,
        capabilities: newAgent.capabilities
      })
      
      if (response.status === 'success') {
        setAgents(prev => [response.agent, ...prev])
        setNewAgent({ name: '', description: '', capabilities: [] })
        setShowRegisterForm(false)
        toast.success('Agent registered successfully!')
      }
    } catch (error) {
      console.error('Failed to register agent:', error)
      toast.error('Failed to register agent')
    } finally {
      setIsLoading(false)
    }
  }

  const updateAgentStatus = async (agentId: string, status: 'active' | 'inactive') => {
    setIsLoading(true)
    try {
      await backendAPI.updateAgentStatus(agentId, status)
      
      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? { ...agent, status, lastSeen: new Date().toISOString() } : agent
      ))
      toast.success(`Agent ${status === 'active' ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Failed to update agent status:', error)
      toast.error('Failed to update agent status')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return

    setIsLoading(true)
    try {
      await backendAPI.deleteAgent(agentId)
      
      setAgents(prev => prev.filter(agent => agent.id !== agentId))
      toast.success('Agent deleted successfully')
    } catch (error) {
      console.error('Failed to delete agent:', error)
      toast.error('Failed to delete agent')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="cyber-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faRocket} className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                Agentverse Registry
              </h2>
              {showAdvancedSearch && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-primary-500/20 rounded-full">
                  <FontAwesomeIcon icon={faFilter} className="text-xs text-primary-500" />
                  <span className="text-xs text-primary-500 font-medium">Advanced</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Manage agent registration and discovery
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowRegisterForm(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          <span className="hidden sm:inline">Register Agent</span>
        </button>
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
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Active</p>
              <p className="text-xl font-bold text-green-400">{agents.filter(a => a.status === 'active').length}</p>
            </div>
            <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-green-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Inactive</p>
              <p className="text-xl font-bold text-gray-400">{agents.filter(a => a.status === 'inactive').length}</p>
            </div>
            <FontAwesomeIcon icon={faTimesCircle} className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Pending</p>
              <p className="text-xl font-bold text-yellow-400">{agents.filter(a => a.status === 'pending').length}</p>
            </div>
            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="cyber-card p-4 sm:p-6">
        <div className="space-y-4">
          {/* Basic Search */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search agents by name, description, or capabilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-16 sm:pr-20 py-3 bg-dark-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
                  {/* Filter Icon - Shows when advanced search is closed */}
                  {!showAdvancedSearch && (
                    <button
                      onClick={() => setShowAdvancedSearch(true)}
                      className="text-gray-400 hover:text-primary-500 transition-colors p-1"
                      title="Open Advanced Filters"
                    >
                      <FontAwesomeIcon icon={faSlidersH} className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Funnel Icon - Shows when advanced search is open */}
                  {showAdvancedSearch && (
                    <button
                      onClick={() => setShowAdvancedSearch(false)}
                      className="text-gray-400 hover:text-primary-500 transition-colors p-1"
                      title="Close Advanced Filters"
                    >
                      <FontAwesomeIcon icon={faFunnelDollar} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-dark-800 text-white px-3 py-3 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Advanced Search */}
          {showAdvancedSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-gray-700"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Capability Filter</label>
                  <input
                    type="text"
                    placeholder="Filter by specific capability..."
                    value={capabilityFilter}
                    onChange={(e) => setCapabilityFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 bg-dark-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="name">Name</option>
                      <option value="status">Status</option>
                      <option value="registeredAt">Registration Date</option>
                      <option value="lastSeen">Last Seen</option>
                    </select>
                    
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 flex items-center space-x-1"
                      title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      <FontAwesomeIcon 
                        icon={sortOrder === 'asc' ? faSortUp : faSortDown} 
                        className="w-4 h-4" 
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 px-2 py-1 bg-primary-500/20 rounded-full">
                  <FontAwesomeIcon icon={faFilter} className="text-xs text-primary-500" />
                  <span className="text-xs text-primary-500 font-medium">Advanced Filters Active</span>
                </div>
                
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setCapabilityFilter('')
                    setSortBy('name')
                    setSortOrder('asc')
                  }}
                  className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredAgents.map((agent) => (
          <motion.div
            key={agent.id}
            className="cyber-card p-4 sm:p-6 hover:border-primary-500 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FontAwesomeIcon 
                  icon={getAgentIcon(agent.name)} 
                  className="w-8 h-8 text-primary-400 flex-shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-white truncate" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    {agent.name}
                  </h3>
                  <p className="text-xs text-gray-400 truncate" title={agent.address}>
                    {agent.address.length > 20 ? `${agent.address.substring(0, 20)}...` : agent.address}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 whitespace-nowrap ${getStatusColor(agent.status)}`}>
                  <FontAwesomeIcon icon={getStatusIcon(agent.status)} className="w-3 h-3" />
                  <span className="hidden sm:inline">{agent.status}</span>
                </span>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-3">{agent.description}</p>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">Capabilities:</h4>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.slice(0, 3).map((capability, index) => (
                  <span key={index} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                    {capability}
                  </span>
                ))}
                {agent.capabilities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                    +{agent.capabilities.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-4 space-y-1 sm:space-y-0">
              <span>Registered: {new Date(agent.registeredAt).toLocaleDateString()}</span>
              <span>Last seen: {new Date(agent.lastSeen).toLocaleDateString()}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setSelectedAgent(agent)}
                className="flex-1 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                <span>View</span>
              </button>
              
              {agent.status === 'active' ? (
                <button
                  onClick={() => updateAgentStatus(agent.id, 'inactive')}
                  className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3" />
                  <span className="hidden sm:inline">Deactivate</span>
                </button>
              ) : (
                <button
                  onClick={() => updateAgentStatus(agent.id, 'active')}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                  <span className="hidden sm:inline">Activate</span>
                </button>
              )}
              
              <button
                onClick={() => deleteAgent(agent.id)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Register Agent Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-dark-800 rounded-lg p-6 w-full max-w-md border border-gray-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Register New Agent
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="Enter agent name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 h-20 resize-none"
                  placeholder="Enter agent description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Capabilities</label>
                <input
                  type="text"
                  value={newAgent.capabilities.join(', ')}
                  onChange={(e) => setNewAgent(prev => ({ 
                    ...prev, 
                    capabilities: e.target.value.split(',').map(cap => cap.trim()).filter(cap => cap)
                  }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="Enter capabilities separated by commas"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={registerAgent}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? 'Registering...' : 'Register Agent'}</span>
              </button>
              
              <button
                onClick={() => setShowRegisterForm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(selectedAgent.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(selectedAgent.status)} className="w-3 h-3" />
                      <span>{selectedAgent.status}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Agent Address */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Agent Address</h4>
                <div className="bg-dark-700 rounded-lg p-3 border border-gray-600">
                  <p className="text-white font-mono text-sm break-all">{selectedAgent.address}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
                <div className="bg-dark-700 rounded-lg p-3 border border-gray-600">
                  <p className="text-gray-300">{selectedAgent.description}</p>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.capabilities.map((capability, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agent Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Registration Date</h4>
                  <div className="bg-dark-700 rounded-lg p-3 border border-gray-600">
                    <p className="text-white">{new Date(selectedAgent.registeredAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Last Seen</h4>
                  <div className="bg-dark-700 rounded-lg p-3 border border-gray-600">
                    <p className="text-white">{new Date(selectedAgent.lastSeen).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    if (selectedAgent.status === 'active') {
                      updateAgentStatus(selectedAgent.id, 'inactive')
                    } else {
                      updateAgentStatus(selectedAgent.id, 'active')
                    }
                  }}
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 ${
                    selectedAgent.status === 'active'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon 
                    icon={selectedAgent.status === 'active' ? faTimesCircle : faCheckCircle} 
                    className="w-4 h-4" 
                  />
                  <span className="text-sm">{selectedAgent.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                </button>
                
                <button
                  onClick={() => deleteAgent(selectedAgent.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
                
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  <span className="text-sm">Close</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AgentverseRegistry
