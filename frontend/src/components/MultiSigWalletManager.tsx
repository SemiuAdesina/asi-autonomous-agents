'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faWallet, 
  faUsers, 
  faShieldAlt, 
  faCheckCircle, 
  faTimesCircle,
  faHistory,
  faPlus,
  faMinus,
  faCog,
  faCoins
} from '@fortawesome/free-solid-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

interface MultiSigWallet {
  contract_address?: string
  multisig_account?: string
  chain: string
  owners: string[]
  threshold: number
  wallet_name: string
  created_at: string
  status: string
  type: string
  capabilities: string[]
}

interface Transaction {
  transaction_id: string
  multisig_address: string
  to_address: string
  value: string
  status: string
  created_at: string
  approvals: string[]
  rejections: string[]
}

const MultiSigWalletManager = () => {
  const { token } = useAuth()
  const [wallets, setWallets] = useState<MultiSigWallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedWallet, setSelectedWallet] = useState<MultiSigWallet | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [createForm, setCreateForm] = useState({
    chain: 'ethereum',
    owners: [''],
    threshold: 2,
    wallet_name: ''
  })

  const [transactionForm, setTransactionForm] = useState({
    multisig_address: '',
    to_address: '',
    value: '',
    data: '0x'
  })

  useEffect(() => {
    loadWallets()
  }, [])

  const loadWallets = async () => {
    try {
      setIsLoading(true)
      // Mock data for demonstration
      const mockWallets: MultiSigWallet[] = [
        {
          contract_address: '0x1234567890123456789012345678901234567890',
          chain: 'ethereum',
          owners: [
            '0x1111111111111111111111111111111111111111',
            '0x2222222222222222222222222222222222222222',
            '0x3333333333333333333333333333333333333333'
          ],
          threshold: 2,
          wallet_name: 'Team Treasury',
          created_at: '2024-01-15T10:30:00Z',
          status: 'active',
          type: 'gnosis_safe',
          capabilities: ['multi_signature_transactions', 'owner_management', 'threshold_modification']
        },
        {
          multisig_account: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567890',
          chain: 'solana',
          owners: [
            'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567890',
            'DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567890ABC123'
          ],
          threshold: 2,
          wallet_name: 'DeFi Operations',
          created_at: '2024-01-10T14:20:00Z',
          status: 'active',
          type: 'spl_multisig',
          capabilities: ['multi_signature_transactions', 'token_transfers', 'program_upgrades']
        }
      ]
      setWallets(mockWallets)
    } catch (error) {
      toast.error('Failed to load multisig wallets')
    } finally {
      setIsLoading(false)
    }
  }

  const createWallet = async () => {
    try {
      setIsLoading(true)
      
      const result = await apiService.createMultisigWallet({
        chain: createForm.chain,
        owners: createForm.owners.filter(owner => owner.trim() !== ''),
        threshold: createForm.threshold,
        wallet_name: createForm.wallet_name
      })
      
      toast.success('Multi-signature wallet created successfully!')
      setShowCreateForm(false)
      setCreateForm({ chain: 'ethereum', owners: [''], threshold: 2, wallet_name: '' })
      loadWallets()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const createTransaction = async () => {
    try {
      setIsLoading(true)
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/multisig/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          multisig_address: transactionForm.multisig_address,
          to_address: transactionForm.to_address,
          value: transactionForm.value,
          data: transactionForm.data,
          chain: 'ethereum'
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Transaction created successfully!')
        setShowTransactionForm(false)
        setTransactionForm({ multisig_address: '', to_address: '', value: '', data: '0x' })
        loadTransactions(transactionForm.multisig_address)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create transaction')
      }
    } catch (error) {
      toast.error('Failed to create transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTransactions = async (multisigAddress: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/multisig/wallet/${multisigAddress}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setTransactions(result.transaction_history || [])
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }
  }

  const approveTransaction = async (transactionId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/multisig/transaction/${transactionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          approver_address: '0x1234567890123456789012345678901234567890' // Mock address
        })
      })

      if (response.ok) {
        toast.success('Transaction approved successfully!')
        if (selectedWallet) {
          loadTransactions(selectedWallet.contract_address || selectedWallet.multisig_account || '')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to approve transaction')
      }
    } catch (error) {
      toast.error('Failed to approve transaction')
    }
  }

  const rejectTransaction = async (transactionId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/multisig/transaction/${transactionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rejector_address: '0x1234567890123456789012345678901234567890', // Mock address
          reason: 'Rejected by user'
        })
      })

      if (response.ok) {
        toast.success('Transaction rejected successfully!')
        if (selectedWallet) {
          loadTransactions(selectedWallet.contract_address || selectedWallet.multisig_account || '')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to reject transaction')
      }
    } catch (error) {
      toast.error('Failed to reject transaction')
    }
  }

  const addOwner = () => {
    setCreateForm(prev => ({
      ...prev,
      owners: [...prev.owners, '']
    }))
  }

  const removeOwner = (index: number) => {
    setCreateForm(prev => ({
      ...prev,
      owners: prev.owners.filter((_, i) => i !== index)
    }))
  }

  const updateOwner = (index: number, value: string) => {
    setCreateForm(prev => ({
      ...prev,
      owners: prev.owners.map((owner, i) => i === index ? value : owner)
    }))
  }

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'ethereum':
        return faEthereum
      case 'solana':
        return faCoins
      default:
        return faWallet
    }
  }

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'ethereum':
        return 'text-blue-400'
      case 'solana':
        return 'text-purple-400'
      case 'polygon':
        return 'text-indigo-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="cyber-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faUsers} className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white font-orbitron">Multi-Signature Wallets</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 sm:px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Create Wallet</span>
        </button>
      </div>

      {/* Wallet List */}
      <div className="space-y-4 mb-6">
        {wallets.map((wallet, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedWallet === wallet
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => {
              setSelectedWallet(wallet)
              loadTransactions(wallet.contract_address || wallet.multisig_account || '')
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon 
                  icon={getChainIcon(wallet.chain)} 
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${getChainColor(wallet.chain)}`} 
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-sm sm:text-base truncate">{wallet.wallet_name}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm font-mono truncate">
                    {wallet.contract_address ? 
                      `${wallet.contract_address.slice(0, 6)}...${wallet.contract_address.slice(-4)}` :
                      `${wallet.multisig_account?.slice(0, 6)}...${wallet.multisig_account?.slice(-4)}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end sm:text-right">
                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                  <span className="text-gray-400">{wallet.threshold} of {wallet.owners.length}</span>
                  <FontAwesomeIcon 
                    icon={wallet.status === 'active' ? faCheckCircle : faTimesCircle} 
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${wallet.status === 'active' ? 'text-green-400' : 'text-red-400'}`} 
                  />
                </div>
                <p className="text-gray-500 text-xs capitalize ml-2">{wallet.chain}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Wallet Details */}
      {selectedWallet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-gray-700 pt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Wallet Details</h3>
            <button
              onClick={() => setShowTransactionForm(true)}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs sm:text-sm transition-colors duration-200"
            >
              Create Transaction
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Owners</h4>
              <div className="space-y-2">
                {selectedWallet.owners.map((owner, index) => (
                  <div key={index} className="text-xs sm:text-sm text-gray-300 font-mono truncate">
                    {owner.slice(0, 6)}...{owner.slice(-4)}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Capabilities</h4>
              <div className="space-y-1">
                {selectedWallet.capabilities.map((capability, index) => (
                  <div key={index} className="text-xs sm:text-sm text-gray-300 capitalize">
                    {capability.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center space-x-2 text-sm sm:text-base">
              <FontAwesomeIcon icon={faHistory} className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Recent Transactions</span>
            </h4>
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx, index) => (
                <div key={index} className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs sm:text-sm font-mono truncate">
                        To: {tx.to_address.slice(0, 6)}...{tx.to_address.slice(-4)}
                      </p>
                      <p className="text-gray-400 text-xs">{tx.value} ETH</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                      {tx.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => approveTransaction(tx.transaction_id)}
                            className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                          >
                            <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => rejectTransaction(tx.transaction_id)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Wallet Modal */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCreateForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 p-4 sm:p-6 rounded-lg w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Create Multi-Signature Wallet</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chain</label>
                <select
                  value={createForm.chain}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, chain: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
                >
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="solana">Solana</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Name</label>
                <input
                  type="text"
                  value={createForm.wallet_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, wallet_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
                  placeholder="Enter wallet name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Owners</label>
                <div className="space-y-2">
                  {createForm.owners.map((owner, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={owner}
                        onChange={(e) => updateOwner(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
                        placeholder="Owner address"
                      />
                      {createForm.owners.length > 1 && (
                        <button
                          onClick={() => removeOwner(index)}
                          className="px-2 py-2 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <FontAwesomeIcon icon={faMinus} className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addOwner}
                    className="px-3 py-2 text-primary-400 hover:bg-primary-500/20 rounded border border-primary-500/30 text-sm sm:text-base"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Add Owner
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Threshold</label>
                <input
                  type="number"
                  min="1"
                  max={createForm.owners.length}
                  value={createForm.threshold}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum {createForm.threshold} of {createForm.owners.length} signatures required
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={createWallet}
                disabled={isLoading}
                className="flex-1 px-3 sm:px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? 'Creating...' : 'Create Wallet'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Create Transaction Modal */}
      {showTransactionForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowTransactionForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 p-4 sm:p-6 rounded-lg w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Create Transaction</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Multisig Address</label>
                <input
                  type="text"
                  value={transactionForm.multisig_address}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, multisig_address: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
                  placeholder="Multisig wallet address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To Address</label>
                <input
                  type="text"
                  value={transactionForm.to_address}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, to_address: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
                  placeholder="Recipient address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Value (ETH)</label>
                <input
                  type="text"
                  value={transactionForm.value}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
                  placeholder="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data (Optional)</label>
                <input
                  type="text"
                  value={transactionForm.data}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, data: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
                  placeholder="0x"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => setShowTransactionForm(false)}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={createTransaction}
                disabled={isLoading}
                className="flex-1 px-3 sm:px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? 'Creating...' : 'Create Transaction'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default MultiSigWalletManager
