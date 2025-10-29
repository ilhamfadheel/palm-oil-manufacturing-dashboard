/**
 * Time Series Forecasting Model using TensorFlow.js
 * Predicts future production, demand, and inventory levels
 */

import * as tf from '@tensorflow/tfjs'

export interface TimeSeriesData {
  timestamp: Date
  value: number
}

export interface ForecastResult {
  predictions: TimeSeriesData[]
  confidence: number
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonality: boolean
}

export class TimeSeriesForecaster {
  private model: tf.LayersModel | null = null
  private scaler: { min: number; max: number } | null = null

  private normalize(data: number[]): { normalized: number[]; min: number; max: number } {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    
    const normalized = data.map(val => (val - min) / range)
    return { normalized, min, max }
  }

  private denormalize(normalized: number[], min: number, max: number): number[] {
    const range = max - min || 1
    return normalized.map(val => val * range + min)
  }

  private createSequences(data: number[], lookback: number): { X: number[][]; y: number[] } {
    const X: number[][] = []
    const y: number[] = []

    for (let i = lookback; i < data.length; i++) {
      X.push(data.slice(i - lookback, i))
      y.push(data[i])
    }

    return { X, y }
  }

  private async buildModel(inputShape: number): Promise<tf.LayersModel> {
    const model = tf.sequential()

    model.add(tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: [inputShape, 1]
    }))

    model.add(tf.layers.dropout({ rate: 0.2 }))

    model.add(tf.layers.lstm({
      units: 50,
      returnSequences: false
    }))

    model.add(tf.layers.dropout({ rate: 0.2 }))

    model.add(tf.layers.dense({ units: 1 }))

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    })

    return model
  }

  async train(historicalData: TimeSeriesData[], lookback: number = 7): Promise<void> {
    const values = historicalData.map(d => d.value)
    
    const { normalized, min, max } = this.normalize(values)
    this.scaler = { min, max }

    const { X, y } = this.createSequences(normalized, lookback)

    if (X.length === 0) {
      throw new Error('Insufficient data for training. Need at least ' + (lookback + 1) + ' data points.')
    }

    const xTensor = tf.tensor3d(X.map(seq => seq.map(val => [val])))
    const yTensor = tf.tensor2d(y, [y.length, 1])

    this.model = await this.buildModel(lookback)

    await this.model.fit(xTensor, yTensor, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 0,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`)
          }
        }
      }
    })

    xTensor.dispose()
    yTensor.dispose()
  }

  async forecast(
    historicalData: TimeSeriesData[],
    steps: number = 30,
    lookback: number = 7
  ): Promise<ForecastResult> {
    if (!this.model || !this.scaler) {
      await this.train(historicalData, lookback)
    }

    const values = historicalData.map(d => d.value)
    const { normalized } = this.normalize(values)

    let currentSequence = normalized.slice(-lookback)
    const predictions: number[] = []

    for (let i = 0; i < steps; i++) {
      const inputTensor = tf.tensor3d([currentSequence.map(val => [val])])
      const prediction = this.model!.predict(inputTensor) as tf.Tensor
      const predValue = (await prediction.data())[0]
      
      predictions.push(predValue)
      currentSequence = [...currentSequence.slice(1), predValue]

      inputTensor.dispose()
      prediction.dispose()
    }

    const denormalizedPredictions = this.denormalize(
      predictions,
      this.scaler!.min,
      this.scaler!.max
    )

    const lastDate = historicalData[historicalData.length - 1].timestamp
    const predictedData: TimeSeriesData[] = denormalizedPredictions.map((value, index) => ({
      timestamp: new Date(lastDate.getTime() + (index + 1) * 24 * 60 * 60 * 1000),
      value: Math.max(0, value)
    }))

    const trend = this.calculateTrend(denormalizedPredictions)
    const confidence = this.calculateConfidence(values, denormalizedPredictions)
    const seasonality = this.detectSeasonality(values)

    return {
      predictions: predictedData,
      confidence,
      trend,
      seasonality
    }
  }

  private calculateTrend(predictions: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (predictions.length < 2) return 'stable'

    const firstHalf = predictions.slice(0, Math.floor(predictions.length / 2))
    const secondHalf = predictions.slice(Math.floor(predictions.length / 2))

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

    const change = ((secondAvg - firstAvg) / firstAvg) * 100

    if (change > 5) return 'increasing'
    if (change < -5) return 'decreasing'
    return 'stable'
  }

  private calculateConfidence(historical: number[], predictions: number[]): number {
    const mean = historical.reduce((a, b) => a + b, 0) / historical.length
    const variance = historical.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historical.length
    const stdDev = Math.sqrt(variance)

    const coefficientOfVariation = stdDev / mean
    const confidence = Math.max(0, Math.min(1, 1 - coefficientOfVariation))

    return confidence
  }

  private detectSeasonality(data: number[]): boolean {
    if (data.length < 14) return false

    const lag = 7
    let correlation = 0
    const mean = data.reduce((a, b) => a + b, 0) / data.length

    for (let i = lag; i < data.length; i++) {
      correlation += (data[i] - mean) * (data[i - lag] - mean)
    }

    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0)
    const autocorrelation = correlation / variance

    return Math.abs(autocorrelation) > 0.3
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
    }
  }
}

export function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data[i])
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / window)
    }
  }
  
  return result
}

export function exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  const smoothed: number[] = [data[0]]
  
  for (let i = 1; i < data.length; i++) {
    smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1])
  }
  
  return smoothed
}
