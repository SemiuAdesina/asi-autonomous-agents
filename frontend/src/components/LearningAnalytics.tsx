'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBrain, faChartLine, faArrowUp, faLightbulb, faRobot, faHeartbeat, faTruck, faCoins, faRefresh, faPlay, faPause, faEye } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import backendAPI from '../services/backendAPI'

interface LearningMetric {
  agentId: string
  agentName: string
  interactions: number
  knowledgeUpdates: number
  accuracy: number
  learningRate: number
  lastUpdate: string
}

interface KnowledgeUpdate {
  id: string
  agentId: string
  category: string
  concept: string
  confidence: number
  source: string
  timestamp: string
}

interface LearningPattern {
  id: string
  pattern: string
  frequency: number
  accuracy: number
  lastSeen: string
}

const LearningAnalytics = () => {
  const [metrics, setMetrics] = useState<LearningMetric[]>([])
  const [knowledgeUpdates, setKnowledgeUpdates] = useState<KnowledgeUpdate[]>([])
  const [patterns, setPatterns] = useState<LearningPattern[]>([])
  const [isLearningActive, setIsLearningActive] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsData, updatesData, patternsData] = await Promise.all([
          backendAPI.getLearningMetrics(),
          backendAPI.getKnowledgeUpdates(),
          backendAPI.getLearningPatterns()
        ])
        setMetrics(metricsData)
        setKnowledgeUpdates(updatesData)
        setPatterns(patternsData)
      } catch (error) {
        console.error('Failed to load learning data:', error)
        toast.error('Failed to load learning analytics data')
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

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-400'
    if (accuracy >= 80) return 'text-yellow-400'
    if (accuracy >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400 bg-green-400/10'
    if (confidence >= 0.8) return 'text-yellow-400 bg-yellow-400/10'
    if (confidence >= 0.7) return 'text-orange-400 bg-orange-400/10'
    return 'text-red-400 bg-red-400/10'
  }

  const toggleLearning = async () => {
    try {
      const response = await backendAPI.toggleLearning(!isLearningActive)
      if (response.status === 'success') {
        setIsLearningActive(response.isActive)
        toast.success(`Dynamic learning ${response.isActive ? 'enabled' : 'disabled'}`)
      }
    } catch (error) {
      console.error('Failed to toggle learning:', error)
      toast.error('Failed to toggle learning')
    }
  }

  const refreshData = async () => {
    try {
      const [metricsData, updatesData, patternsData] = await Promise.all([
        backendAPI.getLearningMetrics(),
        backendAPI.getKnowledgeUpdates(selectedAgent || undefined),
        backendAPI.getLearningPatterns(selectedAgent || undefined)
      ])
      setMetrics(metricsData)
      setKnowledgeUpdates(updatesData)
      setPatterns(patternsData)
      toast.success('Learning analytics refreshed')
    } catch (error) {
      console.error('Failed to refresh data:', error)
      toast.error('Failed to refresh learning data')
    }
  }

  const filteredKnowledgeUpdates = selectedAgent 
    ? knowledgeUpdates.filter(update => update.agentId === selectedAgent)
    : knowledgeUpdates

  const filteredPatterns = selectedAgent 
    ? patterns.filter(pattern => {
        const agentName = metrics.find(m => m.agentId === selectedAgent)?.agentName || ''
        return pattern.pattern.toLowerCase().includes(agentName.toLowerCase().split(' ')[0])
      })
    : patterns

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="cyber-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faBrain} className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Dynamic Learning Analytics
            </h2>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Monitor agent learning progress and knowledge updates
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshData}
            className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faRefresh} className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button
            onClick={toggleLearning}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              isLearningActive 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            <FontAwesomeIcon icon={isLearningActive ? faPause : faPlay} className="w-4 h-4" />
            <span className="hidden sm:inline">{isLearningActive ? 'Pause' : 'Resume'}</span>
          </button>
        </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Total Interactions</p>
              <p className="text-xl font-bold text-white">{metrics.reduce((sum, m) => sum + m.interactions, 0)}</p>
            </div>
            <FontAwesomeIcon icon={faChartLine} className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Knowledge Updates</p>
              <p className="text-xl font-bold text-green-400">{metrics.reduce((sum, m) => sum + m.knowledgeUpdates, 0)}</p>
            </div>
            <FontAwesomeIcon icon={faLightbulb} className="w-6 h-6 text-green-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Avg Accuracy</p>
              <p className="text-xl font-bold text-yellow-400">
                {(metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length).toFixed(1)}%
              </p>
            </div>
            <FontAwesomeIcon icon={faArrowUp} className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="cyber-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Learning Status</p>
              <p className={`text-sm font-semibold ${isLearningActive ? 'text-green-400' : 'text-gray-400'}`}>
                {isLearningActive ? 'Active' : 'Paused'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isLearningActive ? 'bg-green-400' : 'bg-gray-400'}`} />
          </div>
        </div>
      </div>

      {/* Agent Filter */}
      <div className="cyber-card p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <span className="text-gray-400 text-sm">Filter by agent:</span>
          <select
            value={selectedAgent || ''}
            onChange={(e) => setSelectedAgent(e.target.value || null)}
            className="px-3 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="">All Agents</option>
            {metrics.map((metric) => (
              <option key={metric.agentId} value={metric.agentId}>
                {metric.agentName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Learning Metrics */}
        <div className="cyber-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Agent Learning Metrics
          </h3>
          
          <div className="space-y-3">
            {metrics.map((metric) => (
              <motion.div
                key={metric.agentId}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  selectedAgent === metric.agentId
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-dark-800 hover:border-gray-600 hover:bg-dark-700'
                }`}
                onClick={() => setSelectedAgent(selectedAgent === metric.agentId ? null : metric.agentId)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon 
                      icon={getAgentIcon(metric.agentName)} 
                      className="w-6 h-6 text-primary-400" 
                    />
                    <div>
                      <h4 className="text-white font-semibold">{metric.agentName}</h4>
                      <p className="text-sm text-gray-400">{metric.interactions} interactions</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getAccuracyColor(metric.accuracy)}`}>
                      {metric.accuracy}%
                    </p>
                    <p className="text-xs text-gray-400">accuracy</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Knowledge Updates</p>
                    <p className="text-white font-semibold">{metric.knowledgeUpdates}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Learning Rate</p>
                    <p className="text-white font-semibold">{(metric.learningRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    Last update: {new Date(metric.lastUpdate).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Knowledge Updates & Patterns */}
        <div className="cyber-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Recent Knowledge Updates
          </h3>
          
          <div className="space-y-3">
            {filteredKnowledgeUpdates.slice(0, 5).map((update) => (
              <div key={update.id} className="cyber-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon 
                      icon={getAgentIcon(metrics.find(m => m.agentId === update.agentId)?.agentName || '')} 
                      className="w-4 h-4 text-primary-400" 
                    />
                    <span className="text-sm text-white">{update.category}</span>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(update.confidence)}`}>
                    {(update.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-1">{update.concept}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Source: {update.source}</span>
                  <span>{new Date(update.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          <h3 className="text-lg font-semibold text-white mt-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Learning Patterns
          </h3>
          
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {filteredPatterns.slice(0, 5).map((pattern) => (
              <div key={pattern.id} className="bg-dark-800 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm font-medium">{pattern.pattern}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(pattern.accuracy)}`}>
                    {(pattern.accuracy * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{pattern.frequency} occurrences</span>
                  <span>{new Date(pattern.lastSeen).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningAnalytics
