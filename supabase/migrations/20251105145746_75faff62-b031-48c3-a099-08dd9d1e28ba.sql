-- Fonction pour obtenir les limites d'un plan
CREATE OR REPLACE FUNCTION public.get_plan_limits(p_user_id uuid)
RETURNS TABLE (
  plan_name text,
  max_jobs_per_day integer,
  max_comm_jobs_per_day integer,
  max_pages_per_job integer,
  can_use_strong_scrape boolean,
  credits_per_cycle integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fonction pour vérifier si un utilisateur peut créer un job
CREATE OR REPLACE FUNCTION public.can_create_job(
  p_user_id uuid,
  p_job_type text,
  p_pages_target integer
)
RETURNS TABLE (
  allowed boolean,
  reason text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Trigger pour incrémenter les limites journalières
CREATE OR REPLACE FUNCTION public.increment_daily_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
$$;

DROP TRIGGER IF EXISTS trigger_increment_daily_limits ON public.jobs;
CREATE TRIGGER trigger_increment_daily_limits
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_daily_limits();

-- Fonction pour calculer le coût en crédits d'un job
CREATE OR REPLACE FUNCTION public.calculate_job_cost(
  p_job_type text,
  p_pages_scanned integer
)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN p_job_type = 'communautaire' THEN 0
    WHEN p_job_type = 'faible' THEN GREATEST(5, p_pages_scanned / 10)
    WHEN p_job_type = 'fort' THEN GREATEST(10, p_pages_scanned / 5)
    ELSE 5
  END;
$$;

-- Trigger pour déduire les crédits à la fin d'un job
CREATE OR REPLACE FUNCTION public.deduct_job_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

DROP TRIGGER IF EXISTS trigger_deduct_job_credits ON public.jobs;
CREATE TRIGGER trigger_deduct_job_credits
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_job_credits();