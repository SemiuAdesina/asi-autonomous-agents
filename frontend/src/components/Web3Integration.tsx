'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faCoins, faChartLine } from '@fortawesome/free-solid-svg-icons'
import { faEthereum as faEthereumBrand } from '@fortawesome/free-brands-svg-icons'
import { useWeb3 } from '../contexts/Web3Context'
import { toast } from 'react-toastify'
import { useState } from 'react'
import PortfolioDashboard from './PortfolioDashboard'
import DeFiProtocols from './DeFiProtocols'
import WalletSelector from './WalletSelector'

const Web3Integration = () => {
  const {
    isConnected,
    account,
    chainId,
    connectWallet,
    disconnectWallet,
    balance,
    isLoading,
    showWalletSelector,
    setShowWalletSelector,
    connectToWallet
  } = useWeb3()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showDeFi, setShowDeFi] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handlePortfolioAnalysis = async () => {
    try {
      setIsProcessing(true)
      // Simulate portfolio analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show the dashboard
      setShowDashboard(true)
      toast.success('Portfolio analysis completed! Dashboard loaded.')
    } catch (error) {
      toast.error('Failed to analyze portfolio')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeFiProtocols = async () => {
    try {
      setIsProcessing(true)
      // Simulate DeFi protocol interaction
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show the DeFi protocols
      setShowDeFi(true)
      toast.success('DeFi protocols loaded! Browse available protocols.')
    } catch (error) {
      toast.error('Failed to load DeFi protocols')
    } finally {
      setIsProcessing(false)
    }
  }

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet'
      case 137: return 'Polygon'
      case 11155111: return 'Sepolia Testnet'
      default: return 'Unknown Network'
    }
  }

  return (
    <div className="space-y-6">
      {showDashboard ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white font-orbitron">Portfolio Dashboard</h2>
            <button
              onClick={() => setShowDashboard(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Wallet
            </button>
          </div>
          <PortfolioDashboard />
        </div>
      ) : showDeFi ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white font-orbitron">DeFi Protocols</h2>
            <button
              onClick={() => setShowDeFi(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Wallet
            </button>
          </div>
          <DeFiProtocols />
        </div>
      ) : (
        <div className="cyber-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white font-orbitron">Web3 Integration</h3>
            <FontAwesomeIcon icon={faEthereumBrand} className="w-6 h-6 text-primary-400" />
          </div>

          {!isConnected ? (
            <div className="text-center">
              <FontAwesomeIcon icon={faWallet} className="w-16 h-16 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-white mb-2 font-exo">Connect Your Wallet</h4>
              <p className="text-gray-300 mb-6 font-rajdhani">
                Connect your Web3 wallet to interact with DeFi protocols and manage your portfolio
              </p>
              <motion.button
                onClick={connectWallet}
                disabled={isLoading}
                className="cyber-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white font-medium">Connected</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Account Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Account:</span>
                  <span className="text-white font-mono text-sm">
                    {account ? formatAddress(account) : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Network:</span>
                  <span className="text-white">{getNetworkName(chainId)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Balance:</span>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCoins} className="w-4 h-4 text-primary-400" />
                    <span className="text-white">{balance ? `${balance} ETH` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700/50">
                <motion.button
                  className="flex items-center justify-center space-x-2 p-3 bg-dark-800/50 hover:bg-primary-500/20 rounded-lg transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePortfolioAnalysis}
                  disabled={isProcessing}
                >
                  <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-white">{isProcessing ? 'Analyzing...' : 'Portfolio'}</span>
                </motion.button>
                
                <motion.button
                  className="flex items-center justify-center space-x-2 p-3 bg-dark-800/50 hover:bg-primary-500/20 rounded-lg transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeFiProtocols}
                  disabled={isProcessing}
                >
                  <FontAwesomeIcon icon={faEthereumBrand} className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-white">{isProcessing ? 'Loading...' : 'DeFi'}</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* Demo Mode Notice */}
          {!isConnected && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FontAwesomeIcon icon={faEthereumBrand} className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">Demo Mode Available</span>
              </div>
              <p className="text-blue-300 text-sm mb-3">
                You can explore portfolio analysis and DeFi protocols without connecting a wallet.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePortfolioAnalysis}
                  disabled={isProcessing}
                >
                  <FontAwesomeIcon icon={faChartLine} className="w-4 h-4" />
                  <span className="text-sm">{isProcessing ? 'Analyzing...' : 'Portfolio Demo'}</span>
                </motion.button>
                
                <motion.button
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeFiProtocols}
                  disabled={isProcessing}
                >
                  <FontAwesomeIcon icon={faEthereumBrand} className="w-4 h-4" />
                  <span className="text-sm">{isProcessing ? 'Loading...' : 'DeFi Demo'}</span>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Wallet Selector Modal */}
      <WalletSelector
        isOpen={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onSelectWallet={connectToWallet}
      />
    </div>
  )
}

export default Web3Integration
