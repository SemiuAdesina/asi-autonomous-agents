import { sendMessageToAgent, discoverAgents } from '../agentCommunication'

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
  })),
}))

describe('agentCommunication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendMessageToAgent', () => {
    it('should send message to agent successfully', async () => {
      const mockResponseData = {
        success: true,
        response: 'Test response from agent',
        agentId: 'healthcare-agent',
      }
      
      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
      }
      
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockFetchResponse as unknown as Response)

      const result = await sendMessageToAgent('healthcare-agent', 'Hello, agent!')

      expect(global.fetch).toHaveBeenCalledWith('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'healthcare-agent',
          prompt: 'Hello, agent!',
        }),
      })
      
      expect(result).toEqual(mockResponseData)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Network error'
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error(errorMessage))

      await expect(sendMessageToAgent('healthcare-agent', 'Hello, agent!')).rejects.toThrow(errorMessage)
    })

    it('should handle non-ok responses', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }
      
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockFetchResponse as unknown as Response)

      await expect(sendMessageToAgent('healthcare-agent', 'Hello, agent!')).rejects.toThrow('Backend API error: 500')
    })
  })

  describe('discoverAgents', () => {
    it('should discover agents successfully', async () => {
      const mockAgents = [
        {
          id: 'healthcare-agent',
          name: 'Healthcare Assistant',
          address: 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
          status: 'active',
          capabilities: ['Medical Analysis', 'Symptom Checker'],
        },
      ]
      
      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockAgents),
      }
      
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockFetchResponse as unknown as Response)

      const result = await discoverAgents()

      expect(global.fetch).toHaveBeenCalledWith('/api/discover-agents')
      expect(result).toEqual(mockAgents)
    })

    it('should handle discovery errors', async () => {
      const errorMessage = 'Network error'
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error(errorMessage))

      await expect(discoverAgents()).rejects.toThrow(errorMessage)
    })

    it('should handle non-ok responses', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }
      
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockFetchResponse as unknown as Response)

      await expect(discoverAgents()).rejects.toThrow('Failed to discover agents: 500')
    })
  })
})