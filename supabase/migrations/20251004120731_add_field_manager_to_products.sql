-- Add field_manager column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS field_manager TEXT;

-- Add comment to document the column
COMMENT ON COLUMN products.field_manager IS 'Name of the field manager responsible for this product';
