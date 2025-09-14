-- Drop ALL RLS policies that might reference user_id columns
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_can_view_relevant_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "admin_manager_can_manage_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "users_can_view_assigned_projects" ON public.projects;
DROP POLICY IF EXISTS "admin_manager_can_manage_projects" ON public.projects;
DROP POLICY IF EXISTS "users_manage_own_stock_transactions" ON public.stock_transactions;
DROP POLICY IF EXISTS "admin_manager_can_view_all_transactions" ON public.stock_transactions;
DROP POLICY IF EXISTS "allow_authenticated_users" ON public.user_profiles;

-- Disable RLS on all tables temporarily
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions DISABLE ROW LEVEL SECURITY;

-- Drop foreign key constraints
ALTER TABLE public.project_assignments DROP CONSTRAINT IF EXISTS project_assignments_user_id_fkey;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_project_manager_id_fkey;
ALTER TABLE public.stock_transactions DROP CONSTRAINT IF EXISTS stock_transactions_user_id_fkey;

-- Create new user_profiles table with text ID
CREATE TABLE public.user_profiles_temp (
    id text PRIMARY KEY,
    email text NOT NULL,
    full_name text NOT NULL,
    phone text,
    role user_role DEFAULT 'worker',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Drop the old table completely
DROP TABLE public.user_profiles CASCADE;

-- Rename the temp table
ALTER TABLE public.user_profiles_temp RENAME TO user_profiles;

-- Update all other tables to use text
ALTER TABLE public.project_assignments ALTER COLUMN user_id TYPE text;
ALTER TABLE public.projects ALTER COLUMN project_manager_id TYPE text;
ALTER TABLE public.stock_transactions ALTER COLUMN user_id TYPE text;

-- Re-enable RLS with simple policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now
CREATE POLICY "allow_all" ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "allow_all" ON public.project_assignments FOR ALL USING (true);
CREATE POLICY "allow_all" ON public.projects FOR ALL USING (true);
CREATE POLICY "allow_all" ON public.stock_transactions FOR ALL USING (true);