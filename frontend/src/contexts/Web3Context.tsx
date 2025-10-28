'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-toastify'

interface Web3ContextType {
  isConnected: boolean
  account: string | null
  chainId: number | null
  walletType: 'ethereum' | 'solana' | null
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
  const [walletType, setWalletType] = useState<'ethereum' | 'solana' | null>(null)
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
        const savedWalletType = localStorage.getItem('wallet_type') as 'ethereum' | 'solana' | null

        if (savedConnection === 'true' && savedAccount) {
          // Check if wallet is still connected based on wallet type
          if (savedWalletType === 'ethereum' && typeof window.ethereum !== 'undefined') {
            try {
              const accounts = await window.ethereum.request({ method: 'eth_accounts' })
              const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
              
              if (accounts.length > 0 && accounts[0].toLowerCase() === savedAccount.toLowerCase()) {
                // Wallet is still connected, restore state
                setAccount(savedAccount)
                setChainId(savedChainId ? parseInt(savedChainId) : parseInt(currentChainId, 16))
                setWalletType('ethereum')
                setBalance(savedBalance)
                setIsConnected(true)
                
                // Update balance if available
                if (savedBalance) {
                  await updateBalance(savedAccount)
                }
                
                // Show a subtle notification that wallet was restored
                toast.info(`Ethereum wallet restored: ${savedAccount.slice(0, 6)}...${savedAccount.slice(-4)}`, {
                  autoClose: 2000,
                  hideProgressBar: true
                })
              } else {
                // Wallet disconnected, clear localStorage
                clearWalletStorage()
              }
            } catch (error) {
              console.error('Error checking Ethereum wallet connection:', error)
              clearWalletStorage()
            }
          } else if (savedWalletType === 'solana' && typeof (window as any).solana !== 'undefined') {
            try {
              const response = await (window as any).solana.connect({ onlyIfTrusted: true })
              
              if (response.publicKey && response.publicKey.toString() === savedAccount) {
                // Solana wallet is still connected, restore state
                setAccount(savedAccount)
                setWalletType('solana')
                setBalance(savedBalance)
                setIsConnected(true)
                
                // Show a subtle notification that wallet was restored
                toast.info(`Solana wallet restored: ${savedAccount.slice(0, 6)}...${savedAccount.slice(-4)}`, {
                  autoClose: 2000,
                  hideProgressBar: true
                })
              } else {
                // Wallet disconnected, clear localStorage
                clearWalletStorage()
              }
            } catch (error) {
              console.error('Error checking Solana wallet connection:', error)
              clearWalletStorage()
            }
          } else {
            // No wallet extension, clear localStorage
            clearWalletStorage()
          }
        }
      } catch (error) {
        console.error('Error loading wallet state:', error)
      }
    }

    loadWalletState()
  }, [])

  // Helper function to clear wallet storage
  const clearWalletStorage = () => {
    localStorage.removeItem('wallet_account')
    localStorage.removeItem('wallet_chainId')
    localStorage.removeItem('wallet_balance')
    localStorage.removeItem('wallet_connected')
    localStorage.removeItem('wallet_type')
  }

  // Save wallet state to localStorage whenever it changes
  useEffect(() => {
    if (account && isConnected) {
      localStorage.setItem('wallet_account', account)
      localStorage.setItem('wallet_chainId', chainId?.toString() || '')
      localStorage.setItem('wallet_balance', balance || '')
      localStorage.setItem('wallet_connected', 'true')
      localStorage.setItem('wallet_type', walletType || '')
    } else {
      clearWalletStorage()
    }
  }, [account, chainId, balance, isConnected, walletType])

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
        case 'phantom':
          await connectPhantomWallet()
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
      // Detect mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      // Check if MetaMask is installed with robust detection
      const isMetaMaskInstalled = typeof window.ethereum !== 'undefined' && 
        (window.ethereum.isMetaMask === true || 
         (window.ethereum as any).providers?.some((provider: any) => provider.isMetaMask === true))
      
      if (!isMetaMaskInstalled) {
        // For mobile devices, try multiple approaches to open the wallet
        if (isMobile) {
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
          
          toast.info('Opening MetaMask... Please approve the connection in the app.')
          
          // For mobile, try to open MetaMask app using different methods
          const dappUrl = window.location.href
          
          if (isIOS) {
            // iOS - Try multiple deep link formats
            const tryOpenApp = () => {
              // Method 1: Universal Link
              window.location.href = `https://metamask.app.link/dapp?url=${encodeURIComponent(dappUrl)}`
              
              // Method 2: Custom scheme (fallback after delay)
              setTimeout(() => {
                window.location.href = `metamask://dapp?url=${encodeURIComponent(dappUrl)}`
              }, 1000)
            }
            
            tryOpenApp()
            
            // Show download link if app doesn't open
            setTimeout(() => {
              if (confirm('MetaMask didn\'t open. Would you like to download it?')) {
                window.open('https://apps.apple.com/app/metamask/id1438144202', '_blank')
              }
            }, 2000)
          } else {
            // Android
            window.location.href = `metamask://wc?uri=${encodeURIComponent(dappUrl)}`
            
            setTimeout(() => {
              if (confirm('MetaMask didn\'t open. Would you like to download it?')) {
                window.open('https://play.google.com/store/apps/details?id=io.metamask', '_blank')
              }
            }, 2000)
          }
          
          return
        }
        
        toast.error('MetaMask is not installed. Please install MetaMask to continue.')
        window.open('https://metamask.io/download/', '_blank')
        return
      }

      // Desktop: Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        await setWalletData(accounts[0], 'ethereum')
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
      // Detect mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      // Check if Coinbase Wallet is installed
      if (typeof (window as any).coinbaseWalletExtension === 'undefined') {
        if (isMobile) {
          toast.info('Opening Coinbase Wallet...')
          // Use Coinbase Wallet Universal Link
          const deepLink = `cbwallet://wc`
          
          // Try to open the Coinbase Wallet app
          window.location.href = deepLink
          
          // Fallback: Open in browser with instructions
          setTimeout(() => {
            if (confirm('Coinbase Wallet app not found. Would you like to download it?')) {
              const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
              if (isIOS) {
                window.open('https://apps.apple.com/app/coinbase-wallet/id1278383455', '_blank')
              } else {
                window.open('https://play.google.com/store/apps/details?id=org.toshi', '_blank')
              }
            }
          }, 1500)
          return
        }
        
        toast.error('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.')
        window.open('https://www.coinbase.com/wallet', '_blank')
        return
      }

      // Request account access
      const accounts = await (window as any).coinbaseWalletExtension.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        await setWalletData(accounts[0], 'ethereum')
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
      // Detect mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      // Check if Rainbow is installed
      if (typeof (window as any).rainbow === 'undefined') {
        if (isMobile) {
          toast.info('Opening Rainbow Wallet...')
          // Use Rainbow's Universal Link
          const deepLink = `rainbow://wc`
          
          // Try to open the Rainbow app
          window.location.href = deepLink
          
          // Fallback: Open in browser with instructions
          setTimeout(() => {
            if (confirm('Rainbow Wallet app not found. Would you like to download it?')) {
              const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
              if (isIOS) {
                window.open('https://apps.apple.com/app/rainbow-wallet/id1473514152', '_blank')
              } else {
                window.open('https://play.google.com/store/apps/details?id=me.rainbow', '_blank')
              }
            }
          }, 1500)
          return
        }
        
        toast.error('Rainbow Wallet is not installed. Please install Rainbow Wallet to continue.')
        window.open('https://rainbow.me/', '_blank')
        return
      }

      // Request account access
      const accounts = await (window as any).rainbow.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        await setWalletData(accounts[0], 'ethereum')
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

  const connectPhantomWallet = async () => {
    try {
      // Detect mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      // Check if Phantom is installed
      const isPhantomInstalled = typeof (window as any).solana !== 'undefined' && 
        (window as any).solana.isPhantom === true
      
      if (!isPhantomInstalled) {
        // For mobile devices, try multiple deep link approaches
        if (isMobile) {
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
          
          toast.info('Opening Phantom... Please approve the connection in the app.')
          
          const dappUrl = window.location.href
          
          if (isIOS) {
            // iOS - Try multiple deep link formats
            window.location.href = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(window.location.origin)}&redirect_link=${encodeURIComponent(dappUrl)}`
            
            // Fallback after delay
            setTimeout(() => {
              window.location.href = `phantom://www.phantom.app/connect?app_url=${encodeURIComponent(window.location.origin)}&redirect_link=${encodeURIComponent(dappUrl)}`
            }, 1000)
            
            // Show download link if app doesn't open
            setTimeout(() => {
              if (confirm('Phantom didn\'t open. Would you like to download it?')) {
                window.open('https://apps.apple.com/app/phantom-solana-wallet/1598432977', '_blank')
              }
            }, 2000)
          } else {
            // Android
            window.location.href = `phantom://www.phantom.app/connect?app_url=${encodeURIComponent(window.location.origin)}&redirect_link=${encodeURIComponent(dappUrl)}`
            
            setTimeout(() => {
              if (confirm('Phantom didn\'t open. Would you like to download it?')) {
                window.open('https://play.google.com/store/apps/details?id=app.phantom', '_blank')
              }
            }, 2000)
          }
          
          return
        }
        
        toast.error('Phantom wallet is not installed. Please install Phantom to continue.')
        window.open('https://phantom.app/', '_blank')
        return
      }

      // Desktop: Request account access
      const response = await (window as any).solana.connect()
      
      if (response.publicKey) {
        const publicKey = response.publicKey.toString()
        await setWalletData(publicKey, 'solana')
        toast.success('Phantom wallet connected successfully!')
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('User rejected the connection request')
      } else {
        toast.error('Failed to connect Phantom wallet')
        console.error('Phantom wallet connection error:', error)
      }
      throw error
    }
  }

  const setWalletData = async (accountAddress: string, type: 'ethereum' | 'solana' = 'ethereum') => {
    setAccount(accountAddress)
    setWalletType(type)
    setIsConnected(true)
    
    if (type === 'ethereum') {
      // Check if ethereum is available
      if (typeof window.ethereum === 'undefined') {
        console.warn('MetaMask not available, skipping chain ID and balance update')
        setChainId(null)
        setBalance('0.0 ETH')
        return
      }

      // Get chain ID for Ethereum
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      })
      setChainId(parseInt(chainId, 16))
      
      // Update balance
      await updateBalance(accountAddress)
    } else if (type === 'solana') {
      // For Solana, we don't have chain ID concept, set to null
      setChainId(null)
      // TODO: Implement Solana balance fetching
      setBalance('0.0 SOL')
    }
  }

  const updateBalance = async (accountAddress: string) => {
    try {
      // Check if ethereum is available
      if (typeof window.ethereum === 'undefined') {
        console.warn('MetaMask not available, skipping balance update')
        setBalance('0.0 ETH')
        return
      }

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accountAddress, 'latest']
      })
      setBalance((parseInt(balance, 16) / 1e18).toFixed(4))
    } catch (error) {
      console.error('Error updating balance:', error)
      setBalance('0.0 ETH')
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
    walletType,
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
