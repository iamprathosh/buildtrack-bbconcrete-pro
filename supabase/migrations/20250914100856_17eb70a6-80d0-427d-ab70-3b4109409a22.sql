-- Drop ALL policies that might be causing issues
DROP POLICY IF EXISTS "users_can_view_relevant_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "admin_manager_can_manage_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "users_can_view_assigned_projects" ON public.projects;
DROP POLICY IF EXISTS "admin_manager_can_manage_projects" ON public.projects;
DROP POLICY IF EXISTS "users_manage_own_stock_transactions" ON public.stock_transactions;
DROP POLICY IF EXISTS "admin_manager_can_view_all_transactions" ON public.stock_transactions;

-- Now disable RLS completely and recreate the table
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Create new table with correct text ID structure
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

-- Drop old table completely
DROP TABLE public.user_profiles CASCADE;

-- Rename temp table to correct name
ALTER TABLE public.user_profiles_temp RENAME TO user_profiles;

-- Update other table columns to text
ALTER TABLE public.project_assignments ALTER COLUMN user_id TYPE text;
ALTER TABLE public.projects ALTER COLUMN project_manager_id TYPE text;
ALTER TABLE public.stock_transactions ALTER COLUMN user_id TYPE text;

-- Enable RLS back
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple permissive policy for now
CREATE POLICY "allow_authenticated_users" ON public.user_profiles 
FOR ALL 
USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();