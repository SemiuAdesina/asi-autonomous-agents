import Head from 'next/head'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import AgentChat from '../components/AgentChat'
import MatrixBackground from '../components/MatrixBackground'
import { MobileMenuProvider } from '../contexts/MobileMenuContext'
import { useAgent } from '../contexts/AgentContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faRobot } from '@fortawesome/free-solid-svg-icons'

export default function ChatPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  const { selectedAgent, isConnected } = useAgent()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <MobileMenuProvider>
      <Head>
        <title>Chat - ASI Autonomous Agents Platform</title>
        <meta name="description" content="Chat with your AI agent" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%233B82F6'/><stop offset='100%' style='stop-color:%231D4ED8'/></defs><rect width='32' height='32' rx='6' fill='url(%23grad)'/><path d='M8 10h16c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2z' fill='white' opacity='0.9'/><circle cx='12' cy='16' r='2' fill='url(%23grad)'/><circle cx='20' cy='16' r='2' fill='url(%23grad)'/><rect x='12' y='18' width='8' height='2' rx='1' fill='url(%23grad)'/><path d='M14 6h4v2h-4z' fill='white' opacity='0.7'/></svg>" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
      </Head>

      <MatrixBackground />
      
      <motion.main 
        className="relative z-10 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <Header />
        
        {/* Chat Page Content */}
        <div className="pt-16 sm:pt-20 pb-4 sm:pb-8">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
            {/* Back Button */}
            <motion.button
              onClick={handleBackToHome}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-300 hover:text-primary-400 transition-colors duration-300 mb-4 sm:mb-6 text-sm sm:text-base"
              style={{ fontFamily: 'Exo 2, sans-serif' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Back to Home</span>
            </motion.button>

            {/* Page Header */}
            <motion.div
              className="text-center mb-6 sm:mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
                Agent Chat
              </h1>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg px-4 sm:px-0" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Communicate with your AI agent in real-time
              </p>
            </motion.div>

            {/* Chat Container */}
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {!isConnected || !selectedAgent ? (
                <div className="cyber-card p-6 sm:p-8 lg:p-12 text-center">
                  <FontAwesomeIcon icon={faRobot} className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary-400 mb-4 sm:mb-6" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3 sm:mb-4 font-orbitron">No Agent Connected</h3>
                  <p className="text-gray-300 font-rajdhani text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
                    Please connect to an agent from the home page to start chatting
                  </p>
                  <motion.button
                    onClick={handleBackToHome}
                    className="cyber-button text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Go to Home
                  </motion.button>
                </div>
              ) : (
                <div className="cyber-card h-[60vh] sm:h-[65vh] lg:h-[70vh]">
                  <AgentChat />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.main>
    </MobileMenuProvider>
  )
}
