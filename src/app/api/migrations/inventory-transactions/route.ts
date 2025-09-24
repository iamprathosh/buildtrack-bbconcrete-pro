import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase-server'

const MIGRATION_SQL = `
-- Create comprehensive inventory_transactions table
-- This table will track all inventory movements with detailed transaction information

CREATE TABLE IF NOT EXISTS inventory_transactions (
  -- Primary identifiers
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Transaction details
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'DAMAGED', 'EXPIRED')),
  transaction_number VARCHAR(50), -- Human-readable transaction number (e.g., TXN-2024-001)
  reference_number VARCHAR(100), -- External reference (PO number, invoice, etc.)
  
  -- Product and quantity information
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity DECIMAL(12,3) NOT NULL, -- Support for fractional quantities
  unit_cost DECIMAL(12,2), -- Cost per unit at time of transaction
  total_value DECIMAL(15,2), -- Total value of the transaction (quantity * unit_cost)
  
  -- Location information
  from_location_id UUID REFERENCES inventory_locations(id),
  from_location_name VARCHAR(255), -- Fallback if location not in system
  to_location_id UUID REFERENCES inventory_locations(id),
  to_location_name VARCHAR(255), -- Fallback if location not in system
  
  -- Project and user tracking
  project_id UUID REFERENCES projects(id),
  project_name VARCHAR(255), -- Snapshot of project name at time of transaction
  
  -- User information (who performed the transaction)
  transaction_done_by VARCHAR(255) NOT NULL, -- User name who performed transaction
  transaction_done_by_id VARCHAR(255), -- User ID from Clerk
  transaction_done_by_email VARCHAR(255), -- User email
  
  -- Approval and workflow
  approved_by VARCHAR(255), -- Who approved the transaction (for large quantities)
  approved_by_id VARCHAR(255),
  approved_at TIMESTAMPTZ,
  approval_required BOOLEAN DEFAULT false,
  
  -- Stock level tracking (snapshot at time of transaction)
  stock_before DECIMAL(12,3), -- Stock level before this transaction
  stock_after DECIMAL(12,3), -- Stock level after this transaction
  
  -- Batch and serial tracking
  batch_number VARCHAR(100), -- For lot/batch tracking
  serial_numbers TEXT[], -- Array of serial numbers (for serialized items)
  expiry_date DATE, -- For items with expiration dates
  
  -- Additional details
  notes TEXT, -- Transaction notes
  reason VARCHAR(100), -- Reason for transaction (especially for adjustments)
  attachments JSONB, -- File attachments (receipts, photos, etc.)
  
  -- Metadata
  transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'reversed')),
  reversed_by_transaction_id UUID REFERENCES inventory_transactions(id), -- If this transaction was reversed
  
  -- Integration fields
  external_system_id VARCHAR(255), -- ID from external system if integrated
  external_system_name VARCHAR(100), -- Name of external system
  
  -- Audit fields
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_transaction_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_transaction_date ON inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_project_id ON inventory_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_done_by ON inventory_transactions(transaction_done_by_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_status ON inventory_transactions(status);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions(reference_number);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_date ON inventory_transactions(product_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_project_date ON inventory_transactions(project_id, transaction_date DESC);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_transactions_updated_at
  BEFORE UPDATE ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_transactions_updated_at();

-- Create function to generate transaction numbers
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  year_month VARCHAR(7);
  next_seq INTEGER;
BEGIN
  year_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Get the next sequence number for this month
  SELECT COALESCE(MAX(
    CASE 
      WHEN transaction_number ~ ('^TXN-' || year_month || '-[0-9]+$')
      THEN CAST(SUBSTRING(transaction_number FROM '[0-9]+$') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO next_seq
  FROM inventory_transactions
  WHERE transaction_number LIKE 'TXN-' || year_month || '-%';
  
  RETURN 'TXN-' || year_month || '-' || LPAD(next_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate transaction numbers
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
    NEW.transaction_number := generate_transaction_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_transaction_number
  BEFORE INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_number();

-- Create view for transaction summary with product details
CREATE OR REPLACE VIEW inventory_transactions_with_details AS
SELECT 
  t.*,
  p.sku,
  p.name as product_name,
  p.unit_of_measure,
  p.current_stock as current_product_stock,
  pc.name as category_name,
  pr.name as project_name_current,
  il_from.name as from_location_name_current,
  il_to.name as to_location_name_current
FROM inventory_transactions t
LEFT JOIN products p ON t.product_id = p.id
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN projects pr ON t.project_id = pr.id
LEFT JOIN inventory_locations il_from ON t.from_location_id = il_from.id
LEFT JOIN inventory_locations il_to ON t.to_location_id = il_to.id;

-- Add comment to table
COMMENT ON TABLE inventory_transactions IS 'Comprehensive inventory transaction tracking with automatic stock updates';
COMMENT ON COLUMN inventory_transactions.transaction_type IS 'Type of transaction: IN (receiving), OUT (dispatch), RETURN (return to stock), ADJUSTMENT (stock correction), TRANSFER (location change), DAMAGED (write-off), EXPIRED (expired goods)';
COMMENT ON COLUMN inventory_transactions.stock_before IS 'Stock level snapshot before this transaction';
COMMENT ON COLUMN inventory_transactions.stock_after IS 'Stock level snapshot after this transaction';
`

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admin users to run migrations
    // You might want to check user role here
    
    const supabase = createServerClient()

    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec', { sql: MIGRATION_SQL })

    if (error) {
      console.error('Migration failed:', error)
      return NextResponse.json(
        { 
          error: 'Migration failed',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory transactions table created successfully',
      migration: 'inventory_transactions_v1'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Alternative method: Direct SQL execution
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Check if the table already exists
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'inventory_transactions')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking table existence:', error)
    }

    const tableExists = !!data

    return NextResponse.json({
      table_exists: tableExists,
      migration_status: tableExists ? 'completed' : 'pending',
      message: tableExists 
        ? 'Inventory transactions table already exists'
        : 'Inventory transactions table needs to be created'
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}