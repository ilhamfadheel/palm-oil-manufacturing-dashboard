'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle } from 'lucide-react'
import { ProjectionService, type ProjectionData } from '@/lib/ai/projection-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ProjectionDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [projection, setProjection] = useState<ProjectionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateProjection = async () => {
    setLoading(true)
    setError(null)

    try {
      const service = new ProjectionService()
      const result = await service.generateProjections(30)
      setProjection(result)
      service.dispose()
    } catch (err) {
      console.error('Projection error:', err)
      setError('Failed to generate projections. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600'
      case 'decreasing':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  const formatChartData = () => {
    if (!projection) return []

    const data = []
    const maxLength = Math.max(
      projection.production.predictions.length,
      projection.demand.predictions.length
    )

    for (let i = 0; i < maxLength; i++) {
      data.push({
        date: format(projection.production.predictions[i]?.timestamp || new Date(), 'MMM dd'),
        production: projection.production.predictions[i]?.value || 0,
        demand: projection.demand.predictions[i]?.value || 0,
        inventory: projection.inventory.predictions[i]?.value || 0,
      })
    }

    return data
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate AI Projection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Future Projections
          </DialogTitle>
          <DialogDescription>
            Using LSTM neural networks to forecast production, demand, and inventory for the next 30 days
          </DialogDescription>
        </DialogHeader>

        {!projection && !loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Sparkles className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              Click the button below to generate AI-powered projections based on historical data
            </p>
            <Button onClick={handleGenerateProjection} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Projections
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground">Training AI models and generating projections...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {projection && !loading && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Production Forecast
                    {getTrendIcon(projection.production.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className={`text-2xl font-bold ${getTrendColor(projection.production.trend)}`}>
                      {projection.production.trend.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {(projection.production.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {projection.production.seasonality ? '📊 Seasonal pattern detected' : '📈 No seasonality'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Demand Forecast
                    {getTrendIcon(projection.demand.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className={`text-2xl font-bold ${getTrendColor(projection.demand.trend)}`}>
                      {projection.demand.trend.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {(projection.demand.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {projection.demand.seasonality ? '📊 Seasonal pattern detected' : '📈 No seasonality'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Production-Demand Gap
                    {projection.gap.projected > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {projection.gap.projected > 0 ? '+' : ''}{projection.gap.projected.toFixed(0)} MT
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: {projection.gap.current > 0 ? '+' : ''}{projection.gap.current.toFixed(0)} MT
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>AI Recommendation:</strong> {projection.gap.recommendation}
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>30-Day Forecast</CardTitle>
                <CardDescription>Projected production, demand, and inventory levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
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
                    <Line 
                      type="monotone" 
                      dataKey="production" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Production"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="demand" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Demand"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="inventory" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Inventory"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProjection(null)}>
                Clear
              </Button>
              <Button onClick={handleGenerateProjection} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
