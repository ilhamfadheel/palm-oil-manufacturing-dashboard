-- Migration: Disable Row Level Security and Enable Public Access
-- This migration removes all authentication requirements and makes all tables publicly accessible

-- =====================================================
-- DISABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE harvests DISABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_forecasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE refineries DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE field_representatives DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE excess_analysis DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP ALL EXISTING RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Enable read access for all users" ON farms;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON farms;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON farms;

DROP POLICY IF EXISTS "Enable read access for all users" ON harvests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON harvests;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON harvests;

DROP POLICY IF EXISTS "Enable read access for all users" ON harvest_forecasts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON harvest_forecasts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON harvest_forecasts;

DROP POLICY IF EXISTS "Enable read access for all users" ON warehouses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON warehouses;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON warehouses;

DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vehicles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON vehicles;

DROP POLICY IF EXISTS "Enable read access for all users" ON shipments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON shipments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON shipments;

DROP POLICY IF EXISTS "Enable read access for all users" ON refineries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON refineries;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON refineries;

DROP POLICY IF EXISTS "Enable read access for all users" ON production_batches;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON production_batches;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON production_batches;

DROP POLICY IF EXISTS "Enable read access for all users" ON clients;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON clients;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON clients;

DROP POLICY IF EXISTS "Enable read access for all users" ON field_representatives;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON field_representatives;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON field_representatives;

DROP POLICY IF EXISTS "Enable read access for all users" ON work_orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON work_orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON work_orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON demand_forecasts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON demand_forecasts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON demand_forecasts;

DROP POLICY IF EXISTS "Enable read access for all users" ON excess_analysis;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON excess_analysis;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON excess_analysis;

-- =====================================================
-- GRANT PUBLIC ACCESS TO ALL TABLES
-- =====================================================

-- Grant all privileges to anon role (public access)
GRANT ALL ON farms TO anon;
GRANT ALL ON harvests TO anon;
GRANT ALL ON harvest_forecasts TO anon;
GRANT ALL ON warehouses TO anon;
GRANT ALL ON vehicles TO anon;
GRANT ALL ON shipments TO anon;
GRANT ALL ON refineries TO anon;
GRANT ALL ON production_batches TO anon;
GRANT ALL ON clients TO anon;
GRANT ALL ON field_representatives TO anon;
GRANT ALL ON work_orders TO anon;
GRANT ALL ON demand_forecasts TO anon;
GRANT ALL ON excess_analysis TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =====================================================
-- CONFIRMATION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Row Level Security has been disabled on all tables';
  RAISE NOTICE 'All tables are now publicly accessible without authentication';
  RAISE NOTICE 'Anonymous users have full read/write access to all data';
END $$;
