'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/components/overview'
import { RecentSales } from '@/components/recent-sales'
import { ProjectionDialog } from '@/components/projection-dialog'
import { createClient } from '@/lib/supabase/client'
import { subDays } from 'date-fns'

interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalProduction: number
  productionChange: number
  totalInventory: number
  inventoryChange: number
  activeOrders: number
  ordersChange: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient()
  const thirtyDaysAgo = subDays(new Date(), 30)
  const sixtyDaysAgo = subDays(new Date(), 60)

  // Fetch current month's work orders for revenue
  const { data: currentOrders } = await supabase
    .from('work_orders')
    .select('requested_quantity_liters')
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Fetch previous month's work orders for comparison
  const { data: previousOrders } = await supabase
    .from('work_orders')
    .select('requested_quantity_liters')
    .gte('created_at', sixtyDaysAgo.toISOString())
    .lt('created_at', thirtyDaysAgo.toISOString())

  // Calculate revenue (assuming $850 per MT)
  const currentRevenue = (currentOrders || []).reduce((sum, order) => sum + (order.requested_quantity_liters / 1000) * 850, 0)
  const previousRevenue = (previousOrders || []).reduce((sum, order) => sum + (order.requested_quantity_liters / 1000) * 850, 0)
  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

  // Fetch current month's production
  const { data: currentProduction } = await supabase
    .from('production_batches')
    .select('output_oil_liters')
    .gte('start_time', thirtyDaysAgo.toISOString())

  // Fetch previous month's production
  const { data: previousProduction } = await supabase
    .from('production_batches')
    .select('output_oil_liters')
    .gte('start_time', sixtyDaysAgo.toISOString())
    .lt('start_time', thirtyDaysAgo.toISOString())

  const totalProduction = (currentProduction || []).reduce((sum, batch) => sum + (batch.output_oil_liters / 1000), 0)
  const prevProduction = (previousProduction || []).reduce((sum, batch) => sum + (batch.output_oil_liters / 1000), 0)
  const productionChange = prevProduction > 0 ? ((totalProduction - prevProduction) / prevProduction) * 100 : 0

  // Fetch current inventory
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('current_stock_kg')

  const totalInventory = (warehouses || []).reduce((sum, wh) => sum + (wh.current_stock_kg / 1000), 0)
  const inventoryChange = 19 // Placeholder - would need historical inventory data

  // Fetch active orders
  const { data: activeOrdersData } = await supabase
    .from('work_orders')
    .select('id')
    .in('status', ['pending', 'processing'])

  const activeOrders = activeOrdersData?.length || 0
  const ordersChange = 2 // Placeholder - would need historical comparison

  return {
    totalRevenue: currentRevenue,
    revenueChange,
    totalProduction,
    productionChange,
    totalInventory,
    inventoryChange,
    activeOrders,
    ordersChange,
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <ProjectionDialog />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${stats?.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats && stats.revenueChange >= 0 ? '+' : ''}{stats?.revenueChange.toFixed(1)}% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Production
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalProduction.toFixed(0)} MT</div>
                <p className="text-xs text-muted-foreground">
                  {stats && stats.productionChange >= 0 ? '+' : ''}{stats?.productionChange.toFixed(1)}% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalInventory.toFixed(0)} MT</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.inventoryChange.toFixed(0)}% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeOrders}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.ordersChange} from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${stats?.activeOrders || 0} active orders this month.`}
            </p>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
