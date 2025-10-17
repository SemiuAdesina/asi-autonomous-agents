'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-toastify'

interface Web3ContextType {
  isConnected: boolean
  account: string | null
  chainId: number | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  balance: string | null
  isLoading: boolean
  showWalletSelector: boolean
  setShowWalletSelector: (show: boolean) => void
  connectToWallet: (walletId: string) => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  // Initialize state with localStorage values for persistence
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)

  // Load wallet state from localStorage on mount
  useEffect(() => {
    const loadWalletState = async () => {
      try {
        const savedAccount = localStorage.getItem('wallet_account')
        const savedChainId = localStorage.getItem('wallet_chainId')
        const savedBalance = localStorage.getItem('wallet_balance')
        const savedConnection = localStorage.getItem('wallet_connected')

        if (savedConnection === 'true' && savedAccount) {
          // Check if wallet is still connected
          if (typeof window.ethereum !== 'undefined') {
            try {
              const accounts = await window.ethereum.request({ method: 'eth_accounts' })
              const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
              
              if (accounts.length > 0 && accounts[0].toLowerCase() === savedAccount.toLowerCase()) {
                // Wallet is still connected, restore state
                setAccount(savedAccount)
                setChainId(savedChainId ? parseInt(savedChainId) : parseInt(currentChainId, 16))
                setBalance(savedBalance)
                setIsConnected(true)
                
                // Update balance if available
                if (savedBalance) {
                  await updateBalance(savedAccount)
                }
                
                // Show a subtle notification that wallet was restored
                toast.info(`Wallet restored: ${savedAccount.slice(0, 6)}...${savedAccount.slice(-4)}`, {
                  autoClose: 2000,
                  hideProgressBar: true
                })
              } else {
                // Wallet disconnected, clear localStorage
                localStorage.removeItem('wallet_account')
                localStorage.removeItem('wallet_chainId')
                localStorage.removeItem('wallet_balance')
                localStorage.removeItem('wallet_connected')
              }
            } catch (error) {
              console.error('Error checking wallet connection:', error)
              // Clear localStorage if there's an error
              localStorage.removeItem('wallet_account')
              localStorage.removeItem('wallet_chainId')
              localStorage.removeItem('wallet_balance')
              localStorage.removeItem('wallet_connected')
            }
          } else {
            // No wallet extension, clear localStorage
            localStorage.removeItem('wallet_account')
            localStorage.removeItem('wallet_chainId')
            localStorage.removeItem('wallet_balance')
            localStorage.removeItem('wallet_connected')
          }
        }
      } catch (error) {
        console.error('Error loading wallet state:', error)
      }
    }

    loadWalletState()
  }, [])

  // Save wallet state to localStorage whenever it changes
  useEffect(() => {
    if (account && isConnected) {
      localStorage.setItem('wallet_account', account)
      localStorage.setItem('wallet_chainId', chainId?.toString() || '')
      localStorage.setItem('wallet_balance', balance || '')
      localStorage.setItem('wallet_connected', 'true')
    } else {
      localStorage.removeItem('wallet_account')
      localStorage.removeItem('wallet_chainId')
      localStorage.removeItem('wallet_balance')
      localStorage.removeItem('wallet_connected')
    }
  }, [account, chainId, balance, isConnected])

  const connectWallet = async () => {
    // Show wallet selector instead of directly connecting
    setShowWalletSelector(true)
  }

  const connectToWallet = async (walletId: string) => {
    setIsLoading(true)
    setShowWalletSelector(false)
    
    try {
      switch (walletId) {
        case 'metamask':
          await connectMetaMask()
          break
        case 'coinbase':
          await connectCoinbaseWallet()
          break
        case 'walletconnect':
          await connectWalletConnect()
          break
        case 'rainbow':
          await connectRainbow()
          break
        default:
          toast.error('Unsupported wallet type')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectMetaMask = async () => {
    try {
      // Check if MetaMask is installed with robust detection
      const isMetaMaskInstalled = typeof window.ethereum !== 'undefined' && 
        (window.ethereum.isMetaMask === true || 
         (window.ethereum as any).providers?.some((provider: any) => provider.isMetaMask === true))
      
      if (!isMetaMaskInstalled) {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.')
        // Open MetaMask installation page
        window.open('https://metamask.io/download/', '_blank')
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        await setWalletData(accounts[0])
        toast.success('MetaMask connected successfully!')
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('User rejected the connection request')
      } else {
        toast.error('Failed to connect MetaMask')
        console.error('MetaMask connection error:', error)
      }
      throw error
    }
  }

  const connectCoinbaseWallet = async () => {
    try {
      // Check if Coinbase Wallet is installed
      if (typeof (window as any).coinbaseWalletExtension === 'undefined') {
        toast.error('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.')
        return
      }

      // Request account access
      const accounts = await (window as any).coinbaseWalletExtension.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        await setWalletData(accounts[0])
        toast.success('Coinbase Wallet connected successfully!')
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('User rejected the connection request')
      } else {
        toast.error('Failed to connect Coinbase Wallet')
        console.error('Coinbase Wallet connection error:', error)
      }
      throw error
    }
  }

  const connectWalletConnect = async () => {
    try {
      // WalletConnect implementation would go here
      toast.info('WalletConnect integration coming soon!')
    } catch (error) {
      console.error('WalletConnect connection error:', error)
      throw error
    }
  }

  const connectRainbow = async () => {
    try {
      // Check if Rainbow is installed
      if (typeof (window as any).rainbow === 'undefined') {
        toast.error('Rainbow Wallet is not installed. Please install Rainbow Wallet to continue.')
        return
      }

      // Request account access
      const accounts = await (window as any).rainbow.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        await setWalletData(accounts[0])
        toast.success('Rainbow Wallet connected successfully!')
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('User rejected the connection request')
      } else {
        toast.error('Failed to connect Rainbow Wallet')
        console.error('Rainbow Wallet connection error:', error)
      }
      throw error
    }
  }

  const setWalletData = async (accountAddress: string) => {
    setAccount(accountAddress)
    setIsConnected(true)
    
    // Get chain ID
    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    })
    setChainId(parseInt(chainId, 16))

    // Get balance
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [accountAddress, 'latest']
    })
    setBalance((parseInt(balance, 16) / 1e18).toFixed(4))
  }

  const updateBalance = async (accountAddress: string) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accountAddress, 'latest']
      })
      setBalance((parseInt(balance, 16) / 1e18).toFixed(4))
    } catch (error) {
      console.error('Error updating balance:', error)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setIsConnected(false)
    setChainId(null)
    setBalance(null)
    toast.info('Wallet disconnected')
  }

  const switchNetwork = async (targetChainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      })
      setChainId(targetChainId)
      toast.success('Network switched successfully')
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet
        toast.error('Please add this network to your wallet first')
      } else {
        toast.error('Failed to switch network')
        console.error('Network switch error:', error)
      }
    }
  }

  useEffect(() => {
    // Listen for wallet events (but don't auto-connect)
    if (typeof window.ethereum !== 'undefined') {

      // Listen for account changes (only when user manually connects)
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        } else {
          disconnectWallet()
        }
      })

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16))
        window.location.reload() // Reload to ensure proper state
      })
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [])

  const value: Web3ContextType = {
    isConnected,
    account,
    chainId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    balance,
    isLoading,
    showWalletSelector,
    setShowWalletSelector,
    connectToWallet
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeAllListeners: (event: string) => void
      isMetaMask?: boolean
    }
    coinbaseWalletExtension?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeAllListeners: (event: string) => void
    }
    rainbow?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeAllListeners: (event: string) => void
    }
  }
}
