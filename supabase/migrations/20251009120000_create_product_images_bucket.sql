/*
  # Create Product Images Storage Bucket

  This migration creates the storage bucket for product images
  used in the video creation flow.

  Changes:
  1. Create product-images storage bucket (public)
  2. Add storage policies for bucket access
*/

-- Step 1: Create storage bucket for product images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create storage policies for product-images bucket

-- Allow public read access to product images
CREATE POLICY "Public read access for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow service role to upload product images
CREATE POLICY "Service role can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- Allow service role to update product images
CREATE POLICY "Service role can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

-- Allow service role to delete product images
CREATE POLICY "Service role can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

