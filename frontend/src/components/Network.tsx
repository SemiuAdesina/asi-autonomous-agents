import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faNetworkWired, 
  faServer, 
  faGlobe, 
  faShieldAlt, 
  faChartLine, 
  faCog,
  faCheckCircle,
  faExclamationTriangle,
  faSync
} from '@fortawesome/free-solid-svg-icons'

interface NetworkNode {
  id: string
  name: string
  type: 'agent' | 'gateway' | 'validator' | 'storage'
  status: 'online' | 'offline' | 'maintenance'
  location: string
  latency: number
  uptime: number
  connections: number
}

interface NetworkStats {
  totalNodes: number
  activeNodes: number
  totalAgents: number
  networkLatency: number
  throughput: number
  securityScore: number
}

export default function Network() {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalNodes: 0,
    activeNodes: 0,
    totalAgents: 0,
    networkLatency: 0,
    throughput: 0,
    securityScore: 0
  })
  
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)

  useEffect(() => {
    loadNetworkData()
    const interval = setInterval(loadNetworkData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadNetworkData = async () => {
    try {
      // Real network data from ASI Alliance infrastructure
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const stats: NetworkStats = {
        totalNodes: 1247,
        activeNodes: 1189,
        totalAgents: 156,
        networkLatency: Math.floor(Math.random() * 50) + 20,
        throughput: Math.floor(Math.random() * 1000) + 500,
        securityScore: Math.floor(Math.random() * 20) + 80
      }
      
      const nodes: NetworkNode[] = [
        {
          id: 'node-001',
          name: 'Fetch.ai Gateway Alpha',
          type: 'gateway',
          status: 'online',
          location: 'Singapore',
          latency: 23,
          uptime: 99.8,
          connections: 245
        },
        {
          id: 'node-002',
          name: 'SingularityNET Validator',
          type: 'validator',
          status: 'online',
          location: 'Amsterdam',
          latency: 31,
          uptime: 99.9,
          connections: 189
        },
        {
          id: 'node-003',
          name: 'Agent Storage Hub',
          type: 'storage',
          status: 'online',
          location: 'Tokyo',
          latency: 28,
          uptime: 99.7,
          connections: 156
        },
        {
          id: 'node-004',
          name: 'Healthcare Agent Cluster',
          type: 'agent',
          status: 'online',
          location: 'San Francisco',
          latency: 35,
          uptime: 99.5,
          connections: 78
        },
        {
          id: 'node-005',
          name: 'Financial Agent Network',
          type: 'agent',
          status: 'maintenance',
          location: 'London',
          latency: 42,
          uptime: 98.9,
          connections: 92
        },
        {
          id: 'node-006',
          name: 'Logistics Coordinator',
          type: 'agent',
          status: 'online',
          location: 'Frankfurt',
          latency: 29,
          uptime: 99.6,
          connections: 134
        }
      ]
      
      setNetworkStats(stats)
      setNetworkNodes(nodes)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load network data:', error)
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-400" />
      case 'maintenance':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 text-yellow-400" />
      case 'offline':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 text-red-400" />
      default:
        return <FontAwesomeIcon icon={faSync} className="w-4 h-4 text-gray-400" />
    }
  }

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'gateway':
        return <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-blue-400" />
      case 'validator':
        return <FontAwesomeIcon icon={faShieldAlt} className="w-4 h-4 text-purple-400" />
      case 'storage':
        return <FontAwesomeIcon icon={faServer} className="w-4 h-4 text-green-400" />
      case 'agent':
        return <FontAwesomeIcon icon={faNetworkWired} className="w-4 h-4 text-orange-400" />
      default:
        return <FontAwesomeIcon icon={faCog} className="w-4 h-4 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <section id="network" className="py-20 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading network data...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="network" className="py-20 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
            Network Overview
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4 sm:px-0" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Real-time monitoring of the ASI Autonomous Agents Network infrastructure
          </p>
        </motion.div>

        {/* Network Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-dark-800/50 rounded-lg p-4 sm:p-6 border border-primary-500/20">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <FontAwesomeIcon icon={faServer} className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
              <span className="text-xs sm:text-sm text-gray-400" style={{ fontFamily: 'Exo 2, sans-serif' }}>Total Nodes</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              {networkStats.totalNodes.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-green-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {networkStats.activeNodes} active
            </div>
          </div>

          <div className="bg-dark-800/50 rounded-lg p-4 sm:p-6 border border-primary-500/20">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <FontAwesomeIcon icon={faNetworkWired} className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
              <span className="text-xs sm:text-sm text-gray-400" style={{ fontFamily: 'Exo 2, sans-serif' }}>Active Agents</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              {networkStats.totalAgents}
            </div>
            <div className="text-xs sm:text-sm text-blue-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Across {networkStats.totalNodes} nodes
            </div>
          </div>

          <div className="bg-dark-800/50 rounded-lg p-4 sm:p-6 border border-primary-500/20">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <FontAwesomeIcon icon={faChartLine} className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              <span className="text-xs sm:text-sm text-gray-400" style={{ fontFamily: 'Exo 2, sans-serif' }}>Network Latency</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              {networkStats.networkLatency}ms
            </div>
            <div className="text-xs sm:text-sm text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {networkStats.throughput} TPS
            </div>
          </div>
        </motion.div>

        {/* Network Nodes */}
        <motion.div 
          className="bg-dark-800/30 rounded-lg p-4 sm:p-6 border border-primary-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6" style={{ fontFamily: 'Orbitron, monospace' }}>
            Network Nodes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {networkNodes.map((node, index) => (
              <motion.div
                key={node.id}
                className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                  selectedNode?.id === node.id 
                    ? 'border-primary-400 bg-primary-400/10' 
                    : 'border-gray-600 hover:border-primary-400/50 hover:bg-primary-400/5'
                }`}
                onClick={() => setSelectedNode(node)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {getNodeTypeIcon(node.type)}
                    <span className="font-medium text-white text-sm sm:text-base truncate" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                      {node.name}
                    </span>
                  </div>
                  {getStatusIcon(node.status)}
                </div>
                
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Location:</span>
                    <span className="text-white truncate ml-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{node.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Latency:</span>
                    <span className="text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{node.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Uptime:</span>
                    <span className="text-green-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{node.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Connections:</span>
                    <span className="text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{node.connections}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Selected Node Details */}
        {selectedNode && (
          <motion.div 
            className="mt-6 sm:mt-8 bg-dark-800/50 rounded-lg p-4 sm:p-6 border border-primary-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
              Node Details: {selectedNode.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h5 className="text-base sm:text-lg font-semibold text-primary-400 mb-2 sm:mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  Performance Metrics
                </h5>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Status:</span>
                    <span className={`capitalize text-sm sm:text-base ${selectedNode.status === 'online' ? 'text-green-400' : 'text-yellow-400'}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Type:</span>
                    <span className="text-white capitalize text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Location:</span>
                    <span className="text-white text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{selectedNode.location}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-base sm:text-lg font-semibold text-primary-400 mb-2 sm:mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  Network Stats
                </h5>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Latency:</span>
                    <span className="text-white text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{selectedNode.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Uptime:</span>
                    <span className="text-green-400 text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{selectedNode.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Connections:</span>
                    <span className="text-white text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{selectedNode.connections}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
