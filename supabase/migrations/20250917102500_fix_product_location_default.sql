-- Fix product location_id default value to use Main Warehouse
-- Set default value for location_id column to be the Main Warehouse ID

-- First get the Main Warehouse ID (should be d8e037d4-d4de-488f-80d9-787cc5e95b82)
-- Set default value for location_id column to be the Main Warehouse ID
ALTER TABLE products ALTER COLUMN location_id SET DEFAULT 'd8e037d4-d4de-488f-80d9-787cc5e95b82';

-- Update any existing products that don't have a location_id
UPDATE products 
SET location_id = 'd8e037d4-d4de-488f-80d9-787cc5e95b82' 
WHERE location_id IS NULL;