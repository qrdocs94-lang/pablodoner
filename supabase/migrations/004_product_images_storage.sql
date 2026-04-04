-- Create product-images storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "public_read_product_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow anon upload / update / delete (admin-only by password in app layer)
CREATE POLICY "anon_upload_product_images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "anon_update_product_images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "anon_delete_product_images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');
