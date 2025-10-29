'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Package, ShoppingCart, Factory, Truck, Warehouse, Users } from "lucide-react"
import { ProductionChart } from "@/components/charts/production-chart"
import { InventoryChart } from "@/components/charts/inventory-chart"
import { OrdersChart } from "@/components/charts/orders-chart"
import { SupplyChainFlow } from "@/components/supply-chain-flow"
import { createClient } from '@/lib/supabase/client'
import { subDays } from 'date-fns'

interface HomeStats {
  totalRevenue: number
  revenueChange: number
  totalProduction: number
  productionChange: number
  totalInventory: number
  inventoryChange: number
  activeOrders: number
  ordersChange: number
}

async function fetchHomeStats(): Promise<HomeStats> {
  const supabase = createClient()
  const thirtyDaysAgo = subDays(new Date(), 30)
  const sixtyDaysAgo = subDays(new Date(), 60)

  // Fetch current month's work orders for revenue
  const { data: currentOrders } = await supabase
    .from('work_orders')
    .select('requested_quantity_liters')
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Fetch previous month's work orders
  const { data: previousOrders } = await supabase
    .from('work_orders')
    .select('requested_quantity_liters')
    .gte('created_at', sixtyDaysAgo.toISOString())
    .lt('created_at', thirtyDaysAgo.toISOString())

  const currentRevenue = (currentOrders || []).reduce((sum, order) => sum + (order.requested_quantity_liters / 1000) * 850, 0)
  const previousRevenue = (previousOrders || []).reduce((sum, order) => sum + (order.requested_quantity_liters / 1000) * 850, 0)
  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

  // Fetch production data
  const { data: currentProduction } = await supabase
    .from('production_batches')
    .select('output_oil_liters')
    .gte('start_time', thirtyDaysAgo.toISOString())

  const { data: previousProduction } = await supabase
    .from('production_batches')
    .select('output_oil_liters')
    .gte('start_time', sixtyDaysAgo.toISOString())
    .lt('start_time', thirtyDaysAgo.toISOString())

  const totalProduction = (currentProduction || []).reduce((sum, batch) => sum + (batch.output_oil_liters / 1000), 0)
  const prevProduction = (previousProduction || []).reduce((sum, batch) => sum + (batch.output_oil_liters / 1000), 0)
  const productionChange = prevProduction > 0 ? ((totalProduction - prevProduction) / prevProduction) * 100 : 0

  // Fetch inventory
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('current_stock_kg')

  const totalInventory = (warehouses || []).reduce((sum, wh) => sum + (wh.current_stock_kg / 1000), 0)

  // Fetch active orders
  const { data: activeOrdersData } = await supabase
    .from('work_orders')
    .select('id')
    .in('status', ['pending', 'processing'])

  const activeOrders = activeOrdersData?.length || 0

  return {
    totalRevenue: currentRevenue,
    revenueChange,
    totalProduction,
    productionChange,
    totalInventory,
    inventoryChange: 19,
    activeOrders,
    ordersChange: 2,
  }
}

export default function HomePage() {
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-background to-muted/20 py-12">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Palm Oil Manufacturing Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Optimize your supply chain from farm to client with AI-powered insights
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    <BarChart3 className="h-5 w-5" />
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="container py-12">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ${stats?.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stats && stats.revenueChange >= 0 ? '+' : ''}{stats?.revenueChange.toFixed(1)}% from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Production</CardTitle>
                <Factory className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.totalProduction.toFixed(0)} MT</div>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stats && stats.productionChange >= 0 ? '+' : ''}{stats?.productionChange.toFixed(1)}% from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                <Package className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.totalInventory.toFixed(0)} MT</div>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{stats?.inventoryChange}% from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.activeOrders}</div>
                    <p className="text-xs text-purple-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{stats?.ordersChange} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Supply Chain Flow */}
        <section className="container py-12">
          <Card>
            <CardHeader>
              <CardTitle>Supply Chain Overview</CardTitle>
              <CardDescription>Track your palm oil journey from farm to client</CardDescription>
            </CardHeader>
            <CardContent>
              <SupplyChainFlow />
            </CardContent>
          </Card>
        </section>

        {/* Charts Section */}
        <section className="container py-12">
          <Tabs defaultValue="production" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="production">Production Trends</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Levels</TabsTrigger>
              <TabsTrigger value="orders">Order Fulfillment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="production" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Production Output (Last 6 Months)</CardTitle>
                  <CardDescription>Monthly production volume in metric tons</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ProductionChart />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Levels</CardTitle>
                  <CardDescription>Current stock across all warehouses</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <InventoryChart />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Fulfillment Rate</CardTitle>
                  <CardDescription>Monthly order completion statistics</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <OrdersChart />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Features Grid */}
        <section className="border-t bg-muted/20 py-12">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
              <p className="text-muted-foreground mt-2">Everything you need to optimize your operations</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Warehouse className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Inventory Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Real-time tracking of stock levels across multiple warehouses with automated alerts
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Truck className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Logistics Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI-powered route planning to reduce fuel costs and delivery times
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Factory className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Production Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Optimize refinery schedules based on demand forecasts and capacity
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Demand Forecasting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Predict future demand using historical data and market trends
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Client Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track work orders and maintain strong relationships with your clients
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Analytics & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Data-driven insights to reduce waste and improve efficiency
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Palm Oil Manufacturing Dashboard. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
