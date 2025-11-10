-- Create a table to store system settings including maintenance mode
CREATE TABLE IF NOT EXISTS public.system_settings (
  id bigint PRIMARY KEY DEFAULT 1,
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read system settings (needed to check maintenance mode)
CREATE POLICY "Anyone can view system settings"
ON public.system_settings
FOR SELECT
USING (true);

-- Only admins can update system settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial row
INSERT INTO public.system_settings (id, maintenance_mode, maintenance_message)
VALUES (1, false, 'Le site est actuellement en maintenance. Nous serons de retour bientôt.')
ON CONFLICT (id) DO NOTHING;