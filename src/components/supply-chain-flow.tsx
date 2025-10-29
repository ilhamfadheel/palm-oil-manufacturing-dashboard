'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Sprout, Truck, Warehouse, Factory, Package, Users } from 'lucide-react'
import { Badge } from './ui/badge'
import { createClient } from '@/lib/supabase/client'

interface SupplyChainData {
  farms: { count: number; status: string }
  vehicles: { count: number; inTransit: number }
  warehouses: { count: number; capacityPercent: number }
  refineries: { count: number; processing: number }
  orders: { count: number; ready: number }
  clients: { count: number; active: number }
}

async function fetchSupplyChainData(): Promise<SupplyChainData> {
  const supabase = createClient()

  // Fetch farms count
  const { data: farms } = await supabase
    .from('farms')
    .select('id')

  // Fetch vehicles and in-transit count
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, status')

  const inTransitCount = vehicles?.filter(v => v.status === 'in_use').length || 0

  // Fetch warehouses and calculate capacity
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('current_stock_kg, capacity_kg')

  const totalCapacity = warehouses?.reduce((sum, wh) => sum + (wh.capacity_kg || 0), 0) || 1
  const totalStock = warehouses?.reduce((sum, wh) => sum + (wh.current_stock_kg || 0), 0) || 0
  const capacityPercent = Math.round((totalStock / totalCapacity) * 100)

  // Fetch refineries and processing batches
  const { data: refineries } = await supabase
    .from('refineries')
    .select('id')

  const { data: processingBatches } = await supabase
    .from('production_batches')
    .select('id')
    .eq('status', 'processing')

  // Fetch orders
  const { data: allOrders } = await supabase
    .from('work_orders')
    .select('id, status')

  const readyOrders = allOrders?.filter(o => o.status === 'completed').length || 0

  // Fetch clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id')

  // Count active clients (those with recent orders)
  const { data: activeClients } = await supabase
    .from('work_orders')
    .select('client_id')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const uniqueActiveClients = new Set(activeClients?.map(o => o.client_id)).size

  return {
    farms: {
      count: farms?.length || 0,
      status: 'Active',
    },
    vehicles: {
      count: vehicles?.length || 0,
      inTransit: inTransitCount,
    },
    warehouses: {
      count: warehouses?.length || 0,
      capacityPercent,
    },
    refineries: {
      count: refineries?.length || 0,
      processing: processingBatches?.length || 0,
    },
    orders: {
      count: allOrders?.length || 0,
      ready: readyOrders,
    },
    clients: {
      count: clients?.length || 0,
      active: uniqueActiveClients,
    },
  }
}

export function SupplyChainFlow() {
  const [data, setData] = useState<SupplyChainData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupplyChainData().then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading supply chain data...</p>
      </div>
    )
  }

  const stages = [
    {
      icon: Sprout,
      title: 'Farm',
      value: `${data?.farms.count || 0} Farms`,
      status: data?.farms.status || 'Active',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      icon: Truck,
      title: 'Logistics',
      value: `${data?.vehicles.count || 0} Vehicles`,
      status: `${data?.vehicles.inTransit || 0} In Transit`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: Warehouse,
      title: 'Warehouse',
      value: `${data?.warehouses.count || 0} Locations`,
      status: `${data?.warehouses.capacityPercent || 0}% Capacity`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
    {
      icon: Factory,
      title: 'Refinery',
      value: `${data?.refineries.count || 0} Plants`,
      status: `${data?.refineries.processing || 0} Processing`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      icon: Package,
      title: 'Distribution',
      value: `${data?.orders.count || 0} Orders`,
      status: `${data?.orders.ready || 0} Ready`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      icon: Users,
      title: 'Clients',
      value: `${data?.clients.active || 0} Active`,
      status: `${data?.clients.count || 0} Total`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-8">
      {stages.map((stage, index) => (
        <div key={stage.title} className="flex items-center gap-4">
          <div className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 ${stage.bgColor} transition-all hover:scale-105`}>
            <div className={`p-3 rounded-full ${stage.bgColor}`}>
              <stage.icon className={`h-8 w-8 ${stage.color}`} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-sm">{stage.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{stage.value}</p>
              <Badge variant="secondary" className="mt-2 text-xs">
                {stage.status}
              </Badge>
            </div>
          </div>
          {index < stages.length - 1 && (
            <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
          )}
        </div>
      ))}
    </div>
  )
}
