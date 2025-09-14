-- Temporarily update the current user to have admin role for testing
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE id = 'user_32gZZ374vBeLcgTBCtk7go0UsGP';

-- Also let's add some sample customers and users if they don't exist
DO $$
BEGIN
  -- Check if we have customers, if not add some
  IF NOT EXISTS (SELECT 1 FROM customers LIMIT 1) THEN
    INSERT INTO customers (id, name, contact, customer_number) VALUES
    (gen_random_uuid(), 'Metro Development Corp', 'John Smith', 1001),
    (gen_random_uuid(), 'State Transportation Dept', 'Sarah Johnson', 1002),
    (gen_random_uuid(), 'City of Riverside', 'Mike Wilson', 1003);
  END IF;

  -- Check if we have project managers, if not add some
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role IN ('super_admin', 'project_manager') AND id != 'user_32gZZ374vBeLcgTBCtk7go0UsGP' LIMIT 1) THEN
    INSERT INTO user_profiles (id, email, full_name, role) VALUES
    ('pm_001', 'john.smith@bbconcrete.com', 'John Smith', 'project_manager'),
    ('pm_002', 'sarah.johnson@bbconcrete.com', 'Sarah Johnson', 'project_manager'),
    ('admin_001', 'mike.wilson@bbconcrete.com', 'Mike Wilson', 'super_admin');
  END IF;
END $$;