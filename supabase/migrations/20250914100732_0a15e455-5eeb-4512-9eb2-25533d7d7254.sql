-- Drop the foreign key constraint that's causing the issue
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Try dropping all other related constraints
DO $$
BEGIN
    -- Drop all foreign key constraints that might reference user_profiles
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'project_assignments_user_id_fkey') THEN
        ALTER TABLE public.project_assignments DROP CONSTRAINT project_assignments_user_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'projects_project_manager_id_fkey') THEN
        ALTER TABLE public.projects DROP CONSTRAINT projects_project_manager_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'stock_transactions_user_id_fkey') THEN
        ALTER TABLE public.stock_transactions DROP CONSTRAINT stock_transactions_user_id_fkey;
    END IF;
    
    -- Try to find and drop any other constraints that might be blocking us
    FOR r IN (SELECT constraint_name, table_name FROM information_schema.table_constraints 
              WHERE constraint_type = 'FOREIGN KEY' 
              AND table_schema = 'public'
              AND (table_name = 'user_profiles' OR constraint_name LIKE '%user%'))
    LOOP
        EXECUTE 'ALTER TABLE public.' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

-- Now update the column type
ALTER TABLE public.user_profiles ALTER COLUMN id TYPE text;

-- Update other tables to use text for user IDs
ALTER TABLE public.project_assignments ALTER COLUMN user_id TYPE text;
ALTER TABLE public.projects ALTER COLUMN project_manager_id TYPE text;
ALTER TABLE public.stock_transactions ALTER COLUMN user_id TYPE text;