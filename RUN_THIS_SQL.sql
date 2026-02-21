-- ============================================
-- SIMPLE FIX FOR REGISTRATIONS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add role_type column
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS role_type text 
CHECK (role_type IN ('participant', 'coordinator')) 
DEFAULT 'participant';

-- 2. Add rejection_reason column
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 3. Fix status constraint
ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS registrations_status_check;

ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('registered', 'pending', 'rejected', 'attended', 'cancelled'));

-- 4. Update NULL values
UPDATE public.registrations 
SET role_type = 'participant' 
WHERE role_type IS NULL;

-- 5. Verify (check last 5 registrations)
SELECT id, student_id, event_id, status, role_type
FROM public.registrations 
ORDER BY id DESC 
LIMIT 5;
