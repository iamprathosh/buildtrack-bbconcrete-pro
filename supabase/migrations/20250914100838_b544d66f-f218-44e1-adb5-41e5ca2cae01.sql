-- Disable RLS temporarily
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Create a new user_profiles table with text ID
CREATE TABLE public.user_profiles_new (
    id text PRIMARY KEY,
    email text NOT NULL,
    full_name text NOT NULL,
    phone text,
    role user_role DEFAULT 'worker',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Copy any existing data (if any)
INSERT INTO public.user_profiles_new (id, email, full_name, phone, role, is_active, created_at, updated_at)
SELECT id::text, email, full_name, phone, role, is_active, created_at, updated_at 
FROM public.user_profiles;

-- Drop the old table
DROP TABLE public.user_profiles CASCADE;

-- Rename the new table
ALTER TABLE public.user_profiles_new RENAME TO user_profiles;

-- Update other tables to use text for user IDs
ALTER TABLE public.project_assignments ALTER COLUMN user_id TYPE text;
ALTER TABLE public.projects ALTER COLUMN project_manager_id TYPE text;
ALTER TABLE public.stock_transactions ALTER COLUMN user_id TYPE text;

-- Re-enable RLS and add policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for now (since we're using Clerk auth)
CREATE POLICY "allow_authenticated_users" ON public.user_profiles 
FOR ALL 
USING (true);

-- Recreate the trigger for updated_at
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