'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faBrain, 
  faPlus, 
  faSearch, 
  faEdit, 
  faTrash, 
  faLink,
  faBook,
  faLightbulb,
  faChartLine,
  faFilter,
  faSlidersH,
  faFunnelDollar,
  faTimes,
  faSort,
  faSortUp,
  faSortDown,
  faDatabase
} from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'
import MeTTaQueryInterface from './MeTTaQueryInterface'

interface KnowledgeConcept {
  id: number
  concept: string
  definition: string
  domain: string
  confidence_score: number
  source: string
  created_at: string
  updated_at: string
}

interface KnowledgeManagerProps {
  className?: string
}

const KnowledgeManager = ({ className = '' }: KnowledgeManagerProps) => {
  const { isAuthenticated, token } = useAuth()
  const [concepts, setConcepts] = useState<KnowledgeConcept[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [activeTab, setActiveTab] = useState<'concepts' | 'metta'>('concepts')
  const [editingConcept, setEditingConcept] = useState<KnowledgeConcept | null>(null)
  
  // Advanced search states
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    minConfidence: 0,
    maxConfidence: 1,
    source: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
    dateFrom: '',
    dateTo: ''
  })

  const [newConcept, setNewConcept] = useState({
    concept: '',
    definition: '',
    domain: 'general',
    confidence_score: 0.8,
    relationships: {}
  })

  const domains = ['general', 'healthcare', 'logistics', 'finance', 'technology', 'blockchain']

  useEffect(() => {
    if (isAuthenticated) {
      loadConcepts()
    }
  }, [isAuthenticated])

  // Keyboard shortcut for advanced search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setShowAdvancedSearch(!showAdvancedSearch)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAdvancedSearch])

  const loadConcepts = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.getKnowledgeConcepts(1, 50, selectedDomain)
      setConcepts(data.concepts || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load concepts')
    } finally {
      setIsLoading(false)
    }
  }

  const searchConcepts = async () => {
    if (!searchQuery.trim()) {
      loadConcepts()
      return
    }

    try {
      setIsLoading(true)
      const data = await apiService.searchKnowledge(searchQuery, 20)
      let results = data.results || []
      
      // Apply advanced filters
      if (showAdvancedSearch) {
        results = results.filter(concept => {
          // Confidence score filter
          if (concept.confidence_score < advancedFilters.minConfidence || 
              concept.confidence_score > advancedFilters.maxConfidence) {
            return false
          }
          
          // Source filter
          if (advancedFilters.source && 
              !concept.source.toLowerCase().includes(advancedFilters.source.toLowerCase())) {
            return false
          }
          
          // Date range filter
          if (advancedFilters.dateFrom || advancedFilters.dateTo) {
            const conceptDate = new Date(concept.created_at)
            if (advancedFilters.dateFrom && conceptDate < new Date(advancedFilters.dateFrom)) {
              return false
            }
            if (advancedFilters.dateTo && conceptDate > new Date(advancedFilters.dateTo)) {
              return false
            }
          }
          
          return true
        })
        
        // Apply sorting
        results.sort((a, b) => {
          let aValue, bValue
          
          switch (advancedFilters.sortBy) {
            case 'concept':
              aValue = a.concept.toLowerCase()
              bValue = b.concept.toLowerCase()
              break
            case 'confidence_score':
              aValue = a.confidence_score
              bValue = b.confidence_score
              break
            case 'created_at':
              aValue = new Date(a.created_at).getTime()
              bValue = new Date(b.created_at).getTime()
              break
            default:
              aValue = a.concept.toLowerCase()
              bValue = b.concept.toLowerCase()
          }
          
          if (advancedFilters.sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          }
        })
      }
      
      setConcepts(results)
    } catch (error: any) {
      toast.error(error.message || 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const addConcept = async () => {
    try {
      setIsLoading(true)
      await apiService.addKnowledgeConcept(newConcept)
      toast.success('Concept added successfully!')
      setShowAddForm(false)
      setNewConcept({ concept: '', definition: '', domain: 'general', confidence_score: 0.8, relationships: {} })
      loadConcepts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add concept')
    } finally {
      setIsLoading(false)
    }
  }

  const updateConcept = async () => {
    if (!editingConcept) return

    try {
      setIsLoading(true)
      await apiService.updateKnowledgeConcept(editingConcept.id.toString(), {
        concept: editingConcept.concept,
        definition: editingConcept.definition,
        domain: editingConcept.domain,
        confidence_score: editingConcept.confidence_score
      })
      toast.success('Concept updated successfully!')
      setEditingConcept(null)
      loadConcepts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update concept')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteConcept = async (conceptId: number) => {
    if (!confirm('Are you sure you want to delete this concept?')) return

    try {
      setIsLoading(true)
      await apiService.deleteKnowledgeConcept(conceptId.toString())
      toast.success('Concept deleted successfully!')
      loadConcepts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete concept')
    } finally {
      setIsLoading(false)
    }
  }

  const getDomainColor = (domain: string) => {
    const colors = {
      healthcare: 'bg-blue-500',
      logistics: 'bg-green-500',
      finance: 'bg-yellow-500',
      technology: 'bg-purple-500',
      blockchain: 'bg-orange-500',
      general: 'bg-gray-500'
    }
    return colors[domain as keyof typeof colors] || 'bg-gray-500'
  }

  if (!isAuthenticated) {
    return (
      <div className={`bg-dark-800 rounded-xl p-8 text-center ${className}`}>
        <FontAwesomeIcon icon={faBrain} className="text-4xl text-primary-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Knowledge Graph</h3>
        <p className="text-gray-400">Please log in to access the knowledge management system</p>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800 rounded-xl p-4 sm:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faBrain} className="text-xl sm:text-2xl text-primary-500" />
          <h3 className="text-lg sm:text-xl font-bold text-white">Knowledge Graph</h3>
          {showAdvancedSearch && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-primary-500/20 rounded-full">
              <FontAwesomeIcon icon={faFilter} className="text-xs text-primary-500" />
              <span className="text-xs text-primary-500 font-medium">Advanced</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Add Concept</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-dark-700 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('concepts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'concepts'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-dark-600'
          }`}
        >
          <FontAwesomeIcon icon={faDatabase} className="w-4 h-4" />
          <span className="text-sm font-medium">Knowledge Concepts</span>
        </button>
        <button
          onClick={() => setActiveTab('metta')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'metta'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-dark-600'
          }`}
        >
          <FontAwesomeIcon icon={faBrain} className="w-4 h-4" />
          <span className="text-sm font-medium">MeTTa Query Interface</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'metta' ? (
        <MeTTaQueryInterface />
      ) : (
        <>
          {/* Search and Filter */}
      <div className="space-y-4 mb-6">
        {/* Basic Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchConcepts()}
                className="w-full bg-dark-700 text-white px-3 sm:px-4 py-2 pr-16 sm:pr-20 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none text-sm sm:text-base"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
                {/* Filter Icon - Shows when advanced search is closed */}
                {!showAdvancedSearch && (
                  <button
                    onClick={() => {
                      console.log('Opening advanced search')
                      setShowAdvancedSearch(true)
                    }}
                    className="text-gray-400 hover:text-primary-500 transition-colors p-1"
                    title="Open Advanced Filters"
                  >
                    <FontAwesomeIcon icon={faSlidersH} className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
                
                {/* Funnel Icon - Shows when advanced search is open */}
                {showAdvancedSearch && (
                  <button
                    onClick={() => {
                      console.log('Closing advanced search')
                      setShowAdvancedSearch(false)
                    }}
                    className="text-gray-400 hover:text-primary-500 transition-colors p-1"
                    title="Close Advanced Filters"
                  >
                    <FontAwesomeIcon icon={faFunnelDollar} className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
                
                <button
                  onClick={searchConcepts}
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                  title="Search"
                >
                  <FontAwesomeIcon icon={faSearch} className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-dark-700 text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none text-sm sm:text-base"
          >
            <option value="">All Domains</option>
            {domains.map(domain => (
              <option key={domain} value={domain}>{domain.charAt(0).toUpperCase() + domain.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={loadConcepts}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-dark-700 rounded-lg p-4 border border-gray-600"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Advanced Search</h4>
              <button
                onClick={() => setShowAdvancedSearch(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Confidence Score Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confidence Score</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={advancedFilters.minConfidence}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, minConfidence: parseFloat(e.target.value) })}
                    className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={advancedFilters.maxConfidence}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxConfidence: parseFloat(e.target.value) })}
                    className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                <input
                  type="text"
                  value={advancedFilters.source}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, source: e.target.value })}
                  className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                  placeholder="Filter by source"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={advancedFilters.sortBy}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, sortBy: e.target.value })}
                    className="flex-1 bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none text-sm sm:text-base"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="concept">Concept Name</option>
                    <option value="confidence_score">Confidence Score</option>
                  </select>
                  <button
                    onClick={() => setAdvancedFilters({ 
                      ...advancedFilters, 
                      sortOrder: advancedFilters.sortOrder === 'asc' ? 'desc' : 'asc' 
                    })}
                    className="px-3 py-2 bg-dark-600 text-white rounded-lg border border-gray-600 hover:bg-dark-500 transition-colors flex items-center justify-center"
                    title={`Sort ${advancedFilters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    <FontAwesomeIcon icon={advancedFilters.sortOrder === 'asc' ? faSortUp : faSortDown} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date From</label>
                <input
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })}
                  className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date To</label>
                <input
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })}
                  className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => {
                    setAdvancedFilters({
                      minConfidence: 0,
                      maxConfidence: 1,
                      source: '',
                      sortBy: 'created_at',
                      sortOrder: 'desc',
                      dateFrom: '',
                      dateTo: ''
                    })
                    setSearchQuery('')
                    loadConcepts()
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={searchConcepts}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Concept Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-700 rounded-lg p-4 mb-6"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Add New Concept</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Concept Name</label>
              <input
                type="text"
                value={newConcept.concept}
                onChange={(e) => setNewConcept({ ...newConcept, concept: e.target.value })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                placeholder="Enter concept name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
              <select
                value={newConcept.domain}
                onChange={(e) => setNewConcept({ ...newConcept, domain: e.target.value })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
              >
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain.charAt(0).toUpperCase() + domain.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Definition</label>
              <textarea
                value={newConcept.definition}
                onChange={(e) => setNewConcept({ ...newConcept, definition: e.target.value })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                rows={3}
                placeholder="Enter concept definition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confidence Score</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={newConcept.confidence_score}
                onChange={(e) => setNewConcept({ ...newConcept, confidence_score: parseFloat(e.target.value) })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addConcept}
              disabled={isLoading || !newConcept.concept.trim()}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add Concept'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Edit Concept Form */}
      {editingConcept && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-700 rounded-lg p-4 mb-6"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Edit Concept</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Concept Name</label>
              <input
                type="text"
                value={editingConcept.concept}
                onChange={(e) => setEditingConcept({ ...editingConcept, concept: e.target.value })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
              <select
                value={editingConcept.domain}
                onChange={(e) => setEditingConcept({ ...editingConcept, domain: e.target.value })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
              >
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain.charAt(0).toUpperCase() + domain.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Definition</label>
              <textarea
                value={editingConcept.definition}
                onChange={(e) => setEditingConcept({ ...editingConcept, definition: e.target.value })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confidence Score</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={editingConcept.confidence_score}
                onChange={(e) => setEditingConcept({ ...editingConcept, confidence_score: parseFloat(e.target.value) })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setEditingConcept(null)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={updateConcept}
              disabled={isLoading}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Concept'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Results Summary */}
      {!isLoading && concepts.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-dark-700 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              Showing <span className="text-white font-semibold">{concepts.length}</span> concepts
            </span>
            {showAdvancedSearch && (
              <span className="text-xs text-primary-500 bg-primary-500/20 px-2 py-1 rounded-full">
                Filtered Results
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <FontAwesomeIcon icon={faLightbulb} />
            <span>Advanced search active</span>
          </div>
        </div>
      )}

      {/* Concepts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading concepts...</p>
          </div>
        ) : concepts.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faBook} className="text-4xl text-gray-500 mb-4" />
            <p className="text-gray-400">No concepts found</p>
            {showAdvancedSearch && (
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search filters</p>
            )}
          </div>
        ) : (
          concepts.map((concept) => (
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-700 rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h4 className="text-base sm:text-lg font-semibold text-white truncate">{concept.concept}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getDomainColor(concept.domain)}`}>
                        {concept.domain}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400">
                        {Math.round(concept.confidence_score * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-300 mb-2 leading-relaxed">{concept.definition}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-400">
                    <span className="truncate">Source: {concept.source}</span>
                    <span className="truncate">Created: {new Date(concept.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end sm:justify-start space-x-2 sm:ml-4">
                  <button
                    onClick={() => setEditingConcept(concept)}
                    className="text-gray-400 hover:text-primary-500 transition-colors p-2"
                    title="Edit concept"
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteConcept(concept.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="Delete concept"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
        </>
      )}
    </div>
  )
}

export default KnowledgeManager
