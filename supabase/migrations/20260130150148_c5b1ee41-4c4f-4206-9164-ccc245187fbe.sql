-- Fix 1: Remove user_email and user_name from support_tickets (redundant PII)
-- Users can see their own tickets without needing stored email/name
-- Admins can join with auth.users or profiles table when needed

ALTER TABLE public.support_tickets 
DROP COLUMN IF EXISTS user_email,
DROP COLUMN IF EXISTS user_name;

-- Fix 2: Restrict user_action_logs to admin-only access
-- Users should not see their own IP addresses and tracking metadata

DROP POLICY IF EXISTS "Users can view their own action logs" ON public.user_action_logs;

-- Fix 3: Restrict profiles table to only allow users to view their own profile
-- Other profiles should not be searchable to prevent enumeration

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins to view all profiles for support/management purposes
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));