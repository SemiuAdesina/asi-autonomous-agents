'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWifi, faSync, faBell, faBellSlash, faCog, faCheckCircle, faTimesCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import io, { Socket } from 'socket.io-client'

interface RealtimeStatus {
  connected: boolean
  lastPing: string
  messageCount: number
  errorCount: number
  latency: number
}

interface RealtimeEvent {
  id: string
  type: 'message' | 'error' | 'status' | 'notification'
  timestamp: string
  data: any
  source: string
}

const RealtimeManager = () => {
  const [status, setStatus] = useState<RealtimeStatus>({
    connected: false,
    lastPing: '',
    messageCount: 0,
    errorCount: 0,
    latency: 0
  })
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoReconnect, setAutoReconnect] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Disable WebSocket for static export deployment
    // WebSockets require server support which isn't available with static sites
    console.log('WebSocket disabled for static site deployment')
    return () => {
      cleanup()
    }
  }, [])

  const initializeSocket = () => {
    try {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: autoReconnect,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      newSocket.on('connect', () => {
        console.log('WebSocket connected')
        setStatus(prev => ({
          ...prev,
          connected: true,
          lastPing: new Date().toISOString(),
          errorCount: 0
        }))
        
        addEvent({
          type: 'status',
          data: { message: 'Connected to real-time server' },
          source: 'websocket'
        })

        // Start ping monitoring
        startPingMonitoring()
        
        toast.success('Real-time connection established')
      })

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        setStatus(prev => ({
          ...prev,
          connected: false
        }))
        
        addEvent({
          type: 'status',
          data: { message: `Disconnected: ${reason}` },
          source: 'websocket'
        })

        stopPingMonitoring()
        
        if (autoReconnect) {
          toast.warning('Connection lost, attempting to reconnect...')
        } else {
          toast.error('Real-time connection lost')
        }
      })

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        setStatus(prev => ({
          ...prev,
          connected: false,
          errorCount: prev.errorCount + 1
        }))
        
        addEvent({
          type: 'error',
          data: { message: error.message, error },
          source: 'websocket'
        })

        toast.error(`Connection error: ${error.message}`)
      })

      newSocket.on('agent_response', (data) => {
        console.log('Agent response received:', data)
        setStatus(prev => ({
          ...prev,
          messageCount: prev.messageCount + 1
        }))
        
        addEvent({
          type: 'message',
          data,
          source: 'agent'
        })

        if (notificationsEnabled) {
          toast.info(`Agent ${data.agent_id} responded`)
        }
      })

      newSocket.on('agent_status_update', (data) => {
        console.log('Agent status update:', data)
        addEvent({
          type: 'status',
          data,
          source: 'agent'
        })
      })

      newSocket.on('system_notification', (data) => {
        console.log('System notification:', data)
        addEvent({
          type: 'notification',
          data,
          source: 'system'
        })

        if (notificationsEnabled) {
          toast.info(data.message || 'System notification')
        }
      })

      setSocket(newSocket)
    } catch (error) {
      console.error('Failed to initialize socket:', error)
      toast.error('Failed to initialize real-time connection')
    }
  }

  const startPingMonitoring = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }

    pingIntervalRef.current = setInterval(() => {
      if (socket?.connected) {
        const startTime = Date.now()
        socket.emit('ping', () => {
          const latency = Date.now() - startTime
          setStatus(prev => ({
            ...prev,
            latency,
            lastPing: new Date().toISOString()
          }))
        })
      }
    }, 30000) // Ping every 30 seconds
  }

  const stopPingMonitoring = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
  }

  const addEvent = (event: Omit<RealtimeEvent, 'id' | 'timestamp'>) => {
    const newEvent: RealtimeEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...event
    }
    
    setEvents(prev => [newEvent, ...prev.slice(0, 99)]) // Keep last 100 events
  }

  const cleanup = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    stopPingMonitoring()
  }

  const reconnect = () => {
    cleanup()
    setTimeout(() => {
      initializeSocket()
    }, 1000)
  }

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev)
    toast.info(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`)
  }

  const toggleAutoReconnect = () => {
    setAutoReconnect(prev => !prev)
    if (socket) {
      socket.io.opts.reconnection = !autoReconnect
    }
    toast.info(`Auto-reconnect ${!autoReconnect ? 'enabled' : 'disabled'}`)
  }

  const clearEvents = () => {
    setEvents([])
    toast.success('Event log cleared')
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-400" />
      case 'error':
        return <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 text-red-400" />
      case 'status':
        return <FontAwesomeIcon icon={faSync} className="w-4 h-4 text-blue-400" />
      case 'notification':
        return <FontAwesomeIcon icon={faBell} className="w-4 h-4 text-yellow-400" />
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 text-gray-400" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'border-green-500/30 bg-green-500/10'
      case 'error':
        return 'border-red-500/30 bg-red-500/10'
      case 'status':
        return 'border-blue-500/30 bg-blue-500/10'
      case 'notification':
        return 'border-yellow-500/30 bg-yellow-500/10'
      default:
        return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon 
              icon={faWifi} 
              className={`w-5 h-5 ${status.connected ? 'text-green-400' : 'text-red-400'}`}
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Real-time Manager</h3>
            <p className="text-gray-400 text-sm">WebSocket connection and event monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleNotifications}
            className={`p-2 rounded-lg transition-colors ${
              notificationsEnabled 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}
            title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            <FontAwesomeIcon icon={notificationsEnabled ? faBell : faBellSlash} className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleAutoReconnect}
            className={`p-2 rounded-lg transition-colors ${
              autoReconnect 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}
            title={autoReconnect ? 'Disable auto-reconnect' : 'Enable auto-reconnect'}
          >
            <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
          </button>
          
          <button
            onClick={reconnect}
            className="p-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
            title="Reconnect"
          >
            <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Status */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-lg font-semibold text-white">Connection Status</h4>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status</span>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon 
                    icon={status.connected ? faCheckCircle : faTimesCircle} 
                    className={`w-4 h-4 ${status.connected ? 'text-green-400' : 'text-red-400'}`} 
                  />
                  <span className={`text-sm font-medium ${
                    status.connected ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {status.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Latency</span>
                <span className="text-white text-sm">
                  {status.latency}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Messages</span>
                <span className="text-white text-sm">
                  {status.messageCount}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Errors</span>
                <span className="text-white text-sm">
                  {status.errorCount}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Last Ping</span>
                <span className="text-white text-sm">
                  {status.lastPing ? new Date(status.lastPing).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-dark-800 rounded-lg border border-gray-700 mt-4">
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-lg font-semibold text-white">Settings</h4>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Notifications</span>
                <button
                  onClick={toggleNotifications}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    notificationsEnabled
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {notificationsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Auto-reconnect</span>
                <button
                  onClick={toggleAutoReconnect}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    autoReconnect
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {autoReconnect ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="lg:col-span-2">
          <div className="bg-dark-800 rounded-lg border border-gray-700 h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Event Log</h4>
                <button
                  onClick={clearEvents}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto max-h-96">
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FontAwesomeIcon icon={faBell} className="w-8 h-8 mb-2" />
                  <p>No events yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getEventIcon(event.type)}
                          <span className="text-white font-medium text-sm capitalize">
                            {event.type}
                          </span>
                          <span className="text-gray-400 text-xs">
                            from {event.source}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="text-gray-300 text-sm">
                        {typeof event.data === 'string' ? (
                          event.data
                        ) : event.data.message ? (
                          event.data.message
                        ) : (
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealtimeManager
