-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- Go to: https://supabase.com/dashboard
-- Click: SQL Editor → New Query
-- Paste this entire file and click RUN
-- ============================================

-- 1. Add event_type column
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'general';

-- 2. Add eligible_years column (THIS IS THE IMPORTANT ONE)
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS eligible_years text[] DEFAULT ARRAY['1', '2', '3', '4'];

-- 3. Update existing events with default values
UPDATE public.events 
SET event_type = 'general' 
WHERE event_type IS NULL;

UPDATE public.events 
SET eligible_years = ARRAY['1', '2', '3', '4'] 
WHERE eligible_years IS NULL;

-- 4. Add year column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS year text CHECK (year IN ('1', '2', '3', '4'));

-- ============================================
-- DONE! Now restart your backend server
-- ============================================
