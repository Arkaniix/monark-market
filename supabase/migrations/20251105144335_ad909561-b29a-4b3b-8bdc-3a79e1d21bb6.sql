-- ============================================================
-- ADAPTATION DES TABLES EXISTANTES
-- ============================================================

-- Adapter user_subscriptions pour inclure billing_cycle et checkout_ref
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'weekly')),
ADD COLUMN IF NOT EXISTS checkout_ref text;

-- ============================================================
-- B) CRÉDITS & LIMITES
-- ============================================================

-- Table credit_logs: journal des transactions de crédits
CREATE TABLE public.credit_logs (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id bigint,
  delta int NOT NULL,
  reason text NOT NULL CHECK (reason IN ('scrap_faible', 'scrap_fort', 'communautaire', 'bonus', 'refund', 'reset', 'purchase')),
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_logs_user_id ON public.credit_logs(user_id);
CREATE INDEX idx_credit_logs_created_at ON public.credit_logs(created_at DESC);

ALTER TABLE public.credit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit logs"
ON public.credit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credit logs"
ON public.credit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Table scrape_policies: règles de scraping
CREATE TABLE public.scrape_policies (
  id bigserial PRIMARY KEY,
  site text NOT NULL UNIQUE,
  list_only_pages_max int NOT NULL DEFAULT 50,
  open_new_pages_max int NOT NULL DEFAULT 20,
  min_delay_item_ms int NOT NULL DEFAULT 500,
  max_delay_item_ms int NOT NULL DEFAULT 2000,
  min_delay_page_ms int NOT NULL DEFAULT 1000,
  max_delay_page_ms int NOT NULL DEFAULT 3000,
  min_cooldown_minutes int NOT NULL DEFAULT 30,
  max_comm_jobs_per_day int NOT NULL DEFAULT 10
);

-- Insérer les règles par défaut pour LeBonCoin
INSERT INTO public.scrape_policies (site, list_only_pages_max, open_new_pages_max, min_delay_item_ms, max_delay_item_ms, min_delay_page_ms, max_delay_page_ms, min_cooldown_minutes, max_comm_jobs_per_day)
VALUES ('leboncoin', 50, 20, 500, 2000, 1000, 3000, 30, 10);

ALTER TABLE public.scrape_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scrape policies"
ON public.scrape_policies FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify scrape policies"
ON public.scrape_policies FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Table user_daily_limits: quotas journaliers
CREATE TABLE public.user_daily_limits (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  comm_jobs_used int NOT NULL DEFAULT 0,
  jobs_used int NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE INDEX idx_user_daily_limits_user_date ON public.user_daily_limits(user_id, date);

ALTER TABLE public.user_daily_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily limits"
ON public.user_daily_limits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily limits"
ON public.user_daily_limits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily limits"
ON public.user_daily_limits FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================================
-- C) JOBS & CONTRIBUTION
-- ============================================================

-- Table jobs: sessions de scraping
CREATE TABLE public.jobs (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'leboncoin',
  type text NOT NULL CHECK (type IN ('faible', 'fort', 'communautaire')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error', 'cancelled')),
  keyword text NOT NULL,
  filters_json jsonb,
  shard_strategy text CHECK (shard_strategy IN ('pages', 'region', 'price_band')),
  pages_target int,
  pages_scanned int DEFAULT 0,
  ads_found int DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs"
ON public.jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
ON public.jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
ON public.jobs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all jobs"
ON public.jobs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ajouter la foreign key dans credit_logs maintenant que jobs existe
ALTER TABLE public.credit_logs
ADD CONSTRAINT fk_credit_logs_job_id
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;

-- Table job_shards: division des jobs
CREATE TABLE public.job_shards (
  id bigserial PRIMARY KEY,
  job_id bigint NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  shard_kind text NOT NULL CHECK (shard_kind IN ('pages', 'region', 'price')),
  shard_from int,
  shard_to int,
  region_code text,
  price_min int,
  price_max int
);

CREATE INDEX idx_job_shards_job_id ON public.job_shards(job_id);

ALTER TABLE public.job_shards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shards of their jobs"
ON public.job_shards FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = job_shards.job_id
  AND jobs.user_id = auth.uid()
));

-- Table user_contributions: contributions aux jobs communautaires
CREATE TABLE public.user_contributions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id bigint NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  pages_scanned int DEFAULT 0,
  ads_sent int DEFAULT 0,
  duration_sec int,
  credits_earned int DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_contributions_user_id ON public.user_contributions(user_id);
CREATE INDEX idx_user_contributions_job_id ON public.user_contributions(job_id);

ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contributions"
ON public.user_contributions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contributions"
ON public.user_contributions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Table ingest_batches: paquets de données reçus
CREATE TABLE public.ingest_batches (
  id bigserial PRIMARY KEY,
  job_id bigint NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  batch_seq int NOT NULL,
  items_count int NOT NULL DEFAULT 0,
  received_at timestamptz NOT NULL DEFAULT now(),
  latency_ms int,
  notes text
);

CREATE INDEX idx_ingest_batches_job_id ON public.ingest_batches(job_id);

ALTER TABLE public.ingest_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view batches of their jobs"
ON public.ingest_batches FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = ingest_batches.job_id
  AND jobs.user_id = auth.uid()
));

