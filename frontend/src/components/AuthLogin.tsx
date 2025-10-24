'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faSignInAlt, faUser, faLock } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../contexts/AuthContext'
import { useWeb3 } from '../contexts/Web3Context'

interface AuthLoginProps {
  onSwitchToRegister: () => void
  onClose?: () => void
}

const AuthLogin: React.FC<AuthLoginProps> = ({ onSwitchToRegister, onClose }) => {
  const { login, isLoading } = useAuth()
  const { account, isConnected } = useWeb3()
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields')
      return
    }

    const success = await login(usernameOrEmail, password)
    if (success && onClose) {
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="cyber-card p-8 max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-4">
          <FontAwesomeIcon icon={faSignInAlt} className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white font-orbitron mb-2">Welcome Back</h2>
        <p className="text-gray-400">Sign in to your ASI Agents account</p>
      </div>

      {isConnected && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center space-x-2 text-green-400">
            <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
            <span className="text-sm font-medium">Wallet Connected</span>
          </div>
          <p className="text-green-300 text-sm mt-1">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-300 mb-2">
            Username or Email
          </label>
          <div className="relative">
            <input
              type="text"
              id="usernameOrEmail"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Enter your username or email"
              required
            />
            <FontAwesomeIcon 
              icon={faUser} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 pr-12"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
            </button>
            <FontAwesomeIcon 
              icon={faLock} 
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Create Account
          </button>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          Your wallet connection enhances security and enables Web3 features.
        </p>
      </div>
    </motion.div>
  )
}

export default AuthLogin
