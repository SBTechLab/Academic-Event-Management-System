-- Add update_reason column to events table
ALTER TABLE public.events 
ADD COLUMN update_reason text;

-- This will store the reason when faculty updates an event
