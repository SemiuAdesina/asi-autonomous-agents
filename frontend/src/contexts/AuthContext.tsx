'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-toastify'
import apiService from '../services/api'

interface User {
  id: number
  username: string
  email: string
  wallet_address?: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null

  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string, walletAddress?: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: { username?: string; email?: string; wallet_address?: string }) => Promise<boolean>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        console.log('🔐 Loading user from localStorage, token:', token ? 'exists' : 'not found')
        
        if (token) {
          setToken(token)
          apiService.setToken(token)
          // Verify token with backend (with timeout)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
          
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
          
            console.log('🔐 Profile response status:', response.status)
            
            if (response.ok) {
              const userData = await response.json()
              console.log('🔐 Profile data received:', userData)
              setUser(userData.user)
            } else {
              console.log('🔐 Token invalid, removing from localStorage')
              // Token is invalid, remove it
              localStorage.removeItem('auth_token')
              setToken(null)
            }
          } catch (fetchError: any) {
            clearTimeout(timeoutId)
            if (fetchError.name === 'AbortError') {
              console.log('🔐 Profile request timed out')
            } else {
              console.error('🔐 Error fetching profile:', fetchError)
            }
            // Don't remove token on timeout - keep it for offline use
          }
        }
      } catch (error) {
        console.error('🔐 Error loading user:', error)
        localStorage.removeItem('auth_token')
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const data = await apiService.login({ username: email, password })
      const token = data.access_token
      
      console.log('🔐 Login successful, storing token:', token ? 'exists' : 'not found')
      
      // Store token and set in API service
      localStorage.setItem('auth_token', token)
      setToken(token)
      apiService.setToken(token)
      
      // Set user data from login response
      const userData = {
        id: data.user_id,
        username: data.username,
        email: data.email,
        wallet_address: data.wallet_address,
        is_active: true,
        created_at: new Date().toISOString()
      }
      
      console.log('🔐 Setting user data:', userData)
      setUser(userData)
      
      toast.success('Login successful!')
      return true
    } catch (error: any) {
      console.error('🔐 Login error:', error)
      toast.error(error.message || 'Login failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string, walletAddress?: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const data = await apiService.register({ username, email, password, wallet_address: walletAddress })
      
      toast.success('Registration successful! Please log in.')
      return true
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    apiService.setToken('')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateProfile = async (data: { username?: string; email?: string; wallet_address?: string }): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return false

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const updatedData = await response.json()
        setUser(updatedData.user)
        toast.success('Profile updated successfully!')
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Profile update failed')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Profile update failed. Please try again.')
    }
    
    return false
  }

  const refreshProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
