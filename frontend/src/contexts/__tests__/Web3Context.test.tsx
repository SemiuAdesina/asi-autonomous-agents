import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Web3Provider, useWeb3 } from '../Web3Context'

// Mock the toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Test component that uses the context
const TestComponent = () => {
  const {
    isConnected,
    account,
    chainId,
    balance,
    isLoading,
    connectToWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3()

  return (
    <div>
      <div data-testid="is-connected">{isConnected ? 'Connected' : 'Disconnected'}</div>
      <div data-testid="account">{account || 'No Account'}</div>
      <div data-testid="chain-id">{chainId || 'No Chain'}</div>
      <div data-testid="balance">{balance || 'No Balance'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <button onClick={() => connectToWallet('metamask')}>Connect Wallet</button>
      <button onClick={disconnectWallet}>Disconnect Wallet</button>
      <button onClick={() => switchNetwork(1)}>Switch Network</button>
    </div>
  )
}

describe('Web3Context', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset localStorage
    localStorage.clear()
    ;(localStorage.setItem as jest.Mock).mockClear()
    ;(localStorage.getItem as jest.Mock).mockClear()
    ;(localStorage.removeItem as jest.Mock).mockClear()
    
    // Mock window.open
    window.open = jest.fn()
    
    // Ensure ethereum mock is properly set up
    window.ethereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      isMetaMask: true,
    }
  })

  it('should provide initial state', () => {
    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    )

    expect(screen.getByTestId('is-connected')).toHaveTextContent('Disconnected')
    expect(screen.getByTestId('account')).toHaveTextContent('No Account')
    expect(screen.getByTestId('chain-id')).toHaveTextContent('No Chain')
    expect(screen.getByTestId('balance')).toHaveTextContent('No Balance')
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
  })

  it('should load saved wallet state from localStorage', async () => {
    const mockAccount = '0x1234567890123456789012345678901234567890'
    const mockChainId = '1'
    const mockBalance = '1.5000' // 1.5 ETH (already converted)

    ;(localStorage.getItem as jest.Mock)
      .mockReturnValueOnce(mockAccount) // wallet_account
      .mockReturnValueOnce(mockChainId) // wallet_chainId
      .mockReturnValueOnce(mockBalance) // wallet_balance
      .mockReturnValueOnce('true') // wallet_connected

    // Mock ethereum accounts and chainId
    ;(window.ethereum.request as jest.Mock)
      .mockResolvedValueOnce([mockAccount]) // eth_accounts
      .mockResolvedValueOnce('0x1') // eth_chainId
      .mockResolvedValueOnce('0x16345785d8a0000') // eth_getBalance (1.5 ETH in wei)

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-connected')).toHaveTextContent('Connected')
    })

    expect(screen.getByTestId('account')).toHaveTextContent(mockAccount)
    expect(screen.getByTestId('chain-id')).toHaveTextContent('1')
    // The balance will be updated from the blockchain, not the saved value
    expect(screen.getByTestId('balance')).toHaveTextContent('0.1000')
  })

  it('should connect wallet successfully', async () => {
    const mockAccount = '0x1234567890123456789012345678901234567890'
    const mockChainId = '0x1'
    const mockBalance = '0xde0b6b3a7640000' // 1 ETH in wei (correct value)

    ;(window.ethereum.request as jest.Mock)
      .mockResolvedValueOnce([mockAccount]) // eth_requestAccounts (connectMetaMask)
      .mockResolvedValueOnce(mockChainId) // eth_chainId (setWalletData)
      .mockResolvedValueOnce(mockBalance) // eth_getBalance (setWalletData)

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    )

    const connectButton = screen.getByText('Connect Wallet')
    
    // Debug: Check initial state
    expect(screen.getByTestId('is-connected')).toHaveTextContent('Disconnected')
    
    await act(async () => {
      await userEvent.click(connectButton)
    })

    // Verify ethereum.request was called
    expect(window.ethereum.request).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByTestId('is-connected')).toHaveTextContent('Connected')
    })

    expect(screen.getByTestId('account')).toHaveTextContent(mockAccount)
    expect(screen.getByTestId('chain-id')).toHaveTextContent('1')
    expect(screen.getByTestId('balance')).toHaveTextContent('1.0000')
  })

  it('should disconnect wallet', async () => {
    const mockAccount = '0x1234567890123456789012345678901234567890'
    
    // Set up connected state
    ;(window.ethereum.request as jest.Mock)
      .mockResolvedValueOnce([mockAccount])
      .mockResolvedValueOnce('0x1')
      .mockResolvedValueOnce('0x16345785d8a0000')

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    )

    // Connect first
    const connectButton = screen.getByText('Connect Wallet')
    await act(async () => {
      await userEvent.click(connectButton)
    })

    await waitFor(() => {
      expect(screen.getByTestId('is-connected')).toHaveTextContent('Connected')
    })

    // Then disconnect
    const disconnectButton = screen.getByText('Disconnect Wallet')
    await act(async () => {
      await userEvent.click(disconnectButton)
    })

    await waitFor(() => {
      expect(screen.getByTestId('is-connected')).toHaveTextContent('Disconnected')
    })

    expect(screen.getByTestId('account')).toHaveTextContent('No Account')
    expect(screen.getByTestId('chain-id')).toHaveTextContent('No Chain')
    expect(screen.getByTestId('balance')).toHaveTextContent('No Balance')
  })

  it('should handle connection errors', async () => {
    ;(window.ethereum.request as jest.Mock)
      .mockRejectedValueOnce(new Error('User rejected')) // eth_requestAccounts

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    )

    const connectButton = screen.getByText('Connect Wallet')
    
    await act(async () => {
      await userEvent.click(connectButton)
    })

    // Should remain disconnected
    await waitFor(() => {
      expect(screen.getByTestId('is-connected')).toHaveTextContent('Disconnected')
    })
  })

  it('should handle missing ethereum provider', async () => {
    // Remove ethereum from global
    const originalEthereum = window.ethereum
    delete window.ethereum

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    )

    const connectButton = screen.getByText('Connect Wallet')
    
    await act(async () => {
      await userEvent.click(connectButton)
    })

    // Should remain disconnected
    expect(screen.getByTestId('is-connected')).toHaveTextContent('Disconnected')

    // Restore ethereum
    window.ethereum = originalEthereum
  })

  it('should switch network', async () => {
    const mockAccount = '0x1234567890123456789012345678901234567890'
    
    ;(window.ethereum.request as jest.Mock)
      .mockResolvedValueOnce([mockAccount])
      .mockResolvedValueOnce('0x1')
      .mockResolvedValueOnce('0x16345785d8a0000')
      .mockResolvedValueOnce(null) // eth_switchEthereumChain

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    )

    // Connect first
    const connectButton = screen.getByText('Connect Wallet')
    await act(async () => {
      await userEvent.click(connectButton)
    })

    await waitFor(() => {
      expect(screen.getByTestId('is-connected')).toHaveTextContent('Connected')
    })

    // Switch network
    const switchButton = screen.getByText('Switch Network')
    await act(async () => {
      await userEvent.click(switchButton)
    })

    // Should call ethereum.request with switch chain
    expect(window.ethereum.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }],
    })
  })

  it('should save wallet state to localStorage when connected', async () => {
    const mockAccount = '0x1234567890123456789012345678901234567890'
    
    ;(window.ethereum.request as jest.Mock)
      .mockResolvedValueOnce([mockAccount])
      .mockResolvedValueOnce('0x1')
      .mockResolvedValueOnce('0xde0b6b3a7640000') // 1 ETH in wei

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    )

    const connectButton = screen.getByText('Connect Wallet')
    await act(async () => {
      await userEvent.click(connectButton)
    })

    await waitFor(() => {
      expect(screen.getByTestId('is-connected')).toHaveTextContent('Connected')
    })

    // Check that localStorage was called to save state
    expect(localStorage.setItem).toHaveBeenCalledWith('wallet_account', mockAccount)
    expect(localStorage.setItem).toHaveBeenCalledWith('wallet_chainId', '1')
    expect(localStorage.setItem).toHaveBeenCalledWith('wallet_balance', '1.0000')
    expect(localStorage.setItem).toHaveBeenCalledWith('wallet_connected', 'true')
  })

  it('should clear localStorage when disconnected', async () => {
    const mockAccount = '0x1234567890123456789012345678901234567890'
    
    // Set up connected state
    ;(window.ethereum.request as jest.Mock)
      .mockResolvedValueOnce([mockAccount])
      .mockResolvedValueOnce('0x1')
      .mockResolvedValueOnce('0x16345785d8a0000')

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    )

    // Connect first
    const connectButton = screen.getByText('Connect Wallet')
    await act(async () => {
      await userEvent.click(connectButton)
    })

    await waitFor(() => {
      expect(screen.getByTestId('is-connected')).toHaveTextContent('Connected')
    })

    // Then disconnect
    const disconnectButton = screen.getByText('Disconnect Wallet')
    await act(async () => {
      await userEvent.click(disconnectButton)
    })

    await waitFor(() => {
      expect(screen.getByTestId('is-connected')).toHaveTextContent('Disconnected')
    })

    // Check that localStorage was cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('wallet_account')
    expect(localStorage.removeItem).toHaveBeenCalledWith('wallet_chainId')
    expect(localStorage.removeItem).toHaveBeenCalledWith('wallet_balance')
    expect(localStorage.removeItem).toHaveBeenCalledWith('wallet_connected')
  })
})
