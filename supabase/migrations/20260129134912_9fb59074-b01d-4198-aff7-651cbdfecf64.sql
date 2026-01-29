-- ============================================
-- FIX 1: Remove overly permissive "System can insert" policies
-- Replace WITH CHECK (true) with proper service_role authentication
-- These tables should only be writable by backend/edge functions using service_role key
-- ============================================

-- Drop insecure policies for ads table
DROP POLICY IF EXISTS "System can insert ads" ON public.ads;

-- Drop insecure policies for ad_prices table
DROP POLICY IF EXISTS "System can insert ad prices" ON public.ad_prices;

-- Drop insecure policies for ad_status_history table
DROP POLICY IF EXISTS "System can insert ad status history" ON public.ad_status_history;

-- Drop insecure policies for ad_deal_scores table
DROP POLICY IF EXISTS "System can insert deal scores" ON public.ad_deal_scores;

-- Drop insecure policies for external_fetch_runs table
DROP POLICY IF EXISTS "System can insert fetch runs" ON public.external_fetch_runs;

-- Drop insecure policies for external_series table
DROP POLICY IF EXISTS "System can insert external series" ON public.external_series;

-- Drop insecure policies for external_model_specs table
DROP POLICY IF EXISTS "System can insert external model specs" ON public.external_model_specs;

-- Drop insecure policies for user_action_logs table
DROP POLICY IF EXISTS "System can insert action logs" ON public.user_action_logs;

-- Drop insecure policies for system_logs table
DROP POLICY IF EXISTS "System can insert system logs" ON public.system_logs;

-- Drop insecure policies for credit_logs table
DROP POLICY IF EXISTS "System can insert credit logs" ON public.credit_logs;

-- ============================================
-- FIX 2: Restrict subscription_plans visibility to authenticated users
-- Competitors should not be able to see pricing strategy
-- ============================================

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;

-- Create a new policy that only allows authenticated users to view plans
CREATE POLICY "Authenticated users can view active subscription plans"
ON public.subscription_plans
FOR SELECT
TO authenticated
USING (is_active = true);

-- Note: The "System can insert" policies have been removed.
-- Backend services (edge functions) will use the service_role key which bypasses RLS entirely.
-- This is the correct pattern for system-level data insertion.