-- Disable RLS temporarily or add permissive policies for service role
-- This allows your backend to access data using the service role key

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Faculty and Admin can create events" ON public.events;
DROP POLICY IF EXISTS "Faculty and Admin can update events" ON public.events;
DROP POLICY IF EXISTS "Students view own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Faculty/Admin view all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Students can register" ON public.registrations;
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;

-- Disable RLS on all tables (backend will handle authorization)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