-- Table ingest_raw: trace brute des données JSON
CREATE TABLE public.ingest_raw (
  id bigserial PRIMARY KEY,
  job_id bigint NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  item_seq int NOT NULL,
  payload_json jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ingest_raw_job_id ON public.ingest_raw(job_id);

ALTER TABLE public.ingest_raw ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view raw data of their jobs"
ON public.ingest_raw FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.jobs
  WHERE jobs.id = ingest_raw.job_id
  AND jobs.user_id = auth.uid()
));

-- ============================================================
-- D) ANNONCES NORMALISÉES
-- ============================================================

-- Table des catégories de hardware d'abord
CREATE TABLE public.hardware_categories (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.hardware_categories (name) VALUES
  ('GPU'),
  ('CPU'),
  ('RAM'),
  ('SSD'),
  ('HDD'),
  ('CARTE MÈRE'),
  ('ALIMENTATION'),
  ('BOÎTIER'),
  ('REFROIDISSEMENT'),
  ('PÉRIPHÉRIQUES');

ALTER TABLE public.hardware_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hardware categories"
ON public.hardware_categories FOR SELECT
USING (true);

-- Table hardware_models
CREATE TABLE public.hardware_models (
  id bigserial PRIMARY KEY,
  category_id bigint NOT NULL REFERENCES public.hardware_categories(id) ON DELETE RESTRICT,
  brand text NOT NULL,
  name text NOT NULL,
  family text,
  aliases text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_hardware_models_category_id ON public.hardware_models(category_id);
CREATE INDEX idx_hardware_models_brand ON public.hardware_models(brand);

ALTER TABLE public.hardware_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hardware models"
ON public.hardware_models FOR SELECT
USING (true);

-- Table ads
CREATE TABLE public.ads (
  id bigserial PRIMARY KEY,
  platform text NOT NULL DEFAULT 'leboncoin',
  platform_ad_id text NOT NULL,
  url text NOT NULL,
  title text NOT NULL,
  description text,
  ad_type text CHECK (ad_type IN ('particulier', 'professionnel')),
  category text,
  subcategory text,
  condition text CHECK (condition IN ('neuf', 'bon', 'à_reparer', 'unknown')),
  city text,
  postal_code text,
  region text,
  location_raw text,
  delivery_possible boolean DEFAULT false,
  secured_payment boolean DEFAULT false,
  promo_tags text[],
  shipping_methods text[],
  list_hash text,
  content_hash text,
  published_at timestamptz,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archivee', 'unknown')),
  model_id bigint REFERENCES public.hardware_models(id) ON DELETE SET NULL,
  model_confidence numeric(4,3),
  UNIQUE (platform, platform_ad_id)
);

CREATE INDEX idx_ads_platform_ad_id ON public.ads(platform, platform_ad_id);
CREATE INDEX idx_ads_model_id ON public.ads(model_id);
CREATE INDEX idx_ads_status ON public.ads(status);
CREATE INDEX idx_ads_first_seen_at ON public.ads(first_seen_at DESC);
CREATE INDEX idx_ads_region ON public.ads(region);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ads"
ON public.ads FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all ads"
ON public.ads FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Table ad_prices: historique des prix
CREATE TABLE public.ad_prices (
  id bigserial PRIMARY KEY,
  ad_id bigint NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  seen_at timestamptz NOT NULL DEFAULT now(),
  price numeric(10,2) NOT NULL,
  price_drop boolean DEFAULT false
);

CREATE INDEX idx_ad_prices_ad_id ON public.ad_prices(ad_id, seen_at DESC);

ALTER TABLE public.ad_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ad prices"
ON public.ad_prices FOR SELECT
USING (true);

-- Table ad_status_history: historique des changements de statut
CREATE TABLE public.ad_status_history (
  id bigserial PRIMARY KEY,
  ad_id bigint NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  reason text
);

CREATE INDEX idx_ad_status_history_ad_id ON public.ad_status_history(ad_id, changed_at DESC);

ALTER TABLE public.ad_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ad status history"
ON public.ad_status_history FOR SELECT
USING (true);

-- ============================================================
-- E) SPÉCIFICATIONS HARDWARE
-- ============================================================

-- Table hardware_model_specs
CREATE TABLE public.hardware_model_specs (
  id bigserial PRIMARY KEY,
  model_id bigint NOT NULL REFERENCES public.hardware_models(id) ON DELETE CASCADE,
  chip text,
  vram_gb numeric,
  tdp_w numeric,
  release_date date,
  memory_type text,
  bus_width_bit int,
  outputs_count int,
  specs_json jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (model_id)
);

CREATE INDEX idx_hardware_model_specs_model_id ON public.hardware_model_specs(model_id);

ALTER TABLE public.hardware_model_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hardware model specs"
ON public.hardware_model_specs FOR SELECT
USING (true);

-- ============================================================
-- F) ANALYSE DE MARCHÉ
-- ============================================================

