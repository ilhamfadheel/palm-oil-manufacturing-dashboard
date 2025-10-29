'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

const data = [
  { week: 'Week 1', central: 1200, north: 850, south: 920 },
  { week: 'Week 2', central: 1150, north: 900, south: 880 },
  { week: 'Week 3', central: 1300, north: 820, south: 950 },
  { week: 'Week 4', central: 1234, north: 870, south: 895 },
]

export function InventoryChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCentral" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorNorth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorSouth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="week" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          label={{ value: 'Stock (MT)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Area type="monotone" dataKey="central" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCentral)" name="Central Warehouse" />
        <Area type="monotone" dataKey="north" stroke="#10b981" fillOpacity={1} fill="url(#colorNorth)" name="North Facility" />
        <Area type="monotone" dataKey="south" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSouth)" name="South Center" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
