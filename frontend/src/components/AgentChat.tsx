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
      <div className="cyber-card p-8 text-center">
        <FontAwesomeIcon icon={faRobot} className="w-16 h-16 text-primary-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2 font-orbitron">No Agent Selected</h3>
        <p className="text-gray-300 font-rajdhani">
          Choose an agent from the grid above to start a conversation
        </p>
      </div>
    )
  }

  return (
    <div className="cyber-card h-96 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faBrain} className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white font-exo">{selectedAgent.name}</h3>
            <p className="text-sm text-gray-400 font-mono">
              {selectedAgent.address.slice(0, 8)}...{selectedAgent.address.slice(-8)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {isConnected && (
            <button
              onClick={disconnectAgent}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <FontAwesomeIcon icon={faComments} className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <FontAwesomeIcon icon={faComments} className="w-8 h-8 mb-2" />
            <p>Start a conversation with {selectedAgent.name}</p>
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <FontAwesomeIcon
                    icon={message.sender === 'user' ? faUser : faBrain}
                    className="w-3 h-3"
                  />
                  <span className="text-xs opacity-75">
                    {message.sender === 'user' ? 'You' : selectedAgent.name}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
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
            <div className="bg-dark-700 text-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faBrain} className="w-3 h-3" />
                <span className="text-sm">{selectedAgent.name} is typing...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-primary-500/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${selectedAgent.name}...`}
            className="flex-1 cyber-input"
            disabled={!isConnected}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isConnected}
            className="cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default AgentChat
