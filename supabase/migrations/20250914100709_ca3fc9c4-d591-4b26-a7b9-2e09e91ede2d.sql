-- Drop RLS policies that depend on the id column
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_can_view_relevant_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "admin_manager_can_manage_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "users_can_view_assigned_projects" ON public.projects;
DROP POLICY IF EXISTS "admin_manager_can_manage_projects" ON public.projects;
DROP POLICY IF EXISTS "users_manage_own_stock_transactions" ON public.stock_transactions;
DROP POLICY IF EXISTS "admin_manager_can_view_all_transactions" ON public.stock_transactions;

-- Drop foreign key constraints
ALTER TABLE public.project_assignments DROP CONSTRAINT IF EXISTS project_assignments_user_id_fkey;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_project_manager_id_fkey;
ALTER TABLE public.stock_transactions DROP CONSTRAINT IF EXISTS stock_transactions_user_id_fkey;

-- Update column types from uuid to text
ALTER TABLE public.user_profiles ALTER COLUMN id TYPE text;
ALTER TABLE public.project_assignments ALTER COLUMN user_id TYPE text;
ALTER TABLE public.projects ALTER COLUMN project_manager_id TYPE text;
ALTER TABLE public.stock_transactions ALTER COLUMN user_id TYPE text;

-- Recreate RLS policies with text-based IDs
CREATE POLICY "users_manage_own_user_profiles" 
ON public.user_profiles 
FOR ALL 
USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "users_can_view_relevant_assignments" 
ON public.project_assignments 
FOR SELECT 
USING (
  user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND up.role IN ('super_admin', 'project_manager')
  ) OR 
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.project_manager_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "admin_manager_can_manage_assignments" 
ON public.project_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND up.role IN ('super_admin', 'project_manager')
  )
);

CREATE POLICY "users_can_view_assigned_projects" 
ON public.projects 
FOR SELECT 
USING (
  project_manager_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND up.role IN ('super_admin', 'project_manager')
  )
);

CREATE POLICY "admin_manager_can_manage_projects" 
ON public.projects 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND up.role IN ('super_admin', 'project_manager')
  )
);

CREATE POLICY "users_manage_own_stock_transactions" 
ON public.stock_transactions 
FOR ALL 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "admin_manager_can_view_all_transactions" 
ON public.stock_transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND up.role IN ('super_admin', 'project_manager')
  )
);

-- Update the is_admin_or_manager function
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