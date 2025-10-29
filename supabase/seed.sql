-- Sample Data for Palm Oil Manufacturing Dashboard
-- Run this after running the initial migration to populate the database with test data

-- =====================================================
-- FARMS
-- =====================================================
INSERT INTO farms (name, location, total_area_hectares, active_trees) VALUES
('Green Valley Farm', '{"lat": 2.5, "lng": 101.5, "address": "Selangor, Malaysia"}', 150.5, 5000),
('Sunrise Plantation', '{"lat": 3.2, "lng": 101.7, "address": "Perak, Malaysia"}', 200.0, 7500),
('Golden Harvest Estate', '{"lat": 2.8, "lng": 101.3, "address": "Negeri Sembilan, Malaysia"}', 175.3, 6200);

-- =====================================================
-- WAREHOUSES
-- =====================================================
INSERT INTO warehouses (name, location, capacity_kg, current_stock_kg) VALUES
('Central Warehouse', '{"lat": 3.0, "lng": 101.6, "address": "Kuala Lumpur, Malaysia"}', 500000, 125000),
('North Storage Facility', '{"lat": 3.5, "lng": 101.8, "address": "Selangor, Malaysia"}', 350000, 87500),
('South Distribution Center', '{"lat": 2.3, "lng": 101.4, "address": "Melaka, Malaysia"}', 400000, 95000);

-- =====================================================
-- REFINERIES
-- =====================================================
INSERT INTO refineries (name, location, processing_capacity_kg_per_day, oil_extraction_rate) VALUES
('Main Refinery', '{"lat": 3.1, "lng": 101.65, "address": "Kuala Lumpur, Malaysia"}', 50000, 0.20),
('Secondary Processing Plant', '{"lat": 2.9, "lng": 101.55, "address": "Selangor, Malaysia"}', 35000, 0.19);

-- =====================================================
-- VEHICLES
-- =====================================================
INSERT INTO vehicles (vehicle_code, capacity_kg, fuel_efficiency_km_per_liter, status) VALUES
('TRK-001', 10000, 8.5, 'available'),
('TRK-002', 12000, 8.0, 'available'),
('TRK-003', 10000, 9.0, 'available'),
('TRK-004', 15000, 7.5, 'in_transit'),
('TRK-005', 10000, 8.5, 'available');

-- =====================================================
-- CLIENTS
-- =====================================================
INSERT INTO clients (name, client_type, average_monthly_order_liters, contact_info) VALUES
('ABC Manufacturing Sdn Bhd', 'manufacturer', 50000, '{"email": "orders@abc-mfg.com", "phone": "+60123456789"}'),
('XYZ Food Industries', 'manufacturer', 35000, '{"email": "procurement@xyz-food.com", "phone": "+60198765432"}'),
('Global Distributors Ltd', 'distributor', 75000, '{"email": "supply@globaldist.com", "phone": "+60187654321"}'),
('Premium Oils Co', 'retailer', 25000, '{"email": "buying@premiumoils.com", "phone": "+60176543210"}'),
('Southeast Trading', 'distributor', 60000, '{"email": "orders@setrading.com", "phone": "+60165432109"}');

-- =====================================================
-- FIELD REPRESENTATIVES
-- =====================================================
INSERT INTO field_representatives (name, email, phone, territory) VALUES
('Ahmad bin Hassan', 'ahmad.hassan@company.com', '+60123456789', '{"regions": ["Selangor", "Kuala Lumpur"], "clients": []}'),
('Siti Nurhaliza', 'siti.n@company.com', '+60198765432', '{"regions": ["Perak", "Penang"], "clients": []}'),
('Kumar Selvam', 'kumar.s@company.com', '+60187654321', '{"regions": ["Johor", "Melaka"], "clients": []}');

-- =====================================================
-- SAMPLE HARVESTS (Last 3 months)
-- =====================================================
INSERT INTO harvests (farm_id, harvest_date, quantity_kg, quality_grade, cv_confidence_score) 
SELECT 
    f.id,
    CURRENT_DATE - (random() * 90)::integer,
    (random() * 5000 + 3000)::numeric(10,2),
    CASE 
        WHEN random() < 0.6 THEN 'A'
        WHEN random() < 0.9 THEN 'B'
        ELSE 'C'
    END,
    (random() * 0.2 + 0.8)::numeric(5,4)
FROM farms f, generate_series(1, 12) s;

-- =====================================================
-- SAMPLE WORK ORDERS
-- =====================================================
INSERT INTO work_orders (order_code, client_id, field_rep_id, requested_quantity_liters, requested_delivery_date, status, priority)
SELECT 
    'WO-' || LPAD((ROW_NUMBER() OVER ())::text, 5, '0'),
    c.id,
    fr.id,
    (random() * 30000 + 10000)::numeric(10,2),
    CURRENT_DATE + (random() * 60)::integer,
    CASE 
        WHEN random() < 0.3 THEN 'pending'
        WHEN random() < 0.6 THEN 'confirmed'
        WHEN random() < 0.9 THEN 'fulfilled'
        ELSE 'cancelled'
    END,
    CASE 
        WHEN random() < 0.7 THEN 'normal'
        WHEN random() < 0.9 THEN 'high'
        ELSE 'urgent'
    END
FROM clients c
CROSS JOIN field_representatives fr
WHERE random() < 0.4
LIMIT 20;

-- =====================================================
-- SAMPLE SHIPMENTS
-- =====================================================
INSERT INTO shipments (shipment_code, farm_id, vehicle_id, warehouse_id, quantity_kg, dispatch_time, status)
SELECT 
    'SHP-' || LPAD((ROW_NUMBER() OVER ())::text, 5, '0'),
    f.id,
    v.id,
    w.id,
    (random() * 8000 + 2000)::numeric(10,2),
    CURRENT_DATE - (random() * 30)::integer + (random() * 24)::integer * INTERVAL '1 hour',
    CASE 
        WHEN random() < 0.5 THEN 'delivered'
        WHEN random() < 0.8 THEN 'in_transit'
        ELSE 'pending'
    END
FROM farms f
CROSS JOIN vehicles v
CROSS JOIN warehouses w
WHERE random() < 0.3
LIMIT 15;

-- =====================================================
-- SAMPLE PRODUCTION BATCHES
-- =====================================================
INSERT INTO production_batches (batch_code, refinery_id, warehouse_id, input_fruit_kg, output_oil_liters, start_time, status)
SELECT 
    'BATCH-' || LPAD((ROW_NUMBER() OVER ())::text, 5, '0'),
    r.id,
    w.id,
    (random() * 20000 + 10000)::numeric(10,2),
    (random() * 4000 + 2000)::numeric(10,2),
    CURRENT_DATE - (random() * 30)::integer + (random() * 24)::integer * INTERVAL '1 hour',
    CASE 
        WHEN random() < 0.6 THEN 'completed'
        WHEN random() < 0.8 THEN 'processing'
        ELSE 'scheduled'
    END
FROM refineries r
CROSS JOIN warehouses w
WHERE random() < 0.5
LIMIT 10;

-- Success message
SELECT 'Sample data inserted successfully!' as message;