-- Table model_daily_metrics
CREATE TABLE public.model_daily_metrics (
  id bigserial PRIMARY KEY,
  model_id bigint NOT NULL REFERENCES public.hardware_models(id) ON DELETE CASCADE,
  date date NOT NULL,
  price_median numeric,
  price_p25 numeric,
  price_p75 numeric,
  ads_count int DEFAULT 0,
  new_ads int DEFAULT 0,
  disappeared_ads int DEFAULT 0,
  median_days_to_sell numeric,
  fair_value_30d numeric,
  var_7d_pct numeric,
  var_30d_pct numeric,
  var_90d_pct numeric,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (model_id, date)
);

CREATE INDEX idx_model_daily_metrics_model_date ON public.model_daily_metrics(model_id, date DESC);

ALTER TABLE public.model_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view model daily metrics"
ON public.model_daily_metrics FOR SELECT
USING (true);

-- Table ad_deal_scores
CREATE TABLE public.ad_deal_scores (
  id bigserial PRIMARY KEY,
  ad_id bigint NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  calc_at timestamptz NOT NULL DEFAULT now(),
  fair_value numeric,
  deviation_pct numeric,
  score int CHECK (score >= 0 AND score <= 100),
  rarity_index numeric,
  profit_estimate numeric,
  notes text
);

CREATE INDEX idx_ad_deal_scores_ad_id ON public.ad_deal_scores(ad_id, calc_at DESC);
CREATE INDEX idx_ad_deal_scores_score ON public.ad_deal_scores(score DESC);

ALTER TABLE public.ad_deal_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ad deal scores"
ON public.ad_deal_scores FOR SELECT
USING (true);

-- ============================================================
-- G) SOURCES EXTERNES
-- ============================================================

-- Table external_sources
CREATE TABLE public.external_sources (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  base_url text,
  enabled boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.external_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled external sources"
ON public.external_sources FOR SELECT
USING (enabled = true);

-- Table external_fetch_runs
CREATE TABLE public.external_fetch_runs (
  id bigserial PRIMARY KEY,
  source_id bigint NOT NULL REFERENCES public.external_sources(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  status text CHECK (status IN ('ok', 'error')),
  request_meta jsonb,
  response_meta jsonb,
  payload_hash text
);

CREATE INDEX idx_external_fetch_runs_source_id ON public.external_fetch_runs(source_id, started_at DESC);

ALTER TABLE public.external_fetch_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view external fetch runs"
ON public.external_fetch_runs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Table external_series
CREATE TABLE public.external_series (
  id bigserial PRIMARY KEY,
  source_id bigint NOT NULL REFERENCES public.external_sources(id) ON DELETE CASCADE,
  series_key text NOT NULL,
  ts timestamptz NOT NULL,
  value_numeric numeric,
  value_json jsonb,
  UNIQUE (source_id, series_key, ts)
);

CREATE INDEX idx_external_series_source_key_ts ON public.external_series(source_id, series_key, ts DESC);

ALTER TABLE public.external_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view external series"
ON public.external_series FOR SELECT
USING (true);

-- Table external_model_specs
CREATE TABLE public.external_model_specs (
  id bigserial PRIMARY KEY,
  source_id bigint NOT NULL REFERENCES public.external_sources(id) ON DELETE CASCADE,
  model_id bigint NOT NULL REFERENCES public.hardware_models(id) ON DELETE CASCADE,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  payload_json jsonb
);

CREATE INDEX idx_external_model_specs_model_id ON public.external_model_specs(model_id);

ALTER TABLE public.external_model_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view external model specs"
ON public.external_model_specs FOR SELECT
USING (true);

-- ============================================================
-- H) JOURNALISATION
-- ============================================================

-- Table user_action_logs
CREATE TABLE public.user_action_logs (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text,
  target_id text,
  meta jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_action_logs_user_id ON public.user_action_logs(user_id, created_at DESC);
CREATE INDEX idx_user_action_logs_action ON public.user_action_logs(action);

ALTER TABLE public.user_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own action logs"
ON public.user_action_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all action logs"
ON public.user_action_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Table system_logs
CREATE TABLE public.system_logs (
  id bigserial PRIMARY KEY,
  level text NOT NULL CHECK (level IN ('info', 'warning', 'error')),
  message text NOT NULL,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view system logs"
ON public.system_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));