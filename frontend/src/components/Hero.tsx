'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faZap, faBrain, faNetworkWired, faShield } from '@fortawesome/free-solid-svg-icons'
import { useMobileMenu } from '../contexts/MobileMenuContext'

const Hero = () => {
  const { isMobileMenuOpen } = useMobileMenu()
  const features = [
    { icon: faBrain, text: 'Autonomous Decision Making' },
    { icon: faNetworkWired, text: 'Decentralized Communication' },
    { icon: faShield, text: 'Secure Web3 Integration' },
    { icon: faZap, text: 'Real-time Processing' }
  ]

  return (
    <motion.section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      animate={{ 
        paddingTop: isMobileMenuOpen ? '12rem' : '4rem',
        transition: { duration: 0.3, ease: 'easeInOut' }
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-20" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{ fontFamily: 'Orbitron, monospace' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="glow-text" style={{ fontFamily: 'Orbitron, monospace' }}>ASI Autonomous</span>
            <br />
            <span className="text-white" style={{ fontFamily: 'Orbitron, monospace' }}>Agents Platform</span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience the future of decentralized AI where autonomous agents perceive, 
            reason, and act across Web3 systems with unprecedented intelligence.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button 
              className="cyber-button group"
              style={{ fontFamily: 'Exo 2, sans-serif' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Explore Agents</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              className="px-8 py-3 border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-300"
              style={{ fontFamily: 'Exo 2, sans-serif' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://docs.fetch.ai/', '_blank')}
            >
              View Documentation
            </motion.button>
          </motion.div>

          {/* Feature Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="cyber-card p-6 text-center group hover:border-primary-500/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <FontAwesomeIcon icon={feature.icon} className="w-8 h-8 text-primary-400 mx-auto mb-3 group-hover:text-primary-300 transition-colors" />
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-primary-500/50 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div 
            className="w-1 h-3 bg-primary-500 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

export default Hero