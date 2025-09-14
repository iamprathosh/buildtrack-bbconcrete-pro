-- Fix the remaining function search path issue
DROP FUNCTION IF EXISTS public.handle_new_user();

-- The handle_new_user function is no longer needed since we're using Clerk auth
-- All functions now have proper search paths set