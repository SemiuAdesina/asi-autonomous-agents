'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faExchangeAlt, 
  faPlus, 
  faEye, 
  faChartBar, 
  faClock,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faGasPump,
  faSearch,
  faSlidersH,
  faFunnelDollar,
  faSort,
  faSortUp,
  faSortDown
} from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

interface Transaction {
  id: number
  agent_id: number
  transaction_hash: string
  transaction_type: string
  status: string
  gas_used?: number
  gas_price?: number
  block_number?: number
  created_at: string
  agent_metadata: any
}

interface TransactionStats {
  total_transactions: number
  pending_transactions: number
  confirmed_transactions: number
  failed_transactions: number
  total_gas_used: number
  average_gas_price: number
  transaction_types: Record<string, number>
}

interface TransactionMonitorProps {
  className?: string
}

const TransactionMonitor = ({ className = '' }: TransactionMonitorProps) => {
  const { isAuthenticated, token } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')
  
  // Advanced search states
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    minGasUsed: 0,
    maxGasUsed: 1000000,
    minGasPrice: 0,
    maxGasPrice: 1000,
    minBlockNumber: 0,
    maxBlockNumber: 999999999,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
    dateFrom: '',
    dateTo: ''
  })

  const [newTransaction, setNewTransaction] = useState({
    agent_id: 0,
    transaction_hash: '',
    transaction_type: 'execute',
    status: 'pending',
    gas_used: 0,
    gas_price: 0,
    block_number: 0,
    metadata: {}
  })

  const transactionTypes = ['deploy', 'execute', 'transfer', 'interact', 'approve']
  const statuses = ['pending', 'confirmed', 'failed']

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions()
      loadStats()
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

  const searchTransactions = async () => {
    if (!searchQuery.trim()) {
      loadTransactions()
      return
    }
    
    try {
      setIsLoading(true)
      // For now, we'll use the basic search - in production, implement backend search
      const data = await apiService.getTransactions(1, 50, selectedStatus, undefined, selectedType)
      const filtered = data.transactions?.filter(tx => 
        tx.transaction_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.transaction_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.status.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
      setTransactions(filtered)
    } catch (error: any) {
      toast.error(error.message || 'Failed to search transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.getTransactions(1, 50, selectedStatus, undefined, selectedType)
      setTransactions(data.transactions || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await apiService.getTransactionStats()
      setStats(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load transaction stats')
    }
  }

  const createTransaction = async () => {
    if (!newTransaction.agent_id || !newTransaction.transaction_hash) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)
      await apiService.createTransaction(newTransaction)
      toast.success('Transaction created successfully!')
      setShowCreateForm(false)
      setNewTransaction({
        agent_id: 0,
        transaction_hash: '',
        transaction_type: 'execute',
        status: 'pending',
        gas_used: 0,
        gas_price: 0,
        block_number: 0,
        metadata: {}
      })
      loadTransactions()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const updateTransaction = async (transactionId: number, updates: any) => {
    try {
      setIsLoading(true)
      await apiService.updateTransaction(transactionId.toString(), updates)
      toast.success('Transaction updated successfully!')
      loadTransactions()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
      case 'failed':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
      case 'pending':
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-500',
      failed: 'bg-red-500',
      pending: 'bg-yellow-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const formatGasPrice = (gasPrice: number) => {
    if (gasPrice === 0) return 'N/A'
    return `${(gasPrice / 1e9).toFixed(2)} Gwei`
  }

  const formatGasUsed = (gasUsed: number) => {
    if (gasUsed === 0) return 'N/A'
    return gasUsed.toLocaleString()
  }

  if (!isAuthenticated) {
    return (
      <div className={`bg-dark-800 rounded-xl p-8 text-center ${className}`}>
        <FontAwesomeIcon icon={faExchangeAlt} className="text-4xl text-primary-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Transaction Monitor</h3>
        <p className="text-gray-400">Please log in to access transaction monitoring</p>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800 rounded-xl p-4 sm:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faExchangeAlt} className="text-xl sm:text-2xl text-primary-500" />
          <h3 className="text-lg sm:text-xl font-bold text-white">Transaction Monitor</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-dark-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faChartBar} className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm text-gray-400">Total</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white">{stats.total_transactions}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faClock} className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm text-gray-400">Pending</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white">{stats.pending_transactions}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm text-gray-400">Confirmed</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white">{stats.confirmed_transactions}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faGasPump} className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm text-gray-400">Gas Used</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white">{formatGasUsed(stats.total_gas_used)}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4 mb-6">
        {/* Basic Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchTransactions()}
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
                  onClick={searchTransactions}
                  className="text-gray-400 hover:text-primary-500 transition-colors p-1"
                  title="Search"
                >
                  <FontAwesomeIcon icon={faSearch} className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-dark-700 text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none text-sm sm:text-base"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-dark-700 text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none text-sm sm:text-base"
            >
              <option value="">All Types</option>
              {transactionTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={loadTransactions}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-dark-800 rounded-lg p-4 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Gas Used Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gas Used Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advancedFilters.minGasUsed}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, minGasUsed: parseInt(e.target.value) || 0})}
                    className="flex-1 bg-dark-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={advancedFilters.maxGasUsed}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, maxGasUsed: parseInt(e.target.value) || 1000000})}
                    className="flex-1 bg-dark-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Gas Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gas Price Range (Gwei)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advancedFilters.minGasPrice}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, minGasPrice: parseInt(e.target.value) || 0})}
                    className="flex-1 bg-dark-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={advancedFilters.maxGasPrice}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, maxGasPrice: parseInt(e.target.value) || 1000})}
                    className="flex-1 bg-dark-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Block Number Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Block Number Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advancedFilters.minBlockNumber}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, minBlockNumber: parseInt(e.target.value) || 0})}
                    className="flex-1 bg-dark-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={advancedFilters.maxBlockNumber}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, maxBlockNumber: parseInt(e.target.value) || 999999999})}
                    className="flex-1 bg-dark-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <select
                  value={advancedFilters.sortBy}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, sortBy: e.target.value})}
                  className="w-full bg-dark-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                >
                  <option value="created_at">Date Created</option>
                  <option value="gas_used">Gas Used</option>
                  <option value="gas_price">Gas Price</option>
                  <option value="block_number">Block Number</option>
                  <option value="transaction_type">Transaction Type</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setAdvancedFilters({...advancedFilters, sortOrder: 'asc'})}
                    className={`flex-1 py-2 px-3 rounded border transition-colors ${
                      advancedFilters.sortOrder === 'asc'
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-dark-700 border-gray-600 text-gray-300 hover:border-primary-500'
                    }`}
                  >
                    <FontAwesomeIcon icon={faSortUp} className="mr-1" />
                    Ascending
                  </button>
                  <button
                    onClick={() => setAdvancedFilters({...advancedFilters, sortOrder: 'desc'})}
                    className={`flex-1 py-2 px-3 rounded border transition-colors ${
                      advancedFilters.sortOrder === 'desc'
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-dark-700 border-gray-600 text-gray-300 hover:border-primary-500'
                    }`}
                  >
                    <FontAwesomeIcon icon={faSortDown} className="mr-1" />
                    Descending
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={advancedFilters.dateFrom}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
                    className="w-full bg-dark-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="date"
                    value={advancedFilters.dateTo}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
                    className="w-full bg-dark-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setAdvancedFilters({
                    minGasUsed: 0,
                    maxGasUsed: 1000000,
                    minGasPrice: 0,
                    maxGasPrice: 1000,
                    minBlockNumber: 0,
                    maxBlockNumber: 999999999,
                    sortBy: 'created_at',
                    sortOrder: 'desc',
                    dateFrom: '',
                    dateTo: ''
                  })
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => {
                  // Apply advanced filters logic here
                  console.log('Applying advanced filters:', advancedFilters)
                  loadTransactions()
                }}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Transaction Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-700 rounded-lg p-4 mb-6"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Add New Transaction</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Agent ID</label>
              <input
                type="number"
                value={newTransaction.agent_id}
                onChange={(e) => setNewTransaction({ ...newTransaction, agent_id: parseInt(e.target.value) })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                placeholder="Enter agent ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Hash</label>
              <input
                type="text"
                value={newTransaction.transaction_hash}
                onChange={(e) => setNewTransaction({ ...newTransaction, transaction_hash: e.target.value })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Type</label>
              <select
                value={newTransaction.transaction_type}
                onChange={(e) => setNewTransaction({ ...newTransaction, transaction_type: e.target.value })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
              >
                {transactionTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={newTransaction.status}
                onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gas Used</label>
              <input
                type="number"
                value={newTransaction.gas_used}
                onChange={(e) => setNewTransaction({ ...newTransaction, gas_used: parseInt(e.target.value) })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                placeholder="21000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gas Price (Gwei)</label>
              <input
                type="number"
                step="0.1"
                value={newTransaction.gas_price / 1e9}
                onChange={(e) => setNewTransaction({ ...newTransaction, gas_price: parseFloat(e.target.value) * 1e9 })}
                className="w-full bg-dark-600 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:outline-none"
                placeholder="20"
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
              onClick={createTransaction}
              disabled={isLoading || !newTransaction.agent_id || !newTransaction.transaction_hash}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Transactions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faExchangeAlt} className="text-4xl text-gray-500 mb-4" />
            <p className="text-gray-400">No transactions found</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-700 rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <h4 className="text-base sm:text-lg font-semibold text-white truncate">
                        {transaction.transaction_hash.slice(0, 8)}...{transaction.transaction_hash.slice(-6)}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs text-gray-300 bg-gray-600">
                        {transaction.transaction_type}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                    <div className="truncate">
                      <span className="font-medium">Agent ID:</span> {transaction.agent_id}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Gas Used:</span> {formatGasUsed(transaction.gas_used || 0)}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Gas Price:</span> {formatGasPrice(transaction.gas_price || 0)}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Block:</span> {transaction.block_number || 'N/A'}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 mt-2">
                    <span className="font-medium">Created:</span> {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center justify-end sm:justify-start space-x-2 sm:ml-4">
                  <button
                    onClick={() => updateTransaction(transaction.id, { status: 'confirmed' })}
                    className="text-gray-400 hover:text-green-500 transition-colors p-2"
                    title="Mark as confirmed"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateTransaction(transaction.id, { status: 'failed' })}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="Mark as failed"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default TransactionMonitor
