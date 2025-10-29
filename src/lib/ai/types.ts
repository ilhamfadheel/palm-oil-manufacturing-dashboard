import { z } from 'zod'

// Input schema for trajectory calculation
export const TrajectoryInputSchema = z.object({
  farmId: z.string(),
  harvestQuantity: z.number().min(0),
  harvestQuality: z.enum(['A', 'B', 'C']),
  farmLocation: z.object({ lat: z.number(), lng: z.number() }),
  
  warehouseId: z.string(),
  warehouseCapacity: z.number(),
  currentStock: z.number(),
  warehouseLocation: z.object({ lat: z.number(), lng: z.number() }),
  
  refineryId: z.string(),
  refineryCapacity: z.number(),
  currentLoad: z.number(),
  oilExtractionRate: z.number().min(0).max(1),
  
  clientId: z.string(),
  demandQuantity: z.number(),
  deliveryDeadline: z.string(),
  priority: z.enum(['normal', 'high', 'urgent']),
  
  availableVehicles: z.array(z.object({
    id: z.string(),
    capacity: z.number(),
    fuelEfficiency: z.number(),
    currentLocation: z.object({ lat: z.number(), lng: z.number() }),
  })),
  
  fuelPrice: z.number(),
  demandForecast: z.number(),
  seasonalFactor: z.number().min(0).max(2),
})

export type TrajectoryInput = z.infer<typeof TrajectoryInputSchema>

export const TrajectoryOutputSchema = z.object({
  recommendedRoute: z.array(z.object({
    step: z.number(),
    location: z.string(),
    action: z.string(),
    estimatedTime: z.string(),
    cost: z.number(),
  })),
  
  vehicleAssignment: z.object({
    vehicleId: z.string(),
    capacity: z.number(),
    loadQuantity: z.number(),
  }),
  
  refinerySchedule: z.object({
    refineryId: z.string(),
    scheduledTime: z.string(),
    estimatedOutput: z.number(),
    processingDuration: z.string(),
  }),
  
  costAnalysis: z.object({
    transportCost: z.number(),
    processingCost: z.number(),
    storageCost: z.number(),
    totalCost: z.number(),
  }),
  
  riskAssessment: z.object({
    delayRisk: z.enum(['low', 'medium', 'high']),
    qualityRisk: z.enum(['low', 'medium', 'high']),
    costOverrunRisk: z.enum(['low', 'medium', 'high']),
    recommendations: z.array(z.string()),
  }),
  
  efficiency: z.object({
    fuelEfficiency: z.number(),
    timeEfficiency: z.number(),
    costEfficiency: z.number(),
    overallScore: z.number().min(0).max(100),
  }),
  
  aiConfidence: z.number().min(0).max(1),
  alternativeRoutes: z.array(z.object({
    routeId: z.string(),
    description: z.string(),
    estimatedCost: z.number(),
    estimatedTime: z.string(),
  })),
})

export type TrajectoryOutput = z.infer<typeof TrajectoryOutputSchema>
