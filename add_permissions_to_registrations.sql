-- Add permissions column to registrations table for coordinators
ALTER TABLE public.registrations 
ADD COLUMN permissions jsonb DEFAULT '[]'::jsonb;

-- This will store coordinator permissions like:
-- ["generate_certificates", "view_participants", "update_schedule", "add_details"]
