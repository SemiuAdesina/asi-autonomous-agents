'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faZap, faBrain, faNetworkWired, faShield } from '@fortawesome/free-solid-svg-icons'

const Hero = () => {
  const features = [
    { icon: faBrain, text: 'Autonomous Decision Making' },
    { icon: faNetworkWired, text: 'Decentralized Communication' },
    { icon: faShield, text: 'Secure Web3 Integration' },
    { icon: faZap, text: 'Real-time Processing' }
  ]

  return (
    <motion.section 
      className="relative min-h-[45vh] flex items-center justify-center overflow-hidden pt-8 sm:pt-12"
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
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-1 sm:mb-2"
            style={{ fontFamily: 'Orbitron, monospace' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.span 
              className="glow-text" 
              style={{ fontFamily: 'Orbitron, monospace' }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ 
                opacity: 1, 
                x: 0
              }}
              transition={{ 
                duration: 0.6, 
                delay: 0.3
              }}
            >
              ASI Autonomous
            </motion.span>
            <br />
            <motion.span 
              className="text-white font-bold" 
              style={{ fontFamily: 'Orbitron, monospace' }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Agents Platform
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-2 sm:mb-3 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0 font-medium"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience the future of decentralized AI where autonomous agents perceive, 
            reason, and act across Web3 systems with unprecedented intelligence.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-3 sm:mb-4 px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button 
              className="cyber-button group text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
              style={{ fontFamily: 'Exo 2, sans-serif' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Explore Agents</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              className="px-6 sm:px-8 py-3 sm:py-4 border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-300 text-sm sm:text-base"
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
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="cyber-card p-3 sm:p-4 md:p-6 text-center group hover:border-primary-500/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <FontAwesomeIcon icon={feature.icon} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-400 mx-auto mb-2 sm:mb-3 group-hover:text-primary-300 transition-colors" />
                <p className="text-xs sm:text-sm text-gray-300 group-hover:text-white transition-colors leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-primary-500/50 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div 
            className="w-1 h-2 sm:h-3 bg-primary-500 rounded-full mt-1 sm:mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

export default Hero