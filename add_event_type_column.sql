-- Add event_type column to events table
ALTER TABLE public.events 
ADD COLUMN event_type text CHECK (event_type IN ('seminar', 'workshop', 'technical', 'cultural', 'guest_lecture', 'competition', 'other'));

-- Update existing events to have a default type
UPDATE public.events 
SET event_type = 'other'
WHERE event_type IS NULL;
