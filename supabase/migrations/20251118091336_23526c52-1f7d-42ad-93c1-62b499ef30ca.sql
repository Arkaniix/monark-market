-- Set search_path on all functions that don't have it set
-- This prevents potential SQL injection via search_path manipulation

-- Update get_user_plan function
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT sp.name
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
  AND us.status = 'active'
  LIMIT 1;
$function$;

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Update get_user_credits function
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(credits_remaining, 0)
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
  AND status = 'active'
  LIMIT 1;
$function$;

-- Update has_enough_credits function
CREATE OR REPLACE FUNCTION public.has_enough_credits(p_user_id uuid, p_required_credits integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(credits_remaining, 0) >= p_required_credits
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
  AND status = 'active'
  LIMIT 1;
$function$;

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
$function$;

-- Update get_plan_limits function
CREATE OR REPLACE FUNCTION public.get_plan_limits(p_user_id uuid)
 RETURNS TABLE(plan_name text, max_jobs_per_day integer, max_comm_jobs_per_day integer, max_pages_per_job integer, can_use_strong_scrape boolean, credits_per_cycle integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    sp.name::text,
    CASE 
      WHEN sp.name = 'Basic' THEN 3
      WHEN sp.name = 'Pro' THEN 10
      WHEN sp.name = 'Elite' THEN 30
      ELSE 1
    END as max_jobs_per_day,
    CASE 
      WHEN sp.name = 'Basic' THEN 1
      WHEN sp.name = 'Pro' THEN 5
      WHEN sp.name = 'Elite' THEN 15
      ELSE 0
    END as max_comm_jobs_per_day,
    CASE 
      WHEN sp.name = 'Basic' THEN 50
      WHEN sp.name = 'Pro' THEN 200
      WHEN sp.name = 'Elite' THEN 500
      ELSE 10
    END as max_pages_per_job,
    CASE 
      WHEN sp.name IN ('Pro', 'Elite') THEN true
      ELSE false
    END as can_use_strong_scrape,
    CASE 
      WHEN sp.name = 'Basic' THEN 50
      WHEN sp.name = 'Pro' THEN 150
      WHEN sp.name = 'Elite' THEN 400
      ELSE 30
    END as credits_per_cycle
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
  LIMIT 1;
$function$;

-- Update calculate_job_cost function
CREATE OR REPLACE FUNCTION public.calculate_job_cost(p_job_type text, p_pages_scanned integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN p_job_type = 'communautaire' THEN 0
    WHEN p_job_type = 'faible' THEN GREATEST(5, p_pages_scanned / 10)
    WHEN p_job_type = 'fort' THEN GREATEST(10, p_pages_scanned / 5)
    ELSE 5
  END;
$function$;