-- Add credits tracking to user subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN credits_remaining integer DEFAULT 30,
ADD COLUMN credits_reset_date timestamp with time zone DEFAULT (now() + interval '1 month');

-- Add comment to explain
COMMENT ON COLUMN public.user_subscriptions.credits_remaining IS 'Remaining credits for the current billing period';
COMMENT ON COLUMN public.user_subscriptions.credits_reset_date IS 'Date when credits will be reset';

-- Function to reset credits monthly
CREATE OR REPLACE FUNCTION reset_user_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_subscriptions us
  SET 
    credits_remaining = CASE 
      WHEN sp.name = 'Basic' THEN 30
      WHEN sp.name = 'Pro' THEN 120
      WHEN sp.name = 'Elite' THEN 300
      ELSE 30
    END,
    credits_reset_date = now() + interval '1 month'
  FROM public.subscription_plans sp
  WHERE us.plan_id = sp.id
    AND us.status = 'active'
    AND us.credits_reset_date <= now();
END;
$$;