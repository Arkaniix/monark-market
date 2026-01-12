-- Create storage bucket for model images
INSERT INTO storage.buckets (id, name, public)
VALUES ('model-images', 'model-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view model images
CREATE POLICY "Anyone can view model images"
ON storage.objects FOR SELECT
USING (bucket_id = 'model-images');

-- Allow admins to upload model images
CREATE POLICY "Admins can upload model images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'model-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update model images
CREATE POLICY "Admins can update model images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'model-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete model images
CREATE POLICY "Admins can delete model images"
ON storage.objects FOR DELETE
USING (bucket_id = 'model-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Add image_url column to hardware_models
ALTER TABLE public.hardware_models 
ADD COLUMN IF NOT EXISTS image_url text;