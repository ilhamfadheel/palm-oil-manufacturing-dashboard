-- Migration: Historical Data Seed for Past 4 Weeks
-- Purpose: Populate database with realistic historical data for AI projections

-- Generate production batches for the past 30 days
INSERT INTO production_batches (
  batch_code,
  refinery_id,
  warehouse_id,
  input_fruit_kg,
  output_oil_liters,
  start_time,
  end_time,
  status,
  quality_metrics
)
SELECT 
  'BATCH-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
  (SELECT id FROM refineries ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM warehouses ORDER BY RANDOM() LIMIT 1),
  (1800000 + (RANDOM() * 400000))::DECIMAL(10,2), -- Input: 1800-2200 tons (in kg)
  ((1800000 + (RANDOM() * 400000)) * (0.18 + RANDOM() * 0.04))::DECIMAL(10,2), -- Output: 18-22% extraction rate (in liters)
  CURRENT_DATE - (generate_series * INTERVAL '1 day') + (RANDOM() * INTERVAL '8 hours'),
  CURRENT_DATE - (generate_series * INTERVAL '1 day') + (RANDOM() * INTERVAL '8 hours') + INTERVAL '6 hours',
  'completed',
  jsonb_build_object(
    'quality_grade', (ARRAY['A', 'B', 'C'])[FLOOR(RANDOM() * 3 + 1)],
    'extraction_rate', (0.18 + RANDOM() * 0.04)::DECIMAL(5,4)
  )
FROM generate_series(0, 29) AS generate_series;

-- Generate work orders (demand) for the past 30 days
INSERT INTO work_orders (
  order_code,
  client_id,
  field_rep_id,
  requested_quantity_liters,
  requested_delivery_date,
  actual_delivery_date,
  fulfilled_quantity_liters,
  status,
  priority,
  created_at,
  updated_at
)
SELECT 
  'WO-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
  (SELECT id FROM clients ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM field_representatives ORDER BY RANDOM() LIMIT 1),
  (1500000 + (RANDOM() * 600000))::DECIMAL(10,2), -- Demand: 1500-2100 tons (in liters)
  CURRENT_DATE + ((RANDOM() * 14)::INT * INTERVAL '1 day'), -- Delivery in next 2 weeks
  CASE 
    WHEN generate_series > 5 THEN CURRENT_DATE - (generate_series * INTERVAL '1 day') + ((RANDOM() * 7)::INT * INTERVAL '1 day')
    ELSE NULL
  END,
  CASE 
    WHEN generate_series > 5 THEN (1500000 + (RANDOM() * 600000))::DECIMAL(10,2)
    ELSE NULL
  END,
  (ARRAY['pending', 'processing', 'completed', 'cancelled'])[
    CASE 
      WHEN generate_series < 5 THEN FLOOR(RANDOM() * 2 + 1) -- Recent: pending or processing
      ELSE FLOOR(RANDOM() * 4 + 1) -- Older: any status
    END
  ],
  (ARRAY['normal', 'high', 'urgent'])[FLOOR(RANDOM() * 3 + 1)],
  CURRENT_DATE - (generate_series * INTERVAL '1 day') + (RANDOM() * INTERVAL '12 hours'),
  CURRENT_DATE - (generate_series * INTERVAL '1 day') + (RANDOM() * INTERVAL '12 hours')
FROM generate_series(0, 29) AS generate_series;

-- Generate harvests for the past 30 days
INSERT INTO harvests (
  farm_id,
  harvest_date,
  quantity_kg,
  quality_grade,
  cv_confidence_score,
  notes
)
SELECT 
  (SELECT id FROM farms ORDER BY RANDOM() LIMIT 1),
  CURRENT_DATE - (generate_series * INTERVAL '1 day'),
  (2000000 + (RANDOM() * 500000))::DECIMAL(10,2), -- Harvest: 2000-2500 tons (in kg)
  (ARRAY['A', 'B', 'C'])[FLOOR(RANDOM() * 3 + 1)],
  (0.75 + RANDOM() * 0.20)::DECIMAL(5,4), -- CV confidence: 75-95%
  'Historical harvest data for AI forecasting'
FROM generate_series(0, 29) AS generate_series;

-- Generate shipments for the past 30 days
INSERT INTO shipments (
  shipment_code,
  farm_id,
  vehicle_id,
  warehouse_id,
  quantity_kg,
  dispatch_time,
  arrival_time,
  estimated_fuel_liters,
  actual_fuel_liters,
  route_data,
  status
)
SELECT 
  'SHIP-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
  (SELECT id FROM farms ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM vehicles ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM warehouses ORDER BY RANDOM() LIMIT 1),
  (1200000 + (RANDOM() * 600000))::DECIMAL(10,2), -- Cargo: 1200-1800 tons (in kg)
  CURRENT_DATE - (generate_series * INTERVAL '1 day') + (RANDOM() * INTERVAL '8 hours'),
  CASE 
    WHEN generate_series > 2 THEN CURRENT_DATE - (generate_series * INTERVAL '1 day') + INTERVAL '1 day' + (RANDOM() * INTERVAL '4 hours')
    ELSE NULL
  END,
  (150 + RANDOM() * 50)::DECIMAL(8,2), -- Estimated fuel: 150-200 liters
  CASE 
    WHEN generate_series > 2 THEN (150 + RANDOM() * 50)::DECIMAL(8,2)
    ELSE NULL
  END,
  jsonb_build_object(
    'distance_km', (200 + RANDOM() * 300)::INT,
    'route_type', (ARRAY['highway', 'rural', 'mixed'])[FLOOR(RANDOM() * 3 + 1)]
  ),
  CASE 
    WHEN generate_series > 2 THEN 'delivered'
    WHEN generate_series > 1 THEN 'in_transit'
    ELSE 'pending'
  END
