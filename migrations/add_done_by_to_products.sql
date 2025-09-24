-- Add done_by fields to products table for tracking who creates and updates products
-- This migration adds user tracking fields to maintain audit trails

ALTER TABLE products 
ADD COLUMN created_by VARCHAR(255),
ADD COLUMN created_by_id VARCHAR(255), 
ADD COLUMN created_by_email VARCHAR(255),
ADD COLUMN updated_by VARCHAR(255),
ADD COLUMN updated_by_id VARCHAR(255),
ADD COLUMN updated_by_email VARCHAR(255);

-- Add indexes for better query performance on user fields
CREATE INDEX IF NOT EXISTS idx_products_created_by_id ON products(created_by_id);
CREATE INDEX IF NOT EXISTS idx_products_updated_by_id ON products(updated_by_id);

-- Add comments to document the fields
COMMENT ON COLUMN products.created_by IS 'Full name of the user who created this product';
COMMENT ON COLUMN products.created_by_id IS 'Clerk user ID of the user who created this product';
COMMENT ON COLUMN products.created_by_email IS 'Email address of the user who created this product';
COMMENT ON COLUMN products.updated_by IS 'Full name of the user who last updated this product';
COMMENT ON COLUMN products.updated_by_id IS 'Clerk user ID of the user who last updated this product';
COMMENT ON COLUMN products.updated_by_email IS 'Email address of the user who last updated this product';

-- Create a trigger function to automatically update the updated_by fields
CREATE OR REPLACE FUNCTION update_products_updated_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: In a real application, you would get the current user from the application context
  -- For now, these fields will be updated by the application layer
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
CREATE TRIGGER trigger_update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_by();