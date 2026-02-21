-- Add role_type column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN role_type text CHECK (role_type IN ('participant', 'coordinator')) DEFAULT 'participant';

-- Update existing registrations to have participant role
UPDATE public.registrations 
SET role_type = 'participant' 
WHERE role_type IS NULL;
