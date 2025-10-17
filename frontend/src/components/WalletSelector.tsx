'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faTimes, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { faEthereum as faEthereumBrand } from '@fortawesome/free-brands-svg-icons'
import { toast } from 'react-toastify'

interface WalletOption {
  id: string
  name: string
  icon: any
  description: string
  installUrl: string
  isInstalled: boolean
}

interface WalletSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectWallet: (walletId: string) => void
}

const WalletSelector = ({ isOpen, onClose, onSelectWallet }: WalletSelectorProps) => {
  const [isCheckingInstallation, setIsCheckingInstallation] = useState(false)

  const wallets: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: faEthereumBrand,
      description: 'The most popular Ethereum wallet',
      installUrl: 'https://metamask.io/download/',
      isInstalled: typeof window !== 'undefined' && 
        typeof window.ethereum !== 'undefined' && 
        (window.ethereum.isMetaMask === true || 
         (window.ethereum as any).providers?.some((provider: any) => provider.isMetaMask === true))
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: faWallet,
      description: 'Secure wallet by Coinbase',
      installUrl: 'https://www.coinbase.com/wallet',
      isInstalled: typeof window !== 'undefined' && 
        typeof (window as any).coinbaseWalletExtension !== 'undefined'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: faWallet,
      description: 'Connect any wallet',
      installUrl: 'https://walletconnect.com/',
      isInstalled: false // This would need proper detection
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: faWallet,
      description: 'Beautiful Ethereum wallet',
      installUrl: 'https://rainbow.me/',
      isInstalled: typeof window !== 'undefined' && 
        typeof (window as any).rainbow !== 'undefined'
    }
  ]

  const handleWalletSelect = async (walletId: string) => {
    setIsCheckingInstallation(true)
    
    try {
      const wallet = wallets.find(w => w.id === walletId)
      
      // Real-time detection for MetaMask
      if (walletId === 'metamask') {
        const isMetaMaskInstalled = typeof window.ethereum !== 'undefined' && 
          (window.ethereum.isMetaMask === true || 
           (window.ethereum as any).providers?.some((provider: any) => provider.isMetaMask === true))
        
        console.log('MetaMask detection:', {
          ethereumExists: typeof window.ethereum !== 'undefined',
          isMetaMask: window.ethereum?.isMetaMask,
          providers: (window.ethereum as any)?.providers,
          isInstalled: isMetaMaskInstalled,
          userAgent: navigator.userAgent,
          ethereumObject: window.ethereum
        })
        
        if (!isMetaMaskInstalled) {
          toast.info(`Opening ${wallet?.name} installation page...`)
          window.open(wallet?.installUrl, '_blank')
          return
        }
        
        // MetaMask is detected, proceed with connection
        console.log('MetaMask detected successfully, proceeding with connection...')
        toast.success('MetaMask detected! Connecting...')
      }
      
      // For other wallets, use the pre-detected status
      if (!wallet?.isInstalled) {
        toast.info(`Opening ${wallet?.name} installation page...`)
        window.open(wallet?.installUrl, '_blank')
        return
      }

      // Connect to the selected wallet
      onSelectWallet(walletId)
    } catch (error) {
      console.error('Error selecting wallet:', error)
    } finally {
      setIsCheckingInstallation(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-dark-900 border border-primary-500/30 rounded-xl p-6 w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white font-orbitron">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>
          </div>

          {/* Wallet Options */}
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <motion.button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={isCheckingInstallation}
                className="w-full p-4 bg-dark-800/50 hover:bg-primary-500/20 border border-gray-700/50 hover:border-primary-500/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FontAwesomeIcon 
                      icon={wallet.icon} 
                      className="w-6 h-6 text-primary-400 group-hover:text-primary-300" 
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-medium group-hover:text-primary-300 font-exo">
                        {wallet.name}
                      </h3>
                      {wallet.isInstalled ? (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          Installed
                        </span>
                      ) : (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                          Not Installed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">
                      {wallet.description}
                    </p>
                    {!wallet.isInstalled && (
                      <p className="text-xs text-orange-400 mt-1">
                        Click to install {wallet.name}
                      </p>
                    )}
                  </div>
                  {!wallet.isInstalled && (
                    <FontAwesomeIcon 
                      icon={faExternalLinkAlt} 
                      className="w-4 h-4 text-gray-400 group-hover:text-primary-400" 
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 text-center">
              By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WalletSelector
