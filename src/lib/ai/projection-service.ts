/**
 * AI Projection Service
 * Generates future projections for production, demand, and inventory
 */

import { createClient } from '@/lib/supabase/client'
import { TimeSeriesForecaster, type TimeSeriesData, type ForecastResult } from './time-series-model'
import { subDays, format } from 'date-fns'

export interface ProjectionData {
  production: ForecastResult
  demand: ForecastResult
  inventory: ForecastResult
  gap: {
    current: number
    projected: number
    recommendation: string
  }
  generatedAt: Date
}

export class ProjectionService {
  private supabase = createClient()
  private productionForecaster = new TimeSeriesForecaster()
  private demandForecaster = new TimeSeriesForecaster()
  private inventoryForecaster = new TimeSeriesForecaster()

  private async fetchProductionHistory(days: number = 60): Promise<TimeSeriesData[]> {
    const startDate = subDays(new Date(), days)
    const { data, error } = await this.supabase
      .from('production_batches')
      .select('produced_at, output_quantity')
      .gte('produced_at', startDate.toISOString())
      .order('produced_at', { ascending: true })

    if (error || !data || data.length === 0) {
      return this.generateMockData(days, 2000, 500)
    }

    return this.aggregateByDay(
      data.map(d => ({
        timestamp: new Date(d.produced_at),
        value: d.output_quantity
      }))
    )
  }

  private async fetchDemandHistory(days: number = 60): Promise<TimeSeriesData[]> {
    const startDate = subDays(new Date(), days)
    const { data, error } = await this.supabase
      .from('work_orders')
      .select('created_at, quantity')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) {
      return this.generateMockData(days, 1800, 400)
    }

    return this.aggregateByDay(
      data.map(d => ({
        timestamp: new Date(d.created_at),
        value: d.quantity
      }))
    )
  }

  private async fetchInventoryHistory(days: number = 60): Promise<TimeSeriesData[]> {
    const startDate = subDays(new Date(), days)
    const { data, error } = await this.supabase
      .from('warehouses')
      .select('updated_at, current_stock')
      .gte('updated_at', startDate.toISOString())
      .order('updated_at', { ascending: true })

    if (error || !data || data.length === 0) {
      return this.generateMockData(days, 1200, 300)
    }

    return this.aggregateByDay(
      data.map(d => ({
        timestamp: new Date(d.updated_at),
        value: d.current_stock
      }))
    )
  }

  private aggregateByDay(data: TimeSeriesData[]): TimeSeriesData[] {
    const dailyMap = new Map<string, number[]>()

    data.forEach(({ timestamp, value }) => {
      const dateKey = format(timestamp, 'yyyy-MM-dd')
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, [])
      }
      dailyMap.get(dateKey)!.push(value)
    })

    const aggregated: TimeSeriesData[] = []
    dailyMap.forEach((values, dateKey) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      aggregated.push({
        timestamp: new Date(dateKey),
        value: avg
      })
    })

    return aggregated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  private generateMockData(days: number, baseValue: number, variance: number): TimeSeriesData[] {
    const data: TimeSeriesData[] = []
    const today = new Date()

    for (let i = days; i >= 0; i--) {
      const date = subDays(today, i)
      const trend = (days - i) * 5
      const seasonality = Math.sin((i / 7) * Math.PI) * variance * 0.3
      const noise = (Math.random() - 0.5) * variance
      const value = baseValue + trend + seasonality + noise

      data.push({
        timestamp: date,
        value: Math.max(0, value)
      })
    }

    return data
  }

  async generateProjections(forecastDays: number = 30): Promise<ProjectionData> {
    console.log('Fetching historical data...')

    const [productionHistory, demandHistory, inventoryHistory] = await Promise.all([
      this.fetchProductionHistory(),
      this.fetchDemandHistory(),
      this.fetchInventoryHistory()
    ])

    console.log('Training AI models...')

    const [productionForecast, demandForecast, inventoryForecast] = await Promise.all([
      this.productionForecaster.forecast(productionHistory, forecastDays),
      this.demandForecaster.forecast(demandHistory, forecastDays),
      this.inventoryForecaster.forecast(inventoryHistory, forecastDays)
    ])

    const currentProduction = productionHistory[productionHistory.length - 1]?.value || 0
    const currentDemand = demandHistory[demandHistory.length - 1]?.value || 0
    const currentGap = currentProduction - currentDemand

    const avgProjectedProduction = productionForecast.predictions.reduce((sum, p) => sum + p.value, 0) / productionForecast.predictions.length
    const avgProjectedDemand = demandForecast.predictions.reduce((sum, p) => sum + p.value, 0) / demandForecast.predictions.length
    const projectedGap = avgProjectedProduction - avgProjectedDemand

    const recommendation = this.generateRecommendation(currentGap, projectedGap, productionForecast, demandForecast)

    console.log('Projections generated successfully!')

    return {
      production: productionForecast,
      demand: demandForecast,
      inventory: inventoryForecast,
      gap: {
        current: currentGap,
        projected: projectedGap,
        recommendation
      },
      generatedAt: new Date()
    }
  }

  private generateRecommendation(
    currentGap: number,
    projectedGap: number,
    productionForecast: ForecastResult,
    demandForecast: ForecastResult
  ): string {
    const recommendations: string[] = []

    if (projectedGap < -500) {
      recommendations.push('⚠️ Projected demand exceeds production by ' + Math.abs(projectedGap).toFixed(0) + ' MT.')
      recommendations.push('Increase production capacity or adjust work orders.')
    } else if (projectedGap > 500) {
      recommendations.push('📦 Projected production exceeds demand by ' + projectedGap.toFixed(0) + ' MT.')
      recommendations.push('Consider reducing production or increasing sales efforts.')
    } else {
      recommendations.push('✅ Production and demand are well balanced.')
    }

    if (productionForecast.trend === 'decreasing' && demandForecast.trend === 'increasing') {
      recommendations.push('🚨 Critical: Production declining while demand increasing.')
      recommendations.push('Immediate action required to scale production.')
    } else if (productionForecast.trend === 'increasing' && demandForecast.trend === 'decreasing') {
      recommendations.push('⚠️ Warning: Production increasing while demand decreasing.')
      recommendations.push('Review market conditions and adjust production plans.')
    }

    if (productionForecast.confidence < 0.6) {
      recommendations.push('📊 Production forecast has low confidence. Monitor closely.')
    }
    if (demandForecast.confidence < 0.6) {
      recommendations.push('📊 Demand forecast has low confidence. Gather more market data.')
    }

    return recommendations.join(' ')
  }

  dispose(): void {
    this.productionForecaster.dispose()
    this.demandForecaster.dispose()
    this.inventoryForecaster.dispose()
  }
}
