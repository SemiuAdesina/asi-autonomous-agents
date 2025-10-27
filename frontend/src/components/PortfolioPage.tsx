'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faWallet, faChartLine, faCoins, faShieldAlt, faUsers, faExchangeAlt, faBrain, faHistory, faBars, faTimes, faChevronLeft, faChevronRight, faSquare, faArrowRight, faNetworkWired, faRocket, faCogs, faComments, faWifi } from '@fortawesome/free-solid-svg-icons'
import { useWeb3 } from '../contexts/Web3Context'
import { useAuth } from '../contexts/AuthContext'
import PortfolioDashboard from './PortfolioDashboard'
import DeFiProtocols from './DeFiProtocols'
import MultiSigWalletManager from './MultiSigWalletManager'
import SmartContractAuditor from './SmartContractAuditor'
import Web3Integration from './Web3Integration'
import TransactionMonitor from './TransactionMonitor'
import KnowledgeManager from './KnowledgeManager'
import SessionManager from './SessionManager'
import MultiAgentDashboard from './MultiAgentDashboard'
import AgentverseRegistry from './AgentverseRegistry'
import AgentCoordinator from './AgentCoordinator'
import ChatProtocolManager from './ChatProtocolManager'
import RealtimeManager from './RealtimeManager'
import LearningAnalytics from './LearningAnalytics'

interface PortfolioPageProps {
  onClose: () => void
}

