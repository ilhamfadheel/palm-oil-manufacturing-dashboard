-- Palm Oil Manufacturing Dashboard - Initial Database Schema
-- This migration creates the core tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FARM MANAGEMENT CONTEXT
-- =====================================================

-- Farms table
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location JSONB NOT NULL,
    total_area_hectares DECIMAL(10,2),
    active_trees INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Harvests table
CREATE TABLE harvests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    harvest_date DATE NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    quality_grade VARCHAR(10),
    cv_confidence_score DECIMAL(5,4),
    cv_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Harvest forecasts
CREATE TABLE harvest_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    forecast_month DATE NOT NULL,
    predicted_quantity_kg DECIMAL(10,2),
    confidence_interval_lower DECIMAL(10,2),
    confidence_interval_upper DECIMAL(10,2),
    model_version VARCHAR(50),
    generated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- LOGISTICS CONTEXT
-- =====================================================

-- Warehouses table (needed for shipments FK)
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location JSONB NOT NULL,
    capacity_kg DECIMAL(12,2),
    current_stock_kg DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_code VARCHAR(50) UNIQUE NOT NULL,
    capacity_kg DECIMAL(10,2),
    fuel_efficiency_km_per_liter DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Shipments table
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_code VARCHAR(50) UNIQUE NOT NULL,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    dispatch_time TIMESTAMP,
    arrival_time TIMESTAMP,
    estimated_fuel_liters DECIMAL(8,2),
    actual_fuel_liters DECIMAL(8,2),
    route_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INVENTORY & WAREHOUSE CONTEXT
-- =====================================================

-- Inventory transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    reference_id UUID,
    transaction_time TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- =====================================================
-- REFINERY CONTEXT
-- =====================================================

-- Refineries table
CREATE TABLE refineries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location JSONB NOT NULL,
    processing_capacity_kg_per_day DECIMAL(10,2),
    oil_extraction_rate DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Production batches
CREATE TABLE production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    refinery_id UUID REFERENCES refineries(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    input_fruit_kg DECIMAL(10,2) NOT NULL,
    output_oil_liters DECIMAL(10,2),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled',
    quality_metrics JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SALES & WORK ORDER CONTEXT
-- =====================================================

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_info JSONB,
    client_type VARCHAR(50),
    average_monthly_order_liters DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Field representatives
CREATE TABLE field_representatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    territory JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Work orders
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    field_rep_id UUID REFERENCES field_representatives(id) ON DELETE SET NULL,
    requested_quantity_liters DECIMAL(10,2) NOT NULL,
    requested_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    fulfilled_quantity_liters DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & AI CONTEXT
-- =====================================================

-- Demand forecasts
CREATE TABLE demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_month DATE NOT NULL,
    predicted_demand_liters DECIMAL(10,2),
    confidence_interval_lower DECIMAL(10,2),
    confidence_interval_upper DECIMAL(10,2),
    client_breakdown JSONB,
    model_version VARCHAR(50),
    generated_at TIMESTAMP DEFAULT NOW()
);

-- Excess analysis
CREATE TABLE excess_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_date DATE NOT NULL,
    context_type VARCHAR(50) NOT NULL,
    context_id UUID NOT NULL,
    excess_type VARCHAR(50),
    excess_amount DECIMAL(10,2),
    excess_unit VARCHAR(20),
    estimated_cost_impact_usd DECIMAL(10,2),
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_harvests_farm_date ON harvests(farm_id, harvest_date);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_client ON work_orders(client_id);
CREATE INDEX idx_production_batches_refinery ON production_batches(refinery_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Basic Setup
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refineries ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users - adjust as needed)
CREATE POLICY "Allow all for authenticated users" ON farms FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON harvests FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON warehouses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON vehicles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON shipments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON refineries FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON production_batches FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON work_orders FOR ALL TO authenticated USING (true);
