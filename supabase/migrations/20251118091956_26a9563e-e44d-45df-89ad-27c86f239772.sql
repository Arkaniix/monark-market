-- Fix scrape_policies public exposure
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view scrape policies" ON public.scrape_policies;

-- Restrict scrape policies to admins only (recommended)
-- This protects business intelligence and anti-detection strategies
CREATE POLICY "Admins can view scrape policies"
ON public.scrape_policies
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can also manage scrape policies
CREATE POLICY "Admins can manage scrape policies"
ON public.scrape_policies
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));