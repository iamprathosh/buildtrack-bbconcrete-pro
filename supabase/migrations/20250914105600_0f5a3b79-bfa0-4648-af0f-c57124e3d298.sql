-- Fix RLS policies to properly check for authenticated users
-- The auth.role() function doesn't work as expected, we should use auth.uid() IS NOT NULL

-- Update products table policy to properly check for authenticated users
DROP POLICY IF EXISTS "authenticated_can_read_products" ON public.products;
CREATE POLICY "authenticated_can_read_products" 
ON public.products 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update product_categories table policy
DROP POLICY IF EXISTS "authenticated_can_read_product_categories" ON public.product_categories;
CREATE POLICY "authenticated_can_read_product_categories" 
ON public.product_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update inventory_locations table policy
DROP POLICY IF EXISTS "authenticated_can_read_locations" ON public.inventory_locations;
CREATE POLICY "authenticated_can_read_locations" 
ON public.inventory_locations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update the create products policy as well
DROP POLICY IF EXISTS "authenticated_can_create_products" ON public.products;
CREATE POLICY "authenticated_can_create_products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);