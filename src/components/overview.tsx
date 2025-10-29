'use client'

import { Line } from "react-chartjs-2"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { subDays, format } from "date-fns"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

async function fetchChartData() {
  const supabase = createClient()
  const startDate = subDays(new Date(), 30)

  // Fetch production data
  const { data: productionData } = await supabase
    .from('production_batches')
    .select('start_time, output_oil_liters')
    .gte('start_time', startDate.toISOString())
    .order('start_time', { ascending: true })

  // Fetch demand data (work orders)
  const { data: demandData } = await supabase
    .from('work_orders')
    .select('created_at, requested_quantity_liters')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  // Aggregate by day
  const productionByDay = aggregateByDay(productionData || [])
  const demandByDay = aggregateByDay(demandData || [])

  return { productionByDay, demandByDay }
}

function aggregateByDay(data: any[]) {
  const dailyMap = new Map<string, number[]>()

  data.forEach((item) => {
    const date = item.start_time || item.created_at
    const value = (item.output_oil_liters || item.requested_quantity_liters) / 1000 // Convert liters to tons
    const dateKey = format(new Date(date), 'MMM dd')
    
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, [])
    }
    dailyMap.get(dateKey)!.push(value)
  })

  const result: { label: string; value: number }[] = []
  dailyMap.forEach((values, dateKey) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    result.push({ label: dateKey, value: avg })
  })

  return result
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

export function Overview() {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData().then(({ productionByDay, demandByDay }) => {
      const labels = productionByDay.map(d => d.label)
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Production (MT)',
            data: productionByDay.map(d => d.value),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.3,
          },
          {
            label: 'Demand (MT)',
            data: demandByDay.map(d => d.value),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.3,
          },
        ],
      })
      setLoading(false)
    })
  }, [])

  if (loading || !chartData) {
    return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>
  }

  return (
    <div className="h-[350px] w-full">
      <Line options={options} data={chartData} />
    </div>
  )
}
