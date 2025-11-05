-- ============================================================
-- COMPLÉMENT DES POLITIQUES RLS ET TRIGGERS
-- ============================================================

-- ===== JOBS: Permettre insertion/modification de données =====
CREATE POLICY "Admins can insert jobs"
ON public.jobs FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all jobs"
ON public.jobs FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== JOB_SHARDS: Permettre insertion =====
CREATE POLICY "Users can insert shards for their jobs"
ON public.job_shards FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_shards.job_id
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Admins can manage job shards"
ON public.job_shards FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== INGEST_BATCHES: Permettre insertion =====
CREATE POLICY "Users can insert batches for their jobs"
ON public.ingest_batches FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = ingest_batches.job_id
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Admins can manage ingest batches"
ON public.ingest_batches FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== INGEST_RAW: Permettre insertion =====
CREATE POLICY "Users can insert raw data for their jobs"
ON public.ingest_raw FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = ingest_raw.job_id
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Admins can manage raw data"
ON public.ingest_raw FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== USER_CONTRIBUTIONS: Permettre mise à jour =====
CREATE POLICY "Users can update their own contributions"
ON public.user_contributions FOR UPDATE
USING (auth.uid() = user_id);

-- ===== ADS: Permettre insertion par admins et système =====
CREATE POLICY "System can insert ads"
ON public.ads FOR INSERT
WITH CHECK (true); -- Temporaire pour permettre l'ingestion depuis extensions

-- ===== AD_PRICES: Permettre insertion =====
CREATE POLICY "System can insert ad prices"
ON public.ad_prices FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage ad prices"
ON public.ad_prices FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== AD_STATUS_HISTORY: Permettre insertion =====
CREATE POLICY "System can insert ad status history"
ON public.ad_status_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage ad status history"
ON public.ad_status_history FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== AD_DEAL_SCORES: Permettre insertion/modification =====
CREATE POLICY "System can insert deal scores"
ON public.ad_deal_scores FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage deal scores"
ON public.ad_deal_scores FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== HARDWARE_MODELS: Permettre gestion par admins =====
CREATE POLICY "Admins can manage hardware models"
ON public.hardware_models FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== HARDWARE_MODEL_SPECS: Permettre gestion =====
CREATE POLICY "Admins can manage hardware model specs"
ON public.hardware_model_specs FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== MODEL_DAILY_METRICS: Permettre gestion =====
CREATE POLICY "Admins can manage model daily metrics"
ON public.model_daily_metrics FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== EXTERNAL_SOURCES: Permettre gestion par admins =====
CREATE POLICY "Admins can manage external sources"
ON public.external_sources FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== EXTERNAL_FETCH_RUNS: Permettre insertion =====
CREATE POLICY "System can insert fetch runs"
ON public.external_fetch_runs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage fetch runs"
ON public.external_fetch_runs FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== EXTERNAL_SERIES: Permettre insertion =====
CREATE POLICY "System can insert external series"
ON public.external_series FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage external series"
ON public.external_series FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== EXTERNAL_MODEL_SPECS: Permettre insertion =====
CREATE POLICY "System can insert external model specs"
ON public.external_model_specs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage external model specs"
ON public.external_model_specs FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== HARDWARE_CATEGORIES: Permettre gestion par admins =====
CREATE POLICY "Admins can manage hardware categories"
ON public.hardware_categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== USER_ACTION_LOGS: Permettre insertion par système =====
CREATE POLICY "System can insert action logs"
ON public.user_action_logs FOR INSERT
WITH CHECK (true);

-- ===== SYSTEM_LOGS: Permettre insertion et gestion par admins =====
CREATE POLICY "System can insert system logs"
ON public.system_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage system logs"
ON public.system_logs FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== CREDIT_LOGS: Permettre insertion par système =====
CREATE POLICY "System can insert credit logs"
ON public.credit_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage credit logs"
ON public.credit_logs FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- TRIGGERS D'AUTOMATISATION
-- ============================================================

-- Trigger: Mettre à jour last_seen_at automatiquement sur ads
CREATE OR REPLACE FUNCTION update_ad_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ad_last_seen
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION update_ad_last_seen();

-- Trigger: Mettre à jour updated_at sur hardware_models
CREATE OR REPLACE FUNCTION update_hardware_model_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hardware_model_timestamp
BEFORE UPDATE ON public.hardware_models
FOR EACH ROW
EXECUTE FUNCTION update_hardware_model_timestamp();

-- Trigger: Mettre à jour updated_at sur hardware_model_specs
CREATE TRIGGER trigger_update_hardware_model_specs_timestamp
BEFORE UPDATE ON public.hardware_model_specs
FOR EACH ROW
EXECUTE FUNCTION update_hardware_model_timestamp();

-- Trigger: Mettre à jour updated_at sur model_daily_metrics
CREATE TRIGGER trigger_update_model_daily_metrics_timestamp
BEFORE UPDATE ON public.model_daily_metrics
FOR EACH ROW
EXECUTE FUNCTION update_hardware_model_timestamp();

-- Trigger: Logger les changements de statut dans ad_status_history
CREATE OR REPLACE FUNCTION log_ad_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ad_status_history (ad_id, from_status, to_status, changed_at, reason)
    VALUES (NEW.id, OLD.status, NEW.status, now(), 'auto_detected');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_ad_status_change
AFTER UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION log_ad_status_change();

-- Trigger: Détecter les baisses de prix dans ad_prices
CREATE OR REPLACE FUNCTION detect_price_drop()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_detect_price_drop
BEFORE INSERT ON public.ad_prices
FOR EACH ROW
EXECUTE FUNCTION detect_price_drop();

-- Trigger: Mettre à jour credits_remaining dans user_subscriptions lors de dépense
CREATE OR REPLACE FUNCTION update_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les crédits restants de l'utilisateur
  UPDATE public.user_subscriptions
  SET credits_remaining = credits_remaining + NEW.delta,
      updated_at = now()
  WHERE user_id = NEW.user_id
  AND status = 'active';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_credits
AFTER INSERT ON public.credit_logs
FOR EACH ROW
EXECUTE FUNCTION update_user_credits();

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Fonction: Obtenir les crédits restants d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(credits_remaining, 0)
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
  AND status = 'active'
  LIMIT 1;
$$;

-- Fonction: Vérifier si un utilisateur a assez de crédits
CREATE OR REPLACE FUNCTION has_enough_credits(p_user_id uuid, p_required_credits integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(credits_remaining, 0) >= p_required_credits
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
  AND status = 'active'
  LIMIT 1;
$$;

-- Fonction: Obtenir le rôle d'un utilisateur depuis user_roles
CREATE OR REPLACE FUNCTION get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
$$;

-- Fonction: Obtenir le plan d'abonnement actif d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sp.name
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
  AND us.status = 'active'
  LIMIT 1;
$$;