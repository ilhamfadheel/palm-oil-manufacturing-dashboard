'use client'

import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Sale = {
  id: string
  customer: string
  amount: number
  status: "completed" | "pending" | "processing" | "cancelled"
  date: string
}

async function fetchRecentSales(): Promise<Sale[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      id,
      order_code,
      requested_quantity_liters,
      status,
      created_at,
      clients (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error || !data) {
    console.error('Error fetching sales:', error)
    return []
  }

  return data.map((order: any) => ({
    id: order.order_code || `#WO-${order.id.slice(0, 6)}`,
    customer: order.clients?.name || 'Unknown Client',
    amount: (order.requested_quantity_liters / 1000) * 850, // Convert liters to tons, $850 per MT
    status: order.status as Sale['status'],
    date: order.created_at,
  }))
}

const statusVariantMap = {
  completed: "default",
  pending: "outline",
  processing: "secondary",
  cancelled: "destructive",
} as const

const statusTextMap = {
  completed: "Completed",
  pending: "Pending",
  processing: "Processing",
  cancelled: "Cancelled",
} as const

export function RecentSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentSales().then((data) => {
      setSales(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading recent sales...</div>
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customer}</p>
            <p className="text-sm text-muted-foreground">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(sale.amount)}
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <Badge
              variant={statusVariantMap[sale.status]}
              className="text-xs"
            >
              {statusTextMap[sale.status]}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {new Date(sale.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
