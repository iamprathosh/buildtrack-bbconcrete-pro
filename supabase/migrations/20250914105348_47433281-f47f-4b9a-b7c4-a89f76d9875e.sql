-- Fix RLS policies to allow authenticated users to read products and related data
-- The current policies may be too restrictive for a worker role

-- Update products table policy to allow all authenticated users to read
DROP POLICY IF EXISTS "authenticated_can_read_products" ON public.products;
CREATE POLICY "authenticated_can_read_products" 
ON public.products 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Update product_categories table policy
DROP POLICY IF EXISTS "public_can_read_product_categories" ON public.product_categories;
CREATE POLICY "authenticated_can_read_product_categories" 
ON public.product_categories 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Update inventory_locations table policy
DROP POLICY IF EXISTS "authenticated_can_read_locations" ON public.inventory_locations;
CREATE POLICY "authenticated_can_read_locations" 
ON public.inventory_locations 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Also allow workers to create products if they need to
CREATE POLICY "authenticated_can_create_products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');