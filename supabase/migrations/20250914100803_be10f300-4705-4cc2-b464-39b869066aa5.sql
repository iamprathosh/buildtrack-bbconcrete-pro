-- Drop all RLS policies first
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;

-- Drop the primary key and all dependent constraints with CASCADE
ALTER TABLE public.user_profiles DROP CONSTRAINT user_profiles_pkey CASCADE;

-- Change the column type from uuid to text
ALTER TABLE public.user_profiles ALTER COLUMN id TYPE text;

-- Change all the foreign key columns to text as well
ALTER TABLE public.project_assignments ALTER COLUMN user_id TYPE text;
ALTER TABLE public.projects ALTER COLUMN project_manager_id TYPE text;
ALTER TABLE public.stock_transactions ALTER COLUMN user_id TYPE text;

-- Add the primary key back
ALTER TABLE public.user_profiles ADD PRIMARY KEY (id);

-- Add foreign key constraints back (optional, since we're using Clerk)
ALTER TABLE public.project_assignments 
ADD CONSTRAINT project_assignments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id);

ALTER TABLE public.projects 
ADD CONSTRAINT projects_project_manager_id_fkey 
FOREIGN KEY (project_manager_id) REFERENCES public.user_profiles(id);

ALTER TABLE public.stock_transactions 
ADD CONSTRAINT stock_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id);

-- Create a simple policy for now (we'll improve this later)
CREATE POLICY "allow_authenticated_users" ON public.user_profiles 
FOR ALL 
USING (true);