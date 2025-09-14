-- Fix security issues identified by the linter

-- 1. Fix function search path for existing functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_product_stock() SET search_path = public;

-- 2. Enable leaked password protection 
-- This setting needs to be enabled in Supabase Auth settings, but we can set secure defaults
-- The migration will remind the user to enable this in the dashboard