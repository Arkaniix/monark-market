-- Mettre à jour la fonction de réinitialisation des crédits avec les nouveaux montants
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