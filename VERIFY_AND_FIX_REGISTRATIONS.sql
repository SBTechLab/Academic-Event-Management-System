-- ============================================
-- VERIFY AND FIX REGISTRATIONS TABLE
-- ============================================

-- Step 1: Check if role_type column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'registrations' 
AND column_name = 'role_type';

-- Step 2: Add role_type column if it doesn't exist
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS role_type text CHECK (role_type IN ('participant', 'coordinator')) DEFAULT 'participant';

-- Step 3: Add rejection_reason column if it doesn't exist
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Step 4: Update status constraint to include 'pending'
ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS registrations_status_check;

ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('registered', 'pending', 'rejected', 'attended', 'cancelled'));

-- Step 5: Update any NULL role_type values to 'participant'
UPDATE public.registrations 
SET role_type = 'participant' 
WHERE role_type IS NULL;

-- Step 6: Verify the data
SELECT 
    id,
    student_id,
    event_id,
    status,
    role_type,
    rejection_reason,
    created_at
FROM public.registrations
ORDER BY created_at DESC
LIMIT 10;

-- Step 7: Check for coordinator requests
SELECT 
    r.id,
    r.status,
    r.role_type,
    u.full_name as student_name,
    e.title as event_title,
    r.created_at
FROM public.registrations r
JOIN public.users u ON r.student_id = u.id
JOIN public.events e ON r.event_id = e.id
WHERE r.role_type = 'coordinator'
ORDER BY r.created_at DESC;

-- Step 8: Grant necessary permissions (if needed)
GRANT SELECT, INSERT, UPDATE ON public.registrations TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON COLUMN public.registrations.role_type IS 'Role type: participant or coordinator';
COMMENT ON COLUMN public.registrations.rejection_reason IS 'Reason for rejection if coordinator request is denied';
