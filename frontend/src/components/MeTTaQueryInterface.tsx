'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBrain, faSearch, faLightbulb, faDatabase, faArrowRight, faSpinner, faCheckCircle, faTimesCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

interface MeTTaQuery {
  id: string
  query: string
  result: any
  timestamp: string
  success: boolean
}

interface MeTTaConcept {
  id: string
  name: string
  definition: string
  domain: string
  confidence: number
  relationships: Array<{
    type: string
    target: string
    strength: number
  }>
}

const MeTTaQueryInterface = () => {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [queryHistory, setQueryHistory] = useState<MeTTaQuery[]>([])
  const [concepts, setConcepts] = useState<MeTTaConcept[]>([])
  const [activeTab, setActiveTab] = useState<'query' | 'concepts' | 'history'>('query')
  const [selectedConcept, setSelectedConcept] = useState<MeTTaConcept | null>(null)

  // Load initial concepts
  useEffect(() => {
    loadConcepts()
  }, [])

  const loadConcepts = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/knowledge/concepts?domain=metta`)
      if (response.ok) {
        const data = await response.json()
        setConcepts(data.concepts || [])
      }
    } catch (error) {
      console.error('Failed to load concepts:', error)
    }
  }

  const executeMeTTaQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query')
      return
    }

    setIsLoading(true)
    try {
      // Call MeTTa Knowledge Graph directly via backend
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/knowledge/metta-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          format: 'structured'
        })
      })

      const result = await response.json()
      
      const queryResult: MeTTaQuery = {
        id: Date.now().toString(),
        query: query.trim(),
        result: result,
        timestamp: new Date().toISOString(),
        success: response.ok
      }

      setQueryHistory(prev => [queryResult, ...prev])
      
      if (response.ok) {
        toast.success('MeTTa query executed successfully')
        setQuery('')
        // Update concepts if new ones were discovered
        if (result.concepts) {
          setConcepts(prev => [...prev, ...result.concepts])
        }
      } else {
        toast.error('MeTTa query failed')
      }
    } catch (error) {
      console.error('MeTTa query error:', error)
      toast.error('Failed to execute MeTTa query')
      
      const queryResult: MeTTaQuery = {
        id: Date.now().toString(),
        query: query.trim(),
        result: { error: 'Query failed' },
        timestamp: new Date().toISOString(),
        success: false
      }
      setQueryHistory(prev => [queryResult, ...prev])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      executeMeTTaQuery()
    }
  }

  const renderQueryResult = (result: any) => {
    if (result.error) {
      return (
        <div className="text-red-400 text-sm">
          <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
          {result.error}
        </div>
      )
    }

    if (result.concepts && result.concepts.length > 0) {
      return (
        <div className="space-y-3">
          <div className="text-green-400 text-sm font-medium">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            Found {result.concepts.length} concept(s)
          </div>
          {result.concepts.map((concept: any, index: number) => (
            <div key={index} className="bg-dark-700/50 p-3 rounded-lg border border-gray-600/30">
              <div className="font-medium text-white">{concept.name}</div>
              <div className="text-gray-300 text-sm mt-1">{concept.definition}</div>
              {concept.confidence && (
                <div className="text-xs text-gray-400 mt-2">
                  Confidence: {(concept.confidence * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (result.relationships && result.relationships.length > 0) {
      return (
        <div className="space-y-3">
          <div className="text-blue-400 text-sm font-medium">
            <FontAwesomeIcon icon={faDatabase} className="mr-2" />
            Found {result.relationships.length} relationship(s)
          </div>
          {result.relationships.map((rel: any, index: number) => (
            <div key={index} className="bg-dark-700/50 p-3 rounded-lg border border-gray-600/30">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">{rel.from}</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
                <span className="text-white font-medium">{rel.to}</span>
                <span className="text-gray-400 text-sm">({rel.type})</span>
              </div>
              {rel.strength && (
                <div className="text-xs text-gray-400 mt-1">
                  Strength: {(rel.strength * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="text-gray-300 text-sm">
        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
        {JSON.stringify(result, null, 2)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={faBrain} className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">MeTTa Knowledge Graph</h3>
          <p className="text-gray-400 text-sm">Query the MeTTa knowledge base directly</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
        {[
          { id: 'query', name: 'Query Interface', icon: faSearch },
          { id: 'concepts', name: 'Concepts', icon: faDatabase },
          { id: 'history', name: 'History', icon: faLightbulb }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Query Interface Tab */}
      {activeTab === 'query' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-dark-800 p-6 rounded-lg border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">Execute MeTTa Query</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Knowledge Query
                </label>
                <textarea
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    // Auto-resize textarea
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your MeTTa knowledge query (e.g., 'What are the symptoms of migraine?', 'Find relationships between diabetes and treatment')"
                  className="w-full min-h-24 max-h-48 px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none hide-scrollbar"
                  style={{ overflowY: 'auto' }}
                />
              </div>
              
              <button
                onClick={executeMeTTaQuery}
                disabled={isLoading || !query.trim()}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Querying MeTTa...' : 'Execute Query'}</span>
              </button>
            </div>
          </div>

          {/* Query Examples */}
          <div className="bg-dark-800 p-6 rounded-lg border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">Query Examples</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "What are the symptoms of migraine?",
                "Find treatments for diabetes",
                "What is the relationship between exercise and health?",
                "Show me concepts related to cardiovascular disease"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="text-left p-3 bg-dark-700 hover:bg-dark-600 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faLightbulb} className="w-4 h-4 mr-2 text-yellow-400" />
                  {example}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Concepts Tab */}
      {activeTab === 'concepts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Knowledge Concepts</h4>
            <button
              onClick={loadConcepts}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concepts.map((concept) => (
              <div
                key={concept.id}
                onClick={() => setSelectedConcept(concept)}
                className="bg-dark-800 p-4 rounded-lg border border-gray-700 hover:border-primary-500/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-white truncate">{concept.name}</h5>
                  <span className="text-xs text-gray-400">{concept.domain}</span>
                </div>
                <p className="text-gray-300 text-sm mb-2 line-clamp-2">{concept.definition}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Confidence: {(concept.confidence * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-400">
                    {concept.relationships.length} relations
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-white">Query History</h4>
          
          <div className="space-y-4">
            {queryHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FontAwesomeIcon icon={faLightbulb} className="w-8 h-8 mb-2" />
                <p>No queries executed yet</p>
              </div>
            ) : (
              queryHistory.map((query) => (
                <div key={query.id} className="bg-dark-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon 
                        icon={query.success ? faCheckCircle : faTimesCircle} 
                        className={`w-4 h-4 ${query.success ? 'text-green-400' : 'text-red-400'}`} 
                      />
                      <span className="text-white font-medium">{query.query}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(query.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="bg-dark-700 p-3 rounded-lg">
                    {renderQueryResult(query.result)}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Concept Detail Modal */}
      {selectedConcept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{selectedConcept.name}</h3>
                <button
                  onClick={() => setSelectedConcept(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Definition</label>
                  <p className="text-gray-100">{selectedConcept.definition}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Domain</label>
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-sm">
                    {selectedConcept.domain}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confidence</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedConcept.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">
                      {(selectedConcept.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {selectedConcept.relationships.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Relationships</label>
                    <div className="space-y-2">
                      {selectedConcept.relationships.map((rel, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-dark-700 rounded">
                          <span className="text-white">{rel.target}</span>
                          <span className="text-gray-400">({rel.type})</span>
                          <span className="text-xs text-gray-500">
                            {rel.strength ? `${(rel.strength * 100).toFixed(1)}%` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeTTaQueryInterface
