'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUsers, 
  faPlay, 
  faStop, 
  faClock, 
  faTrash, 
  faEye,
  faPlus,
  faHistory
} from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

interface AgentSession {
  id: number
  session_id: string
  agent_id: number
  user_id: number
  status: string
  started_at: string
  ended_at?: string
  agent_metadata: any
}

interface Agent {
  id: number
  name: string
  agent_type: string
  status: string
}

interface SessionManagerProps {
  className?: string
}

const SessionManager = ({ className = '' }: SessionManagerProps) => {
  const { isAuthenticated, token } = useAuth()
  const [sessions, setSessions] = useState<AgentSession[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')

  const [newSession, setNewSession] = useState({
    agent_id: 0,
    metadata: {}
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions()
      loadAgents()
    }
  }, [isAuthenticated])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.getSessions(1, 50, selectedStatus, selectedAgent ? parseInt(selectedAgent) : undefined)
      setSessions(data.sessions || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAgents = async () => {
    try {
      const data = await apiService.getAgents()
      setAgents(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load agents')
    }
  }

  const createSession = async () => {
    if (!newSession.agent_id) {
      toast.error('Please select an agent')
      return
    }

    try {
      setIsLoading(true)
      await apiService.createSession(newSession)
      toast.success('Session created successfully!')
      setShowCreateForm(false)
      setNewSession({ agent_id: 0, metadata: {} })
      loadSessions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create session')
    } finally {
      setIsLoading(false)
    }
  }

  const updateSession = async (sessionId: number, status: string) => {
    try {
      setIsLoading(true)
      await apiService.updateSession(sessionId.toString(), { status })
      toast.success('Session updated successfully!')
      loadSessions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update session')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      setIsLoading(true)
      await apiService.deleteSession(sessionId.toString())
      toast.success('Session deleted successfully!')
      loadSessions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete session')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      ended: 'bg-gray-500',
      timeout: 'bg-yellow-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const formatDuration = (startedAt: string, endedAt?: string) => {
    const start = new Date(startedAt)
    const end = endedAt ? new Date(endedAt) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`
    }
    return `${diffMins}m`
  }

  if (!isAuthenticated) {
    return (
      <div className={`bg-dark-800 rounded-xl p-8 text-center ${className}`}>
        <FontAwesomeIcon icon={faUsers} className="text-4xl text-primary-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Agent Sessions</h3>
        <p className="text-gray-400">Please log in to access session management</p>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800 rounded-xl p-4 sm:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faUsers} className="text-xl sm:text-2xl text-primary-500" />
          <h3 className="text-lg sm:text-xl font-bold text-white">Agent Sessions</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-dark-700 text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none text-sm sm:text-base"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
            <option value="timeout">Timeout</option>
          </select>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-dark-700 text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none text-sm sm:text-base"
          >
            <option value="">All Agents</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={loadSessions}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
        >
          Refresh
        </button>
      </div>

      {/* Create Session Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-700 rounded-lg p-4 mb-6"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Create New Session</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Agent</label>
              <select
                value={newSession.agent_id}
                onChange={(e) => setNewSession({ ...newSession, agent_id: parseInt(e.target.value) })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
              >
                <option value={0}>Choose an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.agent_type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Session Metadata</label>
              <input
                type="text"
                placeholder="Optional metadata (JSON)"
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                onChange={(e) => {
                  try {
                    const metadata = e.target.value ? JSON.parse(e.target.value) : {}
                    setNewSession({ ...newSession, metadata })
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createSession}
              disabled={isLoading || !newSession.agent_id}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faHistory} className="text-4xl text-gray-500 mb-4" />
            <p className="text-gray-400">No sessions found</p>
          </div>
        ) : (
          sessions.map((session) => {
            const agent = agents.find(a => a.id === session.agent_id)
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-700 rounded-lg p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h4 className="text-base sm:text-lg font-semibold text-white truncate">
                        Session {session.session_id.slice(0, 8)}...
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-400 truncate">
                          {agent ? agent.name : `Agent ${session.agent_id}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-2">
                      <span className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faClock} className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">Started: {new Date(session.started_at).toLocaleDateString()}</span>
                      </span>
                      <span className="truncate">Duration: {formatDuration(session.started_at, session.ended_at)}</span>
                      {session.ended_at && (
                        <span className="truncate">Ended: {new Date(session.ended_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    {session.agent_metadata && Object.keys(session.agent_metadata).length > 0 && (
                      <div className="text-xs sm:text-sm text-gray-400">
                        <span className="font-medium">Metadata:</span> 
                        <span className="truncate block sm:inline sm:ml-1">
                          {JSON.stringify(session.agent_metadata)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end sm:justify-start space-x-2 sm:ml-4">
                    {session.status === 'active' && (
                      <button
                        onClick={() => updateSession(session.id, 'ended')}
                        className="text-gray-400 hover:text-yellow-500 transition-colors p-2"
                        title="End session"
                      >
                        <FontAwesomeIcon icon={faStop} className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      title="Delete session"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SessionManager
