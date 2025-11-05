-- Update Elite plan features to replace api_access with exports_personnalises
UPDATE public.subscription_plans
SET features = jsonb_set(
  features - 'api_access',
  '{exports_personnalises}',
  'true'::jsonb
)
WHERE name = 'Elite' AND features ? 'api_access';

-- Verify the update
COMMENT ON TABLE public.subscription_plans IS 'Updated Elite plan: replaced api_access with exports_personnalises feature';