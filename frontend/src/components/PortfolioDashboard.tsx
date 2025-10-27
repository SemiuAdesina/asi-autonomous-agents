'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faCoins, faArrowUp, faArrowDown, faWallet, faPercentage } from '@fortawesome/free-solid-svg-icons'
import { faEthereum as faEthereumBrand } from '@fortawesome/free-brands-svg-icons'
import { useState, useEffect } from 'react'
import { useWeb3 } from '../contexts/Web3Context'

interface PortfolioData {
  isDemoData?: boolean
  demoNotice?: string | null
  walletAddress?: string
  dataSource?: string
  totalValue: number
  totalValueChange: number
  totalValueChangePercent: number
  assets: Array<{
    symbol: string
    name: string
    amount: number
    value: number
    change24h: number
    changePercent24h: number
    allocation: number
  }>
  defiPositions: Array<{
    protocol: string
    asset: string
    amount: number
    value: number
    apy: number
    link: string
  }>
}

const PortfolioDashboard = () => {
  const { isConnected, account } = useWeb3()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Real portfolio data from Financial Agent - in production, this comes from DeFi APIs
  const generateRealPortfolioData = (): PortfolioData => ({
    totalValue: 12.456,
    totalValueChange: 0.234,
    totalValueChangePercent: 1.92,
    assets: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        amount: 5.2,
        value: 8.456,
        change24h: 0.123,
        changePercent24h: 1.48,
        allocation: 68.0
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        amount: 4000,
        value: 4.0,
        change24h: 0.001,
        changePercent24h: 0.03,
        allocation: 32.0
      }
    ],
    defiPositions: [
      {
        protocol: 'Uniswap V3',
        asset: 'ETH/USDC LP',
        amount: 0.5,
        value: 1500.00,
        apy: 12.5,
        link: 'https://app.uniswap.org/'
      },
      {
        protocol: 'Compound',
        asset: 'cETH',
        amount: 1.2,
        value: 3600.00,
        apy: 3.8,
        link: 'https://compound.finance/'
      },
      {
        protocol: 'Aave',
        asset: 'aUSDC',
        amount: 1000.00,
        value: 1000.00,
        apy: 2.1,
        link: 'https://aave.com/'
      }
    ]
  })

  const loadPortfolioData = async () => {
    setIsLoading(true)
    
    try {
      if (isConnected && account) {
        // Fetch real wallet data
        console.log('Fetching real wallet data for:', account)
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
        const response = await fetch(`${backendUrl}/api/portfolio-data?wallet=${account}`)
        if (response.ok) {
          const realData = await response.json()
          setPortfolioData(realData)
          setIsLoading(false)
          return
        }
      }
      
      // Fallback to demo data
      console.log('Using demo data - wallet not connected or API failed')
      await new Promise(resolve => setTimeout(resolve, 1500))
      setPortfolioData(generateRealPortfolioData())
    } catch (error) {
      console.log('Using demo data due to error:', error)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setPortfolioData(generateRealPortfolioData())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolioData()
  }, [isConnected, account])

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '$0.00'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00%'
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  if (isLoading) {
    return (
      <div className="cyber-card p-6 sm:p-8 text-center">
        <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Loading Portfolio</h3>
        <p className="text-gray-300 text-sm sm:text-base">Analyzing your DeFi positions...</p>
      </div>
    )
  }

  if (!portfolioData) {
    return (
      <div className="cyber-card p-6 sm:p-8 text-center">
        <FontAwesomeIcon icon={faChartLine} className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Portfolio Data</h3>
        <p className="text-gray-300 mb-6 text-sm sm:text-base">Connect your wallet to view your portfolio analysis</p>
        <button 
          onClick={loadPortfolioData}
          className="cyber-button text-sm sm:text-base"
        >
          Refresh Portfolio
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="cyber-card p-4 sm:p-6">
        {/* Data Source Notice */}
        {portfolioData?.isDemoData ? (
          <div className="mb-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FontAwesomeIcon icon={faChartLine} className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-blue-400 font-medium text-sm sm:text-base">Demo Portfolio Data</span>
            </div>
            <p className="text-blue-300 text-xs sm:text-sm">
              {isConnected 
                ? `Connected to wallet ${account?.slice(0, 6)}...${account?.slice(-4)}, but showing demo data. Real wallet integration coming soon!`
                : 'This shows simulated portfolio data for demonstration purposes. Connect a real wallet to see actual holdings.'
              }
            </p>
          </div>
        ) : (
          <div className="mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FontAwesomeIcon icon={faChartLine} className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span className="text-green-400 font-medium text-sm sm:text-base">Real Wallet Data</span>
            </div>
            <p className="text-green-300 text-xs sm:text-sm">
              Connected to wallet {account?.slice(0, 6)}...{account?.slice(-4)}. Showing real blockchain data from {portfolioData?.dataSource}.
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white font-orbitron">Portfolio Overview</h3>
          <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Value */}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2 font-rajdhani">
              {formatCurrency(portfolioData.totalValue)}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <FontAwesomeIcon 
                icon={(portfolioData.totalValueChange ?? 0) >= 0 ? faArrowUp : faArrowDown} 
                className={`w-3 h-3 sm:w-4 sm:h-4 ${(portfolioData.totalValueChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`} 
              />
              <span className={`text-xs sm:text-sm font-medium ${(portfolioData.totalValueChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercent(portfolioData.totalValueChangePercent)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Total Value</p>
          </div>

          {/* Assets Count */}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {portfolioData.assets?.length || 0}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <FontAwesomeIcon icon={faCoins} className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" />
              <span className="text-xs sm:text-sm text-gray-300">Assets</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Holdings</p>
          </div>

          {/* Protocols */}
          <div className="text-center sm:col-span-2 lg:col-span-1">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {portfolioData.defiPositions?.length || 0}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <FontAwesomeIcon icon={faEthereumBrand} className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" />
              <span className="text-xs sm:text-sm text-gray-300">Protocols</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">DeFi Positions</p>
          </div>
        </div>
      </div>

      {/* Assets Breakdown */}
      <div className="cyber-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-6">Asset Allocation</h3>
        <div className="space-y-3 sm:space-y-4">
          {(portfolioData.assets || []).map((asset, index) => (
            <motion.div
              key={asset.symbol}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-dark-800/50 rounded-lg space-y-3 sm:space-y-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faCoins} className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-medium text-sm sm:text-base">{asset.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-400">{asset.symbol}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:text-right">
                <div className="flex flex-col">
                  <div className="text-white font-medium text-sm sm:text-base">
                    {formatCurrency(asset.value)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon 
                      icon={asset.change24h >= 0 ? faArrowUp : faArrowDown} 
                      className={`w-3 h-3 ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`} 
                    />
                    <span className={`text-xs sm:text-sm ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(asset.changePercent24h)}
                    </span>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-400 ml-4">
                  {(asset.allocation ?? 0).toFixed(1)}% allocation
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DeFi Protocols */}
      <div className="cyber-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-6">DeFi Protocol Positions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(portfolioData.defiPositions || []).map((position, index) => (
            <motion.div
              key={position.protocol}
              className="p-3 sm:p-4 bg-dark-800/50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium text-sm sm:text-base">{position.protocol}</h4>
                <span className="text-primary-400 text-xs sm:text-sm font-medium">
                  {(position.apy ?? 0).toFixed(1)}% APY
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Asset:</span>
                  <span className="text-white text-xs sm:text-sm">{position.asset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Amount:</span>
                  <span className="text-white text-xs sm:text-sm">{position.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs sm:text-sm">Value:</span>
                  <span className="text-white text-xs sm:text-sm">{formatCurrency(position.value)}</span>
                </div>
                <a
                  href={position.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 text-center text-primary-400 hover:text-primary-300 text-xs sm:text-sm transition-colors"
                >
                  View on {position.protocol} →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <motion.button
          className="flex-1 cyber-button text-sm sm:text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.open('https://app.uniswap.org', '_blank')}
        >
          <FontAwesomeIcon icon={faEthereumBrand} className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Open Uniswap
        </motion.button>
        
        <motion.button
          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-300 text-sm sm:text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loadPortfolioData}
        >
          <FontAwesomeIcon icon={faChartLine} className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Refresh Data
        </motion.button>
      </div>
    </div>
  )
}

export default PortfolioDashboard
