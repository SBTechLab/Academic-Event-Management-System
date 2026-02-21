-- Add rejection_reason column to events table
ALTER TABLE public.events 
ADD COLUMN rejection_reason text;

-- This will store the reason when admin rejects an event
