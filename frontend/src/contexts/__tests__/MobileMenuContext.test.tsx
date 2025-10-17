import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileMenuProvider, useMobileMenu } from '../MobileMenuContext'

// Test component that uses the context
const TestComponent = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu()

  return (
    <div>
      <div data-testid="menu-state">
        {isMobileMenuOpen ? 'Open' : 'Closed'}
      </div>
      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        Toggle Menu
      </button>
      <button onClick={() => setIsMobileMenuOpen(true)}>
        Open Menu
      </button>
      <button onClick={() => setIsMobileMenuOpen(false)}>
        Close Menu
      </button>
    </div>
  )
}

describe('MobileMenuContext', () => {
  it('should provide initial state', () => {
    render(
      <MobileMenuProvider>
        <TestComponent />
      </MobileMenuProvider>
    )

    expect(screen.getByTestId('menu-state')).toHaveTextContent('Closed')
  })

  it('should toggle menu state', async () => {
    render(
      <MobileMenuProvider>
        <TestComponent />
      </MobileMenuProvider>
    )

    const toggleButton = screen.getByText('Toggle Menu')
    
    await userEvent.click(toggleButton)
    expect(screen.getByTestId('menu-state')).toHaveTextContent('Open')

    await userEvent.click(toggleButton)
    expect(screen.getByTestId('menu-state')).toHaveTextContent('Closed')
  })

  it('should open menu directly', async () => {
    render(
      <MobileMenuProvider>
        <TestComponent />
      </MobileMenuProvider>
    )

    const openButton = screen.getByText('Open Menu')
    
    await userEvent.click(openButton)
    expect(screen.getByTestId('menu-state')).toHaveTextContent('Open')
  })

  it('should close menu directly', async () => {
    render(
      <MobileMenuProvider>
        <TestComponent />
      </MobileMenuProvider>
    )

    // First open the menu
    const openButton = screen.getByText('Open Menu')
    await userEvent.click(openButton)
    expect(screen.getByTestId('menu-state')).toHaveTextContent('Open')

    // Then close it
    const closeButton = screen.getByText('Close Menu')
    await userEvent.click(closeButton)
    expect(screen.getByTestId('menu-state')).toHaveTextContent('Closed')
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = jest.fn()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useMobileMenu must be used within a MobileMenuProvider')

    console.error = originalError
  })
})
