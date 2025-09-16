-- Add product-images storage bucket for product image uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true);

-- Create storage policies for product-images bucket
CREATE POLICY "public_can_view_product_images" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "authenticated_can_upload_product_images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "admin_manager_can_manage_product_images" ON storage.objects 
FOR ALL USING (
  bucket_id = 'product-images' AND 
  is_admin_or_manager()
) WITH CHECK (
  bucket_id = 'product-images' AND 
  is_admin_or_manager()
);