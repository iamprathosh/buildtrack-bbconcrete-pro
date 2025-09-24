-- Seed basic product categories
-- This migration will insert default categories if they don't already exist

-- First, ensure the product_categories table has the right structure
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Insert categories only if they don't already exist
INSERT INTO product_categories (name, description, is_active, created_at, updated_at)
SELECT * FROM (VALUES
  ('Cement', 'Cement products including Portland cement, masonry cement, etc.', true, NOW(), NOW()),
  ('Steel', 'Steel materials including rebar, structural steel, mesh, etc.', true, NOW(), NOW()),
  ('Concrete', 'Ready-mix concrete, concrete blocks, precast elements, etc.', true, NOW(), NOW()),
  ('Aggregate', 'Sand, gravel, crushed stone, and other aggregate materials', true, NOW(), NOW()),
  ('Lumber', 'Wood materials including dimensional lumber, plywood, OSB, etc.', true, NOW(), NOW()),
  ('Insulation', 'Thermal and acoustic insulation materials', true, NOW(), NOW()),
  ('Roofing', 'Roofing materials including shingles, membranes, flashing, etc.', true, NOW(), NOW()),
  ('Electrical', 'Electrical supplies, conduits, wiring, panels, etc.', true, NOW(), NOW()),
  ('Plumbing', 'Plumbing fixtures, pipes, fittings, valves, etc.', true, NOW(), NOW()),
  ('Tools', 'Construction tools, equipment, and accessories', true, NOW(), NOW()),
  ('Safety Equipment', 'Safety gear, protective equipment, and safety supplies', true, NOW(), NOW()),
  ('Other', 'Miscellaneous construction materials and supplies', true, NOW(), NOW())
) AS new_categories(name, description, is_active, created_at, updated_at)
WHERE NOT EXISTS (
  SELECT 1 FROM product_categories WHERE product_categories.name = new_categories.name
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_name ON product_categories(name);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);

-- Verify the data was inserted
SELECT 'Categories seeded successfully! Found ' || COUNT(*) || ' categories.' AS result 
FROM product_categories WHERE is_active = true;