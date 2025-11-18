-- Fix remaining functions that need search_path set

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$function$;

-- Update handle_new_user_role function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;

-- Update reset_user_credits function
CREATE OR REPLACE FUNCTION public.reset_user_credits()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_subscriptions us
  SET 
    credits_remaining = CASE 
      WHEN sp.name = 'Basic' THEN 50
      WHEN sp.name = 'Pro' THEN 150
      WHEN sp.name = 'Elite' THEN 400
      ELSE 50
    END,
    credits_reset_date = now() + interval '1 month'
  FROM public.subscription_plans sp
  WHERE us.plan_id = sp.id
    AND us.status = 'active'
    AND us.credits_reset_date <= now();
END;
$function$;

-- Update update_ad_last_seen function
CREATE OR REPLACE FUNCTION public.update_ad_last_seen()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.last_seen_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_hardware_model_timestamp function
CREATE OR REPLACE FUNCTION public.update_hardware_model_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update log_ad_status_change function
CREATE OR REPLACE FUNCTION public.log_ad_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ad_status_history (ad_id, from_status, to_status, changed_at, reason)
    VALUES (NEW.id, OLD.status, NEW.status, now(), 'auto_detected');
  END IF;
  RETURN NEW;
END;
$function$;

-- Update detect_price_drop function
CREATE OR REPLACE FUNCTION public.detect_price_drop()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  last_price numeric;
BEGIN
  -- Récupérer le dernier prix connu pour cette annonce
  SELECT price INTO last_price
  FROM public.ad_prices
  WHERE ad_id = NEW.ad_id
  ORDER BY seen_at DESC
  LIMIT 1 OFFSET 1;
  
  -- Si un prix précédent existe et est supérieur, marquer comme baisse
  IF last_price IS NOT NULL AND NEW.price < last_price THEN
    NEW.price_drop = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update update_user_credits function
CREATE OR REPLACE FUNCTION public.update_user_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Mettre à jour les crédits restants de l'utilisateur
  UPDATE public.user_subscriptions
  SET credits_remaining = credits_remaining + NEW.delta,
      updated_at = now()
  WHERE user_id = NEW.user_id
  AND status = 'active';
  
  RETURN NEW;
END;
$function$;

-- Update can_create_job function
CREATE OR REPLACE FUNCTION public.can_create_job(p_user_id uuid, p_job_type text, p_pages_target integer)
 RETURNS TABLE(allowed boolean, reason text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_limits RECORD;
  v_daily_usage RECORD;
  v_credits integer;
BEGIN
  -- Récupérer les limites du plan
  SELECT * INTO v_limits FROM public.get_plan_limits(p_user_id);
  
  IF v_limits IS NULL THEN
    RETURN QUERY SELECT false, 'Aucun abonnement actif'::text;
    RETURN;
  END IF;
  
  -- Récupérer l'usage journalier
  SELECT 
    COALESCE(jobs_used, 0) as jobs_used,
    COALESCE(comm_jobs_used, 0) as comm_jobs_used
  INTO v_daily_usage
  FROM public.user_daily_limits
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  IF v_daily_usage IS NULL THEN
    v_daily_usage.jobs_used := 0;
    v_daily_usage.comm_jobs_used := 0;
  END IF;
  
  -- Vérifier le nombre de jobs journaliers
  IF v_daily_usage.jobs_used >= v_limits.max_jobs_per_day THEN
    RETURN QUERY SELECT false, 'Limite journalière de jobs atteinte'::text;
    RETURN;
  END IF;
  
  -- Vérifier les jobs communautaires
  IF p_job_type = 'communautaire' THEN
    IF v_daily_usage.comm_jobs_used >= v_limits.max_comm_jobs_per_day THEN
      RETURN QUERY SELECT false, 'Limite de jobs communautaires atteinte'::text;
      RETURN;
    END IF;
  END IF;
  
  -- Vérifier le scraping fort
  IF p_job_type = 'fort' AND NOT v_limits.can_use_strong_scrape THEN
    RETURN QUERY SELECT false, 'Scraping fort non disponible pour votre plan'::text;
    RETURN;
  END IF;
  
  -- Vérifier le nombre de pages
  IF p_pages_target > v_limits.max_pages_per_job THEN
    RETURN QUERY SELECT false, format('Nombre de pages limité à %s pour votre plan', v_limits.max_pages_per_job)::text;
    RETURN;
  END IF;
  
  -- Vérifier les crédits pour les jobs non-communautaires
  IF p_job_type != 'communautaire' THEN
    SELECT public.get_user_credits(p_user_id) INTO v_credits;
    
    IF v_credits < 5 THEN
      RETURN QUERY SELECT false, 'Crédits insuffisants'::text;
      RETURN;
    END IF;
  END IF;
  
  RETURN QUERY SELECT true, 'Job autorisé'::text;
END;
$function$;

-- Update increment_daily_limits function
CREATE OR REPLACE FUNCTION public.increment_daily_limits()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_daily_limits (user_id, date, jobs_used, comm_jobs_used)
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.type = 'communautaire' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    jobs_used = user_daily_limits.jobs_used + 1,
    comm_jobs_used = user_daily_limits.comm_jobs_used + 
      CASE WHEN NEW.type = 'communautaire' THEN 1 ELSE 0 END;
  
  RETURN NEW;
END;
$function$;

-- Update deduct_job_credits function
CREATE OR REPLACE FUNCTION public.deduct_job_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cost integer;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_cost := public.calculate_job_cost(NEW.type, NEW.pages_scanned);
    
    IF v_cost > 0 THEN
      INSERT INTO public.credit_logs (user_id, job_id, delta, reason, meta)
      VALUES (
        NEW.user_id,
        NEW.id,
        -v_cost,
        'scrap_' || NEW.type,
        jsonb_build_object(
          'pages_scanned', NEW.pages_scanned,
          'ads_found', NEW.ads_found
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;