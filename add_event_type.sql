-- Add event_type column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'general';

-- Update existing events to have general type
UPDATE public.events 
SET event_type = 'general' 
WHERE event_type IS NULL;
