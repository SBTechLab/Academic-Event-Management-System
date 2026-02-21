-- Run this complete SQL in Supabase SQL Editor

-- 1. Add event_type column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'general';

-- 2. Add eligible_years column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS eligible_years text[] DEFAULT ARRAY['1', '2', '3', '4'];

-- 3. Update existing events to have default values
UPDATE public.events 
SET event_type = 'general' 
WHERE event_type IS NULL;

UPDATE public.events 
SET eligible_years = ARRAY['1', '2', '3', '4'] 
WHERE eligible_years IS NULL;

-- 4. Add year column to users table for students
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS year text CHECK (year IN ('1', '2', '3', '4'));

-- Done! All database changes applied successfully.
