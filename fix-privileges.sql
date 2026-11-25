# SQL à exécuter dans le Supabase SQL Editor
# https://supabase.com/dashboard/project/xrnyhvwushvyhbscuowx/sql/new

-- 1. Grant privileges on profiles table
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO service_role;

-- 2. Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

-- 3. Grant execute on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 4. Verify
SELECT * FROM pg_policies WHERE tablename = 'profiles';
SELECT count(*) FROM public.profiles;
