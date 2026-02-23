-- Add event_id column to coordinator_requests table
ALTER TABLE public.coordinator_requests 
ADD COLUMN event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;

-- This links coordinator requests to specific events
