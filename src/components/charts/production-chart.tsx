'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'May', production: 2100, target: 2000 },
  { month: 'Jun', production: 2250, target: 2200 },
  { month: 'Jul', production: 2180, target: 2300 },
  { month: 'Aug', production: 2400, target: 2400 },
  { month: 'Sep', production: 2300, target: 2350 },
  { month: 'Oct', production: 2345, target: 2300 },
]

export function ProductionChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          label={{ value: 'Metric Tons', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Bar dataKey="production" fill="hsl(var(--primary))" name="Actual Production" radius={[4, 4, 0, 0]} />
        <Bar dataKey="target" fill="hsl(var(--muted-foreground))" name="Target" radius={[4, 4, 0, 0]} opacity={0.6} />
      </BarChart>
    </ResponsiveContainer>
  )
}
