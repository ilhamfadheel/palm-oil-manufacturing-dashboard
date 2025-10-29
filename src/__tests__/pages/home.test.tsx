import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock the chart components
jest.mock('@/components/charts/production-chart', () => ({
  ProductionChart: () => <div data-testid="production-chart">Production Chart</div>
}))

jest.mock('@/components/charts/inventory-chart', () => ({
  InventoryChart: () => <div data-testid="inventory-chart">Inventory Chart</div>
}))

jest.mock('@/components/charts/orders-chart', () => ({
  OrdersChart: () => <div data-testid="orders-chart">Orders Chart</div>
}))

jest.mock('@/components/supply-chain-flow', () => ({
  SupplyChainFlow: () => <div data-testid="supply-chain-flow">Supply Chain Flow</div>
}))

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    expect(screen.getByText('Palm Oil Manufacturing Dashboard')).toBeInTheDocument()
  })

  it('displays KPI cards', () => {
    render(<HomePage />)
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Total Production')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Active Orders')).toBeInTheDocument()
  })

  it('shows revenue value', () => {
    render(<HomePage />)
    expect(screen.getByText('$45,231.89')).toBeInTheDocument()
  })

  it('shows production value', () => {
    render(<HomePage />)
    expect(screen.getByText('2,345 MT')).toBeInTheDocument()
  })

  it('shows inventory value', () => {
    render(<HomePage />)
    expect(screen.getByText('1,234 MT')).toBeInTheDocument()
  })

  it('shows active orders count', () => {
    render(<HomePage />)
    expect(screen.getByText('24')).toBeInTheDocument()
  })

  it('displays main content', () => {
    render(<HomePage />)
    // Navigation is now in global navbar (layout.tsx), not in page
    expect(screen.getByText('Palm Oil Manufacturing Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/Optimize your supply chain/i)).toBeInTheDocument()
  })

  it('shows call-to-action buttons', () => {
    render(<HomePage />)
    const viewDashboardButtons = screen.getAllByText('View Dashboard')
    expect(viewDashboardButtons.length).toBeGreaterThan(0)
    // Note: "Get Started" button removed as authentication is disabled
  })

  it('displays key features section', () => {
    render(<HomePage />)
    expect(screen.getByText('Key Features')).toBeInTheDocument()
    expect(screen.getByText('Inventory Management')).toBeInTheDocument()
    expect(screen.getByText('Logistics Optimization')).toBeInTheDocument()
    expect(screen.getByText('Production Planning')).toBeInTheDocument()
  })
})
