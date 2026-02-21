-- Add year column to users table for students
ALTER TABLE public.users 
ADD COLUMN year text CHECK (year IN ('1', '2', '3', '4'));

-- Update existing student users to have a default year
UPDATE public.users 
SET year = '1' 
WHERE role_id = (SELECT id FROM public.roles WHERE name = 'student') 
AND year IS NULL;
