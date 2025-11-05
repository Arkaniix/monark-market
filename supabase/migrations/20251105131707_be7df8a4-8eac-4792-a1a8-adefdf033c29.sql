-- Add discord_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN discord_id text;

-- Add a comment to explain the purpose
COMMENT ON COLUMN public.profiles.discord_id IS 'Discord username for user contact and support';