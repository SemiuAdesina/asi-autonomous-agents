import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentProvider, useAgent } from '../AgentContext'

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

// Mock the agent communication service
jest.mock('../../services/agentCommunication', () => ({
  DirectAgentService: jest.fn().mockImplementation(() => ({
    connectToAgent: jest.fn().mockReturnValue(true),
    sendMessage: jest.fn().mockResolvedValue({ success: true }),
    disconnectFromAgent: jest.fn().mockResolvedValue(undefined),
  })),
  BackendAgentService: jest.fn().mockImplementation(() => ({
    connectToAgent: jest.fn().mockReturnValue(true),
    sendMessage: jest.fn().mockResolvedValue({ success: true }),
  })),
}))

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn().mockReturnValue({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  }),
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}))

// Test component that uses the context
const TestComponent = () => {
  const {
    agents,
    selectedAgent,
    isConnected,
    connectAgent,
    disconnectAgent,
    sendMessage,
  } = useAgent()

  return (
    <div>
      <div data-testid="agents-count">{agents.length}</div>
      <div data-testid="connected-agent">
        {selectedAgent ? selectedAgent.name : 'None'}
      </div>
      <div data-testid="is-connected">{isConnected ? 'Connected' : 'Disconnected'}</div>
      <button onClick={() => connectAgent(agents[0]?.id || '')}>Connect Agent</button>
      <button onClick={disconnectAgent}>Disconnect Agent</button>
      <button onClick={() => sendMessage('Test message')}>Send Message</button>
    </div>
  )
}

describe('AgentContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock fetch to simulate API failure (will trigger fallback to demo agents)
    ;(global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve([]),
      } as Response)
    )
  })

  it('should provide initial state', async () => {
    await act(async () => {
      render(
        <AgentProvider>
          <TestComponent />
        </AgentProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('agents-count')).toHaveTextContent('3') // Fallback to demo agents
    })
    expect(screen.getByTestId('connected-agent')).toHaveTextContent('None')
    expect(screen.getByTestId('is-connected')).toHaveTextContent('Disconnected')
  })

  it('should load agents on mount', async () => {
    await act(async () => {
      render(
        <AgentProvider>
          <TestComponent />
        </AgentProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('agents-count')).toHaveTextContent('3') // Fallback to demo agents
    })
  })

  it('should connect to an agent', async () => {
    render(
      <AgentProvider>
        <TestComponent />
      </AgentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('agents-count')).toHaveTextContent('3') // Fallback to demo agents
    })

    const connectButton = screen.getByText('Connect Agent')
    await act(async () => {
      await userEvent.click(connectButton)
    })

    expect(screen.getByTestId('connected-agent')).toHaveTextContent('Healthcare Assistant')
    expect(screen.getByTestId('is-connected')).toHaveTextContent('Connected')
  })

  it('should disconnect from an agent', async () => {
    render(
      <AgentProvider>
        <TestComponent />
      </AgentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('agents-count')).toHaveTextContent('3') // Fallback to demo agents
    })

    // Connect first
    const connectButton = screen.getByText('Connect Agent')
    await act(async () => {
      await userEvent.click(connectButton)
    })

    expect(screen.getByTestId('is-connected')).toHaveTextContent('Connected')

    // Then disconnect
    const disconnectButton = screen.getByText('Disconnect Agent')
    await act(async () => {
      await userEvent.click(disconnectButton)
    })

    expect(screen.getByTestId('connected-agent')).toHaveTextContent('None')
    expect(screen.getByTestId('is-connected')).toHaveTextContent('Disconnected')
  })

  it('should handle agent connection errors', async () => {
    ;(global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('Network error'))

    render(
      <AgentProvider>
        <TestComponent />
      </AgentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('agents-count')).toHaveTextContent('3') // Fallback to demo agents
    })
  })

  it('should send messages to connected agent', async () => {
    render(
      <AgentProvider>
        <TestComponent />
      </AgentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('agents-count')).toHaveTextContent('3') // Fallback to demo agents
    })

    // Connect agent first
    const connectButton = screen.getByText('Connect Agent')
    await act(async () => {
      await userEvent.click(connectButton)
    })

    // Send message
    const sendButton = screen.getByText('Send Message')
    await act(async () => {
      await userEvent.click(sendButton)
    })

    // Should not throw any errors
    expect(screen.getByTestId('is-connected')).toHaveTextContent('Connected')
  })
})

describe('AgentContext Error Handling', () => {
  it('should handle API failures gracefully', async () => {
    ;(global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('API Error'))

    render(
      <AgentProvider>
        <TestComponent />
      </AgentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('agents-count')).toHaveTextContent('3') // Fallback to demo agents
    })

    // Should fallback to demo agents
    expect(screen.getByTestId('agents-count')).toHaveTextContent('3')
  })
})