const PortfolioPage = ({ onClose }: PortfolioPageProps) => {
  const { account, balance, disconnectWallet } = useWeb3()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const tabs = [
    { id: 'overview', name: 'Portfolio Overview', icon: faChartLine },
    { id: 'defi', name: 'DeFi Protocols', icon: faCoins },
    { id: 'multisig', name: 'MultiSig Wallets', icon: faUsers },
    { id: 'auditor', name: 'Contract Auditor', icon: faShieldAlt },
    { id: 'integration', name: 'Web3 Integration', icon: faWallet },
    { id: 'transactions', name: 'Transaction Monitor', icon: faExchangeAlt },
    { id: 'knowledge', name: 'Knowledge Manager', icon: faBrain },
    { id: 'sessions', name: 'Session Manager', icon: faHistory },
    { id: 'multiagent', name: 'Multi-Agent Communication', icon: faNetworkWired },
    { id: 'agentverse', name: 'Agentverse Registry', icon: faRocket },
    { id: 'coordinator', name: 'Agent Coordinator', icon: faCogs },
    { id: 'learning', name: 'Dynamic Learning', icon: faBrain },
    { id: 'chatprotocol', name: 'Chat Protocol', icon: faComments },
    { id: 'realtime', name: 'Real-time Manager', icon: faWifi },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PortfolioDashboard />
      case 'defi':
        return <DeFiProtocols />
      case 'multisig':
        return <MultiSigWalletManager />
      case 'auditor':
        return <SmartContractAuditor />
      case 'integration':
        return <Web3Integration />
      case 'transactions':
        return <TransactionMonitor />
      case 'knowledge':
        return <KnowledgeManager />
      case 'sessions':
        return <SessionManager />
      case 'multiagent':
        return <MultiAgentDashboard />
      case 'agentverse':
        return <AgentverseRegistry />
      case 'coordinator':
        return <AgentCoordinator />
      case 'learning':
        return <LearningAnalytics />
      case 'chatprotocol':
        return <ChatProtocolManager />
      case 'realtime':
        return <RealtimeManager />
      default:
        return <PortfolioDashboard />
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-dark-900 overflow-hidden">
      {/* Header */}
      <div className="bg-dark-800 border-b border-gray-700 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors duration-200 flex-shrink-0"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-white truncate" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                Portfolio Dashboard
              </h1>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FontAwesomeIcon icon={faWallet} className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400 flex-shrink-0" />
                <p className="text-gray-400 text-xs sm:text-sm truncate" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {formatAddress(account || '')} • {user?.username || 'User'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors duration-200"
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            
            {/* Desktop wallet info */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Wallet Balance</p>
                <p className="text-lg font-semibold text-white">{balance || '0.00 ETH'}</p>
              </div>
              <button
                onClick={disconnectWallet}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors duration-200 text-sm flex items-center space-x-2 group relative"
                title="Disconnect wallet"
              >
                <FontAwesomeIcon icon={faWallet} className="w-3 h-3" />
                <span>Disconnect</span>
                {/* Desktop tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Disconnect wallet
                </div>
              </button>
            </div>
            
            {/* Mobile wallet info */}
            <div className="lg:hidden">
              <button
                onClick={disconnectWallet}
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors duration-200 text-xs flex items-center space-x-1 group relative"
                title="Disconnect wallet"
              >
                <FontAwesomeIcon icon={faWallet} className="w-2 h-2 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Disconnect</span>
                {/* Mobile tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Disconnect wallet
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile wallet balance */}
        <div className="lg:hidden mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faChartLine} className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" />
              <span className="text-xs sm:text-sm text-gray-400">Wallet Balance</span>
            </div>
            <span className="text-base sm:text-lg font-semibold text-white">{balance || '0.00 ETH'}</span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)]">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block bg-dark-800 border-r border-gray-700 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4">
            {/* Sidebar Toggle Button */}
            <div className="flex items-center justify-between mb-4">
              {!isSidebarCollapsed && (
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Portfolio Tools
                </h3>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors duration-200 group relative"
                title={isSidebarCollapsed ? 'Opening menu' : 'Closing menu'}
              >
                {/* ChatGPT-style layout icon with two columns */}
                <div className="w-4 h-4 group-hover:opacity-0 transition-opacity duration-200 relative">
                  <div className="w-full h-full border border-blue-400 rounded-sm relative">
                    {/* Left column (sidebar) */}
                    <div className="absolute left-0 top-0 w-1 h-full border-r border-blue-400"></div>
                    {/* Vertical divider line */}
                    <div className="absolute left-1 top-0 w-px h-full bg-blue-400"></div>
                  </div>
                </div>
                
                {/* Hover arrow - shows appropriate direction */}
                <FontAwesomeIcon 
                  icon={isSidebarCollapsed ? faArrowRight : faArrowLeft} 
                  className="w-4 h-4 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:scale-110 transition-transform duration-200" 
                />

                {/* Simple hover text */}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {isSidebarCollapsed ? 'Opening menu' : 'Closing menu'}
                </div>
              </button>
            </div>
            
            <nav className="space-y-1 sm:space-y-2">
              {tabs.map((tab, index) => (
                <React.Fragment key={tab.id}>
                  {/* Add a faint divider line between items */}
                  {index > 0 && (
                    <div className="border-t border-gray-700/30 my-1"></div>
                  )}
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-left transition-colors duration-200 group ${
                      activeTab === tab.id
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-dark-700/50'
                    }`}
                    title={isSidebarCollapsed ? tab.name : ''}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="text-xs sm:text-sm font-medium truncate">{tab.name}</span>
                    )}
                  </button>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 sm:w-72 bg-dark-800 border-r border-gray-700 overflow-y-auto">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Portfolio Tools
                  </h3>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <nav className="space-y-1 sm:space-y-2">
                  {tabs.map((tab, index) => (
                    <React.Fragment key={tab.id}>
                      {/* Add a faint divider line between items */}
                      {index > 0 && (
                        <div className="border-t border-gray-700/30 my-1"></div>
                      )}
                      <button
                        onClick={() => {
                          setActiveTab(tab.id)
                          setIsMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-left transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'text-gray-300 hover:text-white hover:bg-dark-700/50'
                        }`}
                      >
                        <FontAwesomeIcon icon={tab.icon} className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">{tab.name}</span>
                      </button>
                    </React.Fragment>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-dark-900">
          <div className="p-4 sm:p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioPage
