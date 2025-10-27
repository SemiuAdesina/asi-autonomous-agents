'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEdit, faSignOutAlt, faWallet, faEnvelope, faCalendarAlt, faLock, faEye, faEyeSlash, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../contexts/AuthContext'
import { useWeb3 } from '../contexts/Web3Context'

interface UserProfileProps {
  onClose?: () => void
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, logout, updateProfile } = useAuth()
  const { account, isConnected, disconnectWallet } = useWeb3()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    wallet_address: user?.wallet_address || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [showAccountActions, setShowAccountActions] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    const success = await updateProfile(editData)
    if (success) {
      setIsEditing(false)
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    logout()
    disconnectWallet()
    if (onClose) onClose()
  }

  const handleWalletDisconnect = () => {
    disconnectWallet()
    // Update profile to remove wallet address
    updateProfile({ wallet_address: '' })
  }

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long')
      return
    }

    setIsPasswordLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        alert('Password updated successfully')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordSection(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update password')
      }
    } catch (error) {
      alert('Failed to update password')
    }
    setIsPasswordLoading(false)
  }

  const handleAccountDeletion = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    const confirmation = prompt('Type "DELETE" to confirm account deletion:')
    if (confirmation !== 'DELETE') {
      alert('Account deletion cancelled')
      return
    }

    setIsDeletingAccount(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        alert('Account deleted successfully')
        logout()
        if (onClose) onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete account')
      }
    } catch (error) {
      alert('Failed to delete account')
    }
    setIsDeletingAccount(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="cyber-card p-6 max-w-md mx-auto max-h-[90vh] overflow-y-auto"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500/20 rounded-full mb-3">
          <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-white font-orbitron mb-1">Profile</h2>
        <p className="text-gray-400 text-sm">Manage your account settings</p>
      </div>

      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Username
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.username}
              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
              className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            />
          ) : (
            <div className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white text-sm">
              {user?.username}
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Email Address
          </label>
          {isEditing ? (
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            />
          ) : (
            <div className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white flex items-center space-x-2 text-sm">
              <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-gray-400" />
              <span>{user?.email}</span>
            </div>
          )}
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Wallet Address
          </label>
          {isConnected ? (
            <div className="w-full px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faWallet} className="w-3 h-3" />
                <span className="font-mono">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
              </div>
              <button
                onClick={handleWalletDisconnect}
                className="text-red-400 hover:text-red-300 text-xs transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-gray-400 flex items-center space-x-2 text-sm">
              <FontAwesomeIcon icon={faWallet} className="w-3 h-3" />
              <span>No wallet connected</span>
            </div>
          )}
        </div>

        {/* Member Since */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Member Since
          </label>
          <div className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white flex items-center space-x-2 text-sm">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-gray-400" />
            <span>{user?.created_at ? formatDate(user.created_at) : 'Unknown'}</span>
          </div>
        </div>

        {/* Edit/Save buttons */}
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditData({
                    username: user?.username || '',
                    email: user?.email || '',
                    wallet_address: user?.wallet_address || ''
                  })
                }}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
            >
              <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Password Update Section */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full flex items-center justify-between py-3 px-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faLock} className="w-5 h-5 text-primary-400" />
              <span className="text-white font-medium">Change Password</span>
            </div>
            <FontAwesomeIcon 
              icon={showPasswordSection ? faEyeSlash : faEye} 
              className="w-4 h-4 text-gray-400" 
            />
          </button>
          
          {showPasswordSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-dark-800 rounded-lg p-3 space-y-3">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 pr-10 text-sm"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <FontAwesomeIcon icon={showPasswords.current ? faEyeSlash : faEye} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 pr-10 text-sm"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <FontAwesomeIcon icon={showPasswords.new ? faEyeSlash : faEye} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 pr-10 text-sm"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <FontAwesomeIcon icon={showPasswords.confirm ? faEyeSlash : faEye} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Update Password Button */}
                <button
                  onClick={handlePasswordUpdate}
                  disabled={isPasswordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="w-full py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  {isPasswordLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Account Management Section */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowAccountActions(!showAccountActions)}
            className="w-full flex items-center justify-between py-3 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Account Management</span>
            </div>
            <FontAwesomeIcon 
              icon={showAccountActions ? faEyeSlash : faEye} 
              className="w-4 h-4 text-red-400" 
            />
          </button>
          
          {showAccountActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-3">
                <div className="text-red-300 text-xs">
                  <p className="font-medium mb-1">⚠️ Danger Zone</p>
                  <p>These actions are permanent and cannot be undone.</p>
                </div>
                
                <button
                  onClick={handleAccountDeletion}
                  disabled={isDeletingAccount}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  {isDeletingAccount ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      <span>Delete Account</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-3 h-3" />
          <span>Logout</span>
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Your profile information is securely stored and encrypted.
        </p>
      </div>
    </motion.div>
  )
}

export default UserProfile
