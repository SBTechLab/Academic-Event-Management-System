-- Add role_type column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS role_type text DEFAULT 'participant';

-- Update existing registrations
UPDATE public.registrations 
SET role_type = 'participant' 
WHERE role_type IS NULL;
