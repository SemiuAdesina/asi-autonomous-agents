'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRobot, faComments, faPaperPlane, faUser, faBrain } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect, useRef } from 'react'
import { useAgent } from '../contexts/AgentContext'
import { toast } from 'react-toastify'

const AgentChat = () => {
  const { selectedAgent, isConnected, sendMessage, messages, disconnectAgent } = useAgent()
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isConnected) return

    setIsTyping(true)
    try {
      await sendMessage(inputMessage)
      setInputMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!selectedAgent) {
    return (
      <div className="cyber-card p-4 sm:p-6 lg:p-8 text-center">
        <FontAwesomeIcon icon={faRobot} className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-primary-400 mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 font-orbitron">No Agent Selected</h3>
        <p className="text-gray-300 font-rajdhani text-sm sm:text-base">
          Choose an agent from the grid above to start a conversation
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-primary-500/20">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faBrain} className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-white font-exo truncate">{selectedAgent.name}</h3>
            <p className="text-xs sm:text-sm text-gray-400 font-mono truncate">
              {selectedAgent.address.slice(0, 8)}...{selectedAgent.address.slice(-8)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className="text-xs text-gray-300 sm:hidden">
            {isConnected ? 'On' : 'Off'}
          </span>
          {isConnected && (
            <button
              onClick={disconnectAgent}
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
              title="Disconnect"
            >
              <FontAwesomeIcon icon={faComments} className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-6 sm:py-8">
            <FontAwesomeIcon icon={faComments} className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
            <p className="text-sm sm:text-base">Start a conversation with {selectedAgent.name}</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-100'
                }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                  <FontAwesomeIcon
                    icon={message.sender === 'user' ? faUser : faBrain}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                  />
                  <span className="text-xs opacity-75">
                    {message.sender === 'user' ? 'You' : selectedAgent.name}
                  </span>
                </div>
                <p className="text-xs sm:text-sm break-words">{message.content}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))
        )}
        
        {isTyping && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-dark-700 text-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FontAwesomeIcon icon={faBrain} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="text-xs sm:text-sm">{selectedAgent.name} is typing...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-primary-500/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${selectedAgent.name}...`}
            className="flex-1 cyber-input text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
            disabled={!isConnected}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isConnected}
            className="cyber-button disabled:opacity-50 disabled:cursor-not-allowed px-3 sm:px-4 py-2 sm:py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faPaperPlane} className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default AgentChat
