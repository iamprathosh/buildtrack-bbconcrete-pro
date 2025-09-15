-- Create function to get low stock products
-- This allows comparing current_stock with min_stock_level in a single query

CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE (
  id uuid,
  name text,
  sku text,
  current_stock integer,
  min_stock_level integer,
  unit_of_measure text,
  location text,
  category_id uuid
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.current_stock,
    p.min_stock_level,
    p.unit_of_measure,
    p.location,
    p.category_id
  FROM products p
  WHERE p.is_active = true 
    AND p.current_stock < p.min_stock_level
  ORDER BY p.name;
$$;
