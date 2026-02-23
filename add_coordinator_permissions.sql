-- ============================================
-- ADD COORDINATOR PERMISSIONS TO REGISTRATIONS
-- ============================================

-- Add permissions column as JSONB to store multiple permissions
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS coordinator_permissions jsonb DEFAULT '[]'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN public.registrations.coordinator_permissions IS 'Array of permissions granted to coordinator: mark_attendance, view_participants, manage_details, send_announcements, etc.';

-- Example permissions structure:
-- ["mark_attendance", "view_participants", "manage_details", "send_announcements"]

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'registrations' 
AND column_name = 'coordinator_permissions';
