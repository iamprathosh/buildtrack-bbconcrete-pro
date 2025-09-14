-- Update user_profiles table to accept Clerk user IDs (text format instead of UUID)
ALTER TABLE public.user_profiles 
ALTER COLUMN id TYPE text;

-- Update foreign key constraints to use text type
ALTER TABLE public.project_assignments 
ALTER COLUMN user_id TYPE text;

ALTER TABLE public.projects 
ALTER COLUMN project_manager_id TYPE text;

ALTER TABLE public.stock_transactions 
ALTER COLUMN user_id TYPE text;

-- Update the handle_new_user function since we're not using auth.users anymore
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Update the is_admin_or_manager function to work with text IDs
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND up.role IN ('super_admin', 'project_manager')
)
$$;