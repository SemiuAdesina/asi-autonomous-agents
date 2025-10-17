'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRobot, faSpinner } from '@fortawesome/free-solid-svg-icons'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} text-primary-400 mb-2`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <FontAwesomeIcon icon={faSpinner} className="w-full h-full" />
      </motion.div>
      
      <motion.p 
        className={`text-gray-300 ${textSizeClasses[size]} font-medium`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  )
}

interface PageLoadingProps {
  message?: string
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = 'Loading application...' 
}) => {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <FontAwesomeIcon icon={faRobot} className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          ASI Autonomous Agents
        </h2>
        
        <LoadingSpinner message={message} size="md" />
      </div>
    </div>
  )
}

interface AgentLoadingProps {
  message?: string
}

export const AgentLoading: React.FC<AgentLoadingProps> = ({ 
  message = 'Discovering agents from Fetch.ai network...' 
}) => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="text-center">
        <motion.div
          className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <FontAwesomeIcon icon={faRobot} className="w-6 h-6 text-primary-400" />
        </motion.div>
        
        <LoadingSpinner message={message} size="sm" />
      </div>
    </div>
  )
}

export default LoadingSpinner
