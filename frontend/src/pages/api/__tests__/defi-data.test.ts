import { createMocks } from 'node-mocks-http'
import handler from '../defi-data'

describe('/api/defi-data', () => {
  it('should return DeFi data', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('protocols')
    expect(data).toHaveProperty('pools')
    expect(Array.isArray(data.protocols)).toBe(true)
    expect(Array.isArray(data.pools)).toBe(true)
  })

  it('should return correct protocol structure', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    const protocol = data.protocols[0]
    
    expect(protocol).toHaveProperty('id')
    expect(protocol).toHaveProperty('name')
    expect(protocol).toHaveProperty('icon')
    expect(protocol).toHaveProperty('category')
    expect(protocol).toHaveProperty('tvl')
    expect(protocol).toHaveProperty('apy')
    expect(protocol).toHaveProperty('risk')
    expect(protocol).toHaveProperty('description')
    expect(protocol).toHaveProperty('website')
    expect(protocol).toHaveProperty('fees24h')
    expect(protocol).toHaveProperty('volume24h')
    expect(protocol).toHaveProperty('activeUsers')
    expect(protocol).toHaveProperty('tokens')
    expect(protocol).toHaveProperty('features')
    expect(protocol).toHaveProperty('status')
    expect(protocol).toHaveProperty('lastUpdated')
  })

  it('should return correct pool structure', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    const pool = data.pools[0]
    
    expect(pool).toHaveProperty('id')
    expect(pool).toHaveProperty('protocol')
    expect(pool).toHaveProperty('pair')
    expect(pool).toHaveProperty('liquidity')
    expect(pool).toHaveProperty('volume24h')
    expect(pool).toHaveProperty('apy')
    expect(pool).toHaveProperty('risk')
    expect(pool).toHaveProperty('fees24h')
    expect(pool).toHaveProperty('lastUpdated')
  })

  it('should return expected protocols', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    const protocolNames = data.protocols.map(p => p.name)
    
    expect(protocolNames).toContain('Uniswap V3')
    expect(protocolNames).toContain('Compound')
    expect(protocolNames).toContain('Aave')
    expect(protocolNames).toContain('Curve Finance')
    expect(protocolNames).toContain('Yearn Finance')
    expect(protocolNames).toContain('Lido Finance')
  })

  it('should return correct protocol categories', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    const categories = data.protocols.map(p => p.category)
    
    expect(categories).toContain('DEX')
    expect(categories).toContain('Lending')
    expect(categories).toContain('Yield')
    expect(categories).toContain('Staking')
  })

  it('should return valid risk levels', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    data.protocols.forEach(protocol => {
      expect(['Low', 'Medium', 'High']).toContain(protocol.risk)
    })
    
    data.pools.forEach(pool => {
      expect(['Low', 'Medium', 'High']).toContain(pool.risk)
    })
  })

  it('should return valid website URLs', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    data.protocols.forEach(protocol => {
      expect(protocol.website).toMatch(/^https:\/\//)
    })
  })

  it('should return numeric values for financial metrics', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    data.protocols.forEach(protocol => {
      expect(typeof protocol.tvl).toBe('number')
      expect(typeof protocol.apy).toBe('number')
      expect(typeof protocol.fees24h).toBe('number')
      expect(typeof protocol.volume24h).toBe('number')
      expect(typeof protocol.activeUsers).toBe('number')
    })
    
    data.pools.forEach(pool => {
      expect(typeof pool.liquidity).toBe('number')
      expect(typeof pool.volume24h).toBe('number')
      expect(typeof pool.apy).toBe('number')
      expect(typeof pool.fees24h).toBe('number')
    })
  })

  it('should return valid token arrays', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    data.protocols.forEach(protocol => {
      expect(Array.isArray(protocol.tokens)).toBe(true)
      expect(protocol.tokens.length).toBeGreaterThan(0)
      protocol.tokens.forEach(token => {
        expect(typeof token).toBe('string')
      })
    })
  })

  it('should return valid feature arrays', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    data.protocols.forEach(protocol => {
      expect(Array.isArray(protocol.features)).toBe(true)
      expect(protocol.features.length).toBeGreaterThan(0)
      protocol.features.forEach(feature => {
        expect(typeof feature).toBe('string')
      })
    })
  })

  it('should return active status for all protocols', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    data.protocols.forEach(protocol => {
      expect(protocol.status).toBe('active')
    })
  })

  it('should return valid lastUpdated timestamps', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    data.protocols.forEach(protocol => {
      expect(protocol.lastUpdated).toBeDefined()
      expect(new Date(protocol.lastUpdated)).toBeInstanceOf(Date)
      expect(new Date(protocol.lastUpdated).getTime()).not.toBeNaN()
    })
    
    data.pools.forEach(pool => {
      expect(pool.lastUpdated).toBeDefined()
      expect(new Date(pool.lastUpdated)).toBeInstanceOf(Date)
      expect(new Date(pool.lastUpdated).getTime()).not.toBeNaN()
    })
  })

  it('should handle POST method', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
  })

  it('should return JSON content type', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getHeaders()['content-type']).toBe('application/json')
  })

  it('should return reasonable financial values', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    const data = JSON.parse(res._getData())
    
    // Check that TVL values are reasonable (in billions)
    data.protocols.forEach(protocol => {
      expect(protocol.tvl).toBeGreaterThan(0)
      expect(protocol.tvl).toBeLessThan(100) // Less than 100B
    })
    
    // Check that APY values are reasonable
    data.protocols.forEach(protocol => {
      expect(protocol.apy).toBeGreaterThan(0)
      expect(protocol.apy).toBeLessThan(100) // Less than 100%
    })
    
    // Check pool liquidity values
    data.pools.forEach(pool => {
      expect(pool.liquidity).toBeGreaterThan(0)
      expect(pool.liquidity).toBeLessThan(100) // Less than 100M
    })
  })
})
