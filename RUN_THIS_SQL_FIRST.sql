-- Run this in Supabase SQL Editor

-- Add eligible_years column to events table
ALTER TABLE public.events 
ADD COLUMN eligible_years text[] DEFAULT ARRAY['1', '2', '3', '4'];

-- Update existing events
UPDATE public.events 
SET eligible_years = ARRAY['1', '2', '3', '4'] 
WHERE eligible_years IS NULL;
