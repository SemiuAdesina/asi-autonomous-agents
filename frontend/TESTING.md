# Testing Guide for ASI Autonomous Agents

This document provides a comprehensive guide for testing the ASI Autonomous Agents frontend application.

## 🧪 Test Setup

The project uses Jest and React Testing Library for unit testing. All testing dependencies have been configured and are ready to use.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

```bash
# Install all dependencies (including testing dependencies)
npm install

# Or run the test setup script
node scripts/test-setup.js
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch mode, with coverage)
npm run test:ci
```

### Test File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── __tests__/
│   │       ├── AgentGrid.test.tsx
│   │       ├── DeFiProtocols.test.tsx
│   │       └── ...
│   ├── contexts/
│   │   └── __tests__/
│   │       ├── AgentContext.test.tsx
│   │       ├── Web3Context.test.tsx
│   │       └── MobileMenuContext.test.tsx
│   ├── services/
│   │   └── __tests__/
│   │       └── agentCommunication.test.ts
│   └── pages/
│       └── api/
│           └── __tests__/
│               ├── discover-agents.test.ts
│               └── defi-data.test.ts
├── jest.config.js
├── jest.setup.js
└── TESTING.md
```

## 📋 Test Coverage

### Context Tests

#### AgentContext
- ✅ Initial state loading
- ✅ Agent discovery and loading
- ✅ Agent connection/disconnection
- ✅ Message sending functionality
- ✅ Error handling for API failures
- ✅ Fallback to demo agents

#### Web3Context
- ✅ Initial wallet state
- ✅ Wallet connection flow
- ✅ Wallet disconnection
- ✅ Network switching
- ✅ localStorage persistence
- ✅ Error handling for missing provider
- ✅ Balance updates

#### MobileMenuContext
- ✅ Initial menu state
- ✅ Menu toggle functionality
- ✅ Direct open/close methods
- ✅ Provider error handling

### Component Tests

#### AgentGrid
- ✅ Component rendering
- ✅ Agent list display
- ✅ Agent information display
- ✅ Connect button functionality
- ✅ Loading states
- ✅ Empty states
- ✅ Connected agent display

#### DeFiProtocols
- ✅ Component rendering
- ✅ Loading state handling
- ✅ Protocol data display
- ✅ Liquidity pool display
- ✅ Visit Protocol button functionality
- ✅ Risk indicator display
- ✅ Currency/percentage formatting
- ✅ Error handling for invalid URLs

### API Tests

#### /api/discover-agents
- ✅ Correct response structure
- ✅ Agent data validation
- ✅ Address verification
- ✅ Capabilities verification
- ✅ Status verification
- ✅ Date validation
- ✅ Error handling for invalid methods

#### /api/defi-data
- ✅ Protocol data structure
- ✅ Pool data structure
- ✅ Financial metrics validation
- ✅ Risk level validation
- ✅ URL validation
- ✅ Data type validation
- ✅ Content type verification

### Service Tests

#### agentCommunication
- ✅ Message sending to agents
- ✅ Agent discovery
- ✅ Error handling
- ✅ WebSocket communication
- ✅ Response validation
- ✅ Network error handling

## 🎯 Testing Best Practices

### Writing Tests

1. **Test Structure**: Follow the AAA pattern (Arrange, Act, Assert)
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should test one specific behavior
4. **Mock External Dependencies**: Mock API calls, Web3 providers, etc.
5. **Test Edge Cases**: Include tests for error conditions and edge cases

### Example Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup common test data
    jest.clearAllMocks()
  })

  it('should render with initial state', () => {
    // Arrange
    render(<Component />)
    
    // Act
    // (user interactions if needed)
    
    // Assert
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    // Arrange
    const mockFn = jest.fn()
    render(<Component onClick={mockFn} />)
    
    // Act
    await userEvent.click(screen.getByRole('button'))
    
    // Assert
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
```

### Mocking Guidelines

1. **Context Providers**: Mock context values for components that depend on them
2. **API Calls**: Mock axios or fetch calls to avoid real network requests
3. **Web3 Providers**: Mock ethereum object for wallet-related tests
4. **External Libraries**: Mock framer-motion, socket.io, etc.

## 🔧 Configuration

### Jest Configuration

The Jest configuration is defined in `jest.config.js`:

- **Environment**: jsdom for React component testing
- **Setup**: `jest.setup.js` for global test setup
- **Coverage**: Configured thresholds for code coverage
- **Transform**: Handles CSS and other asset imports

### Test Environment Setup

The `jest.setup.js` file includes:

- Testing Library matchers
- Next.js router mocking
- Image component mocking
- Web3 provider mocking
- localStorage/sessionStorage mocking
- Global API mocking

## 📊 Coverage Reports

When running tests with coverage (`npm run test:coverage`), you'll get:

- **Line Coverage**: Percentage of code lines executed
- **Function Coverage**: Percentage of functions called
- **Branch Coverage**: Percentage of code branches taken
- **Statement Coverage**: Percentage of statements executed

### Coverage Thresholds

Current thresholds (can be adjusted in `jest.config.js`):

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## 🐛 Debugging Tests

### Common Issues

1. **Async Operations**: Use `waitFor` for async operations
2. **Mock Cleanup**: Always clear mocks between tests
3. **Component Rendering**: Ensure proper provider wrapping
4. **User Interactions**: Use `userEvent` for realistic user interactions

### Debug Commands

```bash
# Run specific test file
npm test AgentContext.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should connect wallet"

# Run tests with verbose output
npm test -- --verbose

# Debug mode (runs in debugger)
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 🚀 CI/CD Integration

For continuous integration, use:

```bash
npm run test:ci
```

This command:
- Runs all tests once (no watch mode)
- Generates coverage reports
- Exits with proper exit codes for CI systems
- Provides machine-readable output

## 📝 Adding New Tests

When adding new components or features:

1. Create test file in appropriate `__tests__` directory
2. Follow existing naming convention (`ComponentName.test.tsx`)
3. Include tests for:
   - Rendering
   - User interactions
   - Props handling
   - Error states
   - Edge cases
4. Update this documentation if needed

## 🔍 Test Utilities

### Custom Render Function

For components that need providers, create a custom render function:

```typescript
const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  return render(
    <AgentProvider>
      <Web3Provider>
        {ui}
      </Web3Provider>
    </AgentProvider>,
    options
  )
}
```

### Mock Data

Create reusable mock data in test files:

```typescript
const mockAgent = {
  id: 'test-agent',
  name: 'Test Agent',
  address: 'agent1test...',
  status: 'active',
  capabilities: ['Test Capability'],
  lastSeen: new Date(),
  description: 'Test description',
}
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)

## 🤝 Contributing

When contributing to tests:

1. Ensure all new code has corresponding tests
2. Maintain or improve coverage thresholds
3. Follow existing test patterns and conventions
4. Update documentation for new testing utilities
5. Run full test suite before submitting PRs

---

**Happy Testing! 🧪✨**
