-- Restore proper RLS policies for Clerk authentication
-- Remove temporary public policies and add secure Clerk-based policies

-- Products table - restore authenticated access
DROP POLICY IF EXISTS "temp_public_read_products" ON public.products;
CREATE POLICY "clerk_authenticated_read_products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (auth.jwt() IS NOT NULL);

-- Product categories table
DROP POLICY IF EXISTS "temp_public_read_product_categories" ON public.product_categories;
CREATE POLICY "clerk_authenticated_read_categories" 
ON public.product_categories 
FOR SELECT 
TO authenticated
USING (auth.jwt() IS NOT NULL);

-- Inventory locations table  
DROP POLICY IF EXISTS "temp_public_read_locations" ON public.inventory_locations;
CREATE POLICY "clerk_authenticated_read_locations" 
ON public.inventory_locations 
FOR SELECT 
TO authenticated
USING (auth.jwt() IS NOT NULL);

-- Update create products policy
DROP POLICY IF EXISTS "authenticated_can_create_products" ON public.products;
CREATE POLICY "clerk_authenticated_create_products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() IS NOT NULL);