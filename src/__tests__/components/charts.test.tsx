import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ProductionChart } from '@/components/charts/production-chart'
import { InventoryChart } from '@/components/charts/inventory-chart'
import { OrdersChart } from '@/components/charts/orders-chart'

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
}))

describe('Chart Components', () => {
  describe('ProductionChart', () => {
    it('renders without crashing', () => {
      render(<ProductionChart />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('displays production data visualization', () => {
      render(<ProductionChart />)
      const bars = screen.getAllByTestId('bar')
      expect(bars.length).toBeGreaterThan(0)
    })
  })

  describe('InventoryChart', () => {
    it('renders without crashing', () => {
      render(<InventoryChart />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('displays inventory data visualization', () => {
      render(<InventoryChart />)
      const areas = screen.getAllByTestId('area')
      expect(areas.length).toBeGreaterThan(0)
    })
  })

  describe('OrdersChart', () => {
    it('renders without crashing', () => {
      render(<OrdersChart />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('displays orders data visualization', () => {
      render(<OrdersChart />)
      expect(screen.getByTestId('pie')).toBeInTheDocument()
    })
  })
})
