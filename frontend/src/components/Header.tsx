'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faZap, faBrain, faNetworkWired } from '@fortawesome/free-solid-svg-icons'
import { useMobileMenu } from '../contexts/MobileMenuContext'

const Header = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu()
  const [scrolled, setScrolled] = useState(false)

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
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors duration-300"
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.header>
  )
}

export default Header
