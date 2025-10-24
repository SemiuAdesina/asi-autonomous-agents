'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faZap, faBrain, faNetworkWired, faUser, faSignInAlt, faComments, faWallet } from '@fortawesome/free-solid-svg-icons'
import { useMobileMenu } from '../contexts/MobileMenuContext'
import { useAuth } from '../contexts/AuthContext'
import { useAgent } from '../contexts/AgentContext'
import { useWeb3 } from '../contexts/Web3Context'
import AuthModal from './AuthModal'
import UserProfile from './UserProfile'
import WalletSelector from './WalletSelector'
import PortfolioPage from './PortfolioPage'

const Header = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu()
  const { user, isAuthenticated } = useAuth()
  const { isConnected, selectedAgent } = useAgent()
  const { isConnected: isWalletConnected, account, connectWallet, showWalletSelector, setShowWalletSelector, connectToWallet } = useWeb3()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Agents', href: '#agents', icon: faBrain },
    { name: 'Features', href: '#features', icon: faZap },
    { name: 'Network', href: '#network', icon: faNetworkWired },
  ]


  return (
    <>
      <motion.header 
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-dark-900/90 backdrop-blur-md border-b border-primary-500/20' : 'bg-transparent'
        } ${isMobileMenuOpen ? 'bg-dark-900/95 backdrop-blur-md border-b border-primary-500/20' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        animate={{ 
          height: isMobileMenuOpen ? 'auto' : '4rem',
          transition: { duration: 0.3, ease: 'easeInOut' }
        }}
      >
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faBrain} className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold glow-text" style={{ fontFamily: 'Orbitron, monospace' }}>ASI Agents</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors duration-300 text-sm"
                style={{ fontFamily: 'Exo 2, sans-serif' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                <span className="font-exo">{item.name}</span>
              </motion.a>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Chat Button - Show when agent is connected */}
            {isConnected && selectedAgent && (
              <motion.button
                onClick={() => router.push('/chat')}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 hover:text-green-300 transition-colors duration-300 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`Chat with ${selectedAgent.name}`}
              >
                <FontAwesomeIcon icon={faComments} className="w-4 h-4" />
                <span className="font-exo">Chat</span>
              </motion.button>
            )}
            
            {/* Wallet Connection Button */}
            {isWalletConnected ? (
              <motion.button
                onClick={() => setShowPortfolio(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors duration-300 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`Wallet Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}`}
              >
                <FontAwesomeIcon icon={faWallet} className="w-4 h-4" />
                <span className="font-exo">Portfolio</span>
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setShowWalletSelector(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors duration-300 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Connect your wallet to access portfolio features"
              >
                <FontAwesomeIcon icon={faWallet} className="w-4 h-4" />
                <span className="font-exo">Connect Wallet</span>
              </motion.button>
            )}
            
            {isAuthenticated ? (
              <motion.button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded-lg text-primary-400 hover:text-primary-300 transition-colors duration-300 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                <span className="font-exo">{user?.username}</span>
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-colors duration-300 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4" />
                <span className="font-exo">Sign In</span>
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-dark-800/50 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Mobile Navigation - Now part of the main container */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="py-4 space-y-2 border-t border-gray-700/50 mt-2">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-dark-800/50 transition-all duration-300"
                    style={{ fontFamily: 'Exo 2, sans-serif' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                    <span className="font-exo">{item.name}</span>
                  </motion.a>
                ))}
                
                {/* Mobile Chat Section - Show when agent is connected */}
                {isConnected && selectedAgent && (
                  <div className="border-t border-gray-700/50 pt-4 mt-4">
                    <motion.button
                      onClick={() => {
                        router.push('/chat')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:text-green-300 transition-all duration-300"
                      style={{ fontFamily: 'Exo 2, sans-serif' }}
                    >
                      <FontAwesomeIcon icon={faComments} className="w-5 h-5" />
                      <span className="font-exo">Chat with {selectedAgent.name}</span>
                    </motion.button>
                  </div>
                )}
                
                {/* Mobile Wallet Section */}
                <div className="border-t border-gray-700/50 pt-4 mt-4">
                  {isWalletConnected ? (
                    <motion.button
                      onClick={() => {
                        setShowPortfolio(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-all duration-300"
                      style={{ fontFamily: 'Exo 2, sans-serif' }}
                    >
                      <FontAwesomeIcon icon={faWallet} className="w-5 h-5" />
                      <span className="font-exo">Portfolio ({account?.slice(0, 6)}...{account?.slice(-4)})</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => {
                        setShowWalletSelector(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
                      style={{ fontFamily: 'Exo 2, sans-serif' }}
                    >
                      <FontAwesomeIcon icon={faWallet} className="w-5 h-5" />
                      <span className="font-exo">Connect Wallet</span>
                    </motion.button>
                  )}
                </div>
                
                {/* Mobile Auth Section */}
                <div className="border-t border-gray-700/50 pt-4 mt-4">
                  {isAuthenticated ? (
                    <motion.button
                      onClick={() => {
                        setShowProfile(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-500/20 border border-primary-500/30 text-primary-400 hover:text-primary-300 transition-all duration-300"
                      style={{ fontFamily: 'Exo 2, sans-serif' }}
                    >
                      <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                      <span className="font-exo">{user?.username}</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => {
                        setShowAuthModal(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-all duration-300"
                      style={{ fontFamily: 'Exo 2, sans-serif' }}
                    >
                      <FontAwesomeIcon icon={faSignInAlt} className="w-5 h-5" />
                      <span className="font-exo">Sign In</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.header>

    {/* Auth Modal */}
    <AuthModal 
      isOpen={showAuthModal} 
      onClose={() => setShowAuthModal(false)} 
    />

    {/* Profile Modal */}
    {showProfile && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={() => setShowProfile(false)}
      >
        <div 
          className="relative w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setShowProfile(false)}
            className="absolute -top-4 -right-4 z-10 w-8 h-8 bg-dark-700 hover:bg-dark-600 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
          
          <UserProfile onClose={() => setShowProfile(false)} />
        </div>
      </div>
    )}


    {/* Wallet Selector Modal */}
    <WalletSelector 
      isOpen={showWalletSelector} 
      onClose={() => setShowWalletSelector(false)}
      onSelectWallet={async (walletId) => {
        // Handle wallet selection
        console.log('Selected wallet:', walletId)
        try {
          await connectToWallet(walletId)
          setShowWalletSelector(false)
        } catch (error) {
          console.error('Failed to connect wallet:', error)
          // Keep the selector open if connection fails
        }
      }}
    />

    {/* Portfolio Page */}
    {showPortfolio && (
      <PortfolioPage onClose={() => setShowPortfolio(false)} />
    )}
  </>
  )
}

export default Header
