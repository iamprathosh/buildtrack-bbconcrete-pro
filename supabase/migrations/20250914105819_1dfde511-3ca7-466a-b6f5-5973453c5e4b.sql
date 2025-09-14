-- Temporarily allow public read access to fix immediate data visibility issue
-- This is a temporary measure until Clerk integration is properly configured

-- Update products table to allow public read access temporarily
DROP POLICY IF EXISTS "authenticated_can_read_products" ON public.products;
CREATE POLICY "temp_public_read_products" 
ON public.products 
FOR SELECT 
TO authenticated, anon
USING (true);

-- Update product_categories table 
DROP POLICY IF EXISTS "authenticated_can_read_product_categories" ON public.product_categories;
CREATE POLICY "temp_public_read_product_categories" 
ON public.product_categories 
FOR SELECT 
TO authenticated, anon
USING (true);

-- Update inventory_locations table
DROP POLICY IF EXISTS "authenticated_can_read_locations" ON public.inventory_locations;
CREATE POLICY "temp_public_read_locations" 
ON public.inventory_locations 
FOR SELECT 
TO authenticated, anon
USING (true);

-- Keep the create policy restricted to authenticated users
DROP POLICY IF EXISTS "authenticated_can_create_products" ON public.products;
CREATE POLICY "authenticated_can_create_products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (true);