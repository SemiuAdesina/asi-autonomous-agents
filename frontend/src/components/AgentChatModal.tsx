'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faComments } from '@fortawesome/free-solid-svg-icons'
import { useAgent } from '../contexts/AgentContext'
import AgentChat from './AgentChat'

interface AgentChatModalProps {
  isOpen: boolean
  onClose: () => void
}

const AgentChatModal = ({ isOpen, onClose }: AgentChatModalProps) => {
  const { selectedAgent, isConnected } = useAgent()

  if (!isConnected || !selectedAgent) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            className="relative w-full max-w-4xl h-[80vh] bg-dark-900 rounded-lg shadow-2xl border border-gray-700"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faComments} className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    Chat with {selectedAgent.name}
                  </h2>
                  <p className="text-sm text-gray-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    AI-powered assistant ready to help
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <AgentChat />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AgentChatModal
