-- ============================================
-- FIX REGISTRATIONS TABLE - CORRECTED VERSION
-- ============================================

-- Step 1: Add role_type column (if missing)
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS role_type text 
CHECK (role_type IN ('participant', 'coordinator')) 
DEFAULT 'participant';

-- Step 2: Add rejection_reason column (if missing)
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Step 3: Fix status constraint
ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS registrations_status_check;

ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('registered', 'pending', 'rejected', 'attended', 'cancelled'));

-- Step 4: Update existing NULL values
UPDATE public.registrations 
SET role_type = 'participant' 
WHERE role_type IS NULL;

-- Step 5: Verify it worked (without created_at)
SELECT id, student_id, event_id, status, role_type, rejection_reason
FROM public.registrations 
ORDER BY id DESC 
LIMIT 10;

-- Step 6: Check coordinator requests
SELECT 
    r.id,
    r.status,
    r.role_type,
    u.full_name as student_name,
    e.title as event_title
FROM public.registrations r
JOIN public.users u ON r.student_id = u.id
JOIN public.events e ON r.event_id = e.id
WHERE r.role_type = 'coordinator'
ORDER BY r.id DESC;

-- Step 7: Check table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'registrations'
ORDER BY ordinal_position;
