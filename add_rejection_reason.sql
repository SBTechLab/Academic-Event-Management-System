-- Add rejection_reason column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS rejection_reason text;
