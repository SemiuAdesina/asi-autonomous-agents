'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRobot, faHeartbeat, faTruck, faCoins } from '@fortawesome/free-solid-svg-icons'
import { useAgent } from '../contexts/AgentContext'
import { AgentLoading } from './LoadingSpinner'

const AgentGrid = () => {
  const { agents, connectAgent, isConnected, selectedAgent, discoverAgents, isDiscovering } = useAgent()

  const getAgentIcon = (agentName: string) => {
    const iconMap: { [key: string]: any } = {
      'Healthcare Assistant': faHeartbeat,
      'Logistics Coordinator': faTruck,
      'Financial Advisor': faCoins
    }
    return iconMap[agentName] || faRobot
  }

  return (
    <section id="agents" className="py-20 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
              <span className="glow-text">Autonomous Agents</span>
            </h2>
            <button
              onClick={discoverAgents}
              disabled={isDiscovering}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              style={{ fontFamily: 'Exo 2, sans-serif' }}
            >
              <FontAwesomeIcon 
                icon={faRobot} 
                className={`w-4 h-4 ${isDiscovering ? 'animate-spin' : ''}`} 
              />
              {isDiscovering ? 'Discovering...' : 'Refresh'}
            </button>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Meet our intelligent agents, each specialized in different domains and 
            capable of autonomous decision-making across decentralized systems.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isDiscovering ? (
            <AgentLoading message="Discovering agents from Fetch.ai network..." />
          ) : agents.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="text-center">
                <FontAwesomeIcon icon={faRobot} className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-gray-400">No agents found. Click refresh to discover agents.</p>
              </div>
            </div>
          ) : (
            agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              className="cyber-card p-6 group hover:border-primary-500/50 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-4">
                  <FontAwesomeIcon icon={getAgentIcon(agent.name)} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-primary-300 transition-colors" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-mono" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {agent.address.slice(0, 8)}...{agent.address.slice(-8)}
                  </p>
                </div>
              </div>

              <p className="text-gray-300 mb-4 leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {agent.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  agent.status === 'active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {agent.status}
                </span>
                <button 
                  className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                  style={{ fontFamily: 'Exo 2, sans-serif' }}
                  onClick={() => connectAgent(agent.id.toString())}
                >
                  {selectedAgent?.id === agent.id.toString() && isConnected ? 'Connected' : 'Connect'}
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400" style={{ fontFamily: 'Exo 2, sans-serif' }}>Capabilities:</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((capability, capIndex) => (
                    <span
                      key={capIndex}
                      className="px-2 py-1 bg-dark-700/50 text-xs text-gray-300 rounded border border-gray-600/30"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default AgentGrid