FROM generate_series(0, 29) AS generate_series;

-- Generate demand forecasts for the past 30 days
INSERT INTO demand_forecasts (
  forecast_month,
  predicted_demand_liters,
  confidence_interval_lower,
  confidence_interval_upper,
  client_breakdown,
  model_version,
  generated_at
)
SELECT 
  CURRENT_DATE - (generate_series * INTERVAL '1 day'),
  (1600000 + (RANDOM() * 500000))::DECIMAL(10,2), -- Forecast: 1600-2100 tons (in liters)
  (1400000 + (RANDOM() * 400000))::DECIMAL(10,2), -- Lower bound
  (1800000 + (RANDOM() * 600000))::DECIMAL(10,2), -- Upper bound
  jsonb_build_object(
    'confidence_score', (0.70 + RANDOM() * 0.25)::DECIMAL(5,4)
  ),
  'v1.0-lstm',
  CURRENT_DATE - (generate_series * INTERVAL '1 day')
FROM generate_series(0, 29) AS generate_series;

-- Generate harvest forecasts for the past 30 days
INSERT INTO harvest_forecasts (
  farm_id,
  forecast_month,
  predicted_quantity_kg,
  confidence_interval_lower,
  confidence_interval_upper,
  model_version,
  generated_at
)
SELECT 
  (SELECT id FROM farms ORDER BY RANDOM() LIMIT 1),
  CURRENT_DATE - (generate_series * INTERVAL '1 day'),
  (2100000 + (RANDOM() * 400000))::DECIMAL(10,2), -- Forecast: 2100-2500 tons (in kg)
  (1900000 + (RANDOM() * 300000))::DECIMAL(10,2), -- Lower bound
  (2300000 + (RANDOM() * 500000))::DECIMAL(10,2), -- Upper bound
  'v1.0-lstm',
  CURRENT_DATE - (generate_series * INTERVAL '1 day')
FROM generate_series(0, 29) AS generate_series;

-- Update warehouse stock levels with realistic values
UPDATE warehouses
SET 
  current_stock_kg = (800000 + (RANDOM() * 600000))::DECIMAL(12,2), -- Stock: 800-1400 tons (in kg)
  updated_at = CURRENT_TIMESTAMP;

-- Generate excess analysis records
INSERT INTO excess_analysis (
  analysis_date,
  context_type,
  context_id,
  excess_type,
  excess_amount,
  excess_unit,
  estimated_cost_impact_usd,
  recommendations
)
SELECT 
  CURRENT_DATE - (generate_series * INTERVAL '1 day'),
  'production',
  gen_random_uuid(),
  'overproduction',
  ((1900000 + (RANDOM() * 300000)) - (1800000 + (RANDOM() * 350000)))::DECIMAL(10,2), -- Excess in kg
  'kg',
  (RANDOM() * 5000)::DECIMAL(10,2), -- Storage cost
  jsonb_build_array(
    'Optimize production scheduling',
    'Increase marketing efforts',
    'Review storage capacity',
    'Adjust refinery output'
  )
FROM generate_series(0, 29) AS generate_series;

-- Add some variability with trends
-- Increasing production trend over the past 2 weeks
UPDATE production_batches
SET output_oil_liters = output_oil_liters * 1.10
WHERE start_time >= CURRENT_DATE - INTERVAL '14 days';

-- Seasonal demand pattern (higher on weekdays)
UPDATE work_orders
SET requested_quantity_liters = requested_quantity_liters * 1.05
WHERE EXTRACT(DOW FROM created_at) BETWEEN 1 AND 5;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_production_batches_date ON production_batches(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_work_orders_date ON work_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_harvests_date ON harvests(harvest_date DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_date ON shipments(dispatch_time DESC);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_date ON demand_forecasts(forecast_month DESC);
CREATE INDEX IF NOT EXISTS idx_harvest_forecasts_date ON harvest_forecasts(forecast_month DESC);

-- Add comments
COMMENT ON TABLE production_batches IS 'Historical production data for AI time series forecasting';
COMMENT ON TABLE work_orders IS 'Historical demand data for AI projections';
COMMENT ON TABLE demand_forecasts IS 'AI-generated demand predictions';
COMMENT ON TABLE harvest_forecasts IS 'AI-generated harvest predictions';
COMMENT ON TABLE excess_analysis IS 'Historical excess production analysis';
