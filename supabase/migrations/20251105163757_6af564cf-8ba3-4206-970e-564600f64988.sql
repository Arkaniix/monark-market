-- Update subscription plans with distinct features for each tier

-- Basic Plan: Entry-level features
UPDATE public.subscription_plans
SET features = jsonb_build_object(
  'credits_mensuels', 30,
  'catalogue_complet', true,
  'alertes_email', 'quotidiennes',
  'historique_prix', '30 jours'
)
WHERE name = 'Basic';

-- Pro Plan: Advanced features
UPDATE public.subscription_plans
SET features = jsonb_build_object(
  'credits_mensuels', 120,
  'catalogue_complet', true,
  'acces_estimator', true,
  'alertes_temps_reel', true,
  'historique_prix', 'complet',
  'analyses_detaillees', true,
  'comparateur_modeles', true
)
WHERE name = 'Pro';

-- Elite Plan: Premium features
UPDATE public.subscription_plans
SET features = jsonb_build_object(
  'credits_mensuels', 300,
  'acces_complet', true,
  'scrap_personnel', true,
  'publication_anticipee', '24h',
  'exports_personnalises', true,
  'support_prioritaire', true,
  'alertes_instantanees', true,
  'rapports_mensuels', true
)
WHERE name = 'Elite';

COMMENT ON TABLE public.subscription_plans IS 'Updated all plans with distinct, tier-appropriate features';