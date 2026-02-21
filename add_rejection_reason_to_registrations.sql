-- Add rejection_reason column to registrations table for coordinator request rejections
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update the status check constraint to include 'pending' status
ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS registrations_status_check;

ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('registered', 'pending', 'rejected', 'attended', 'cancelled'));

-- Comment for documentation
COMMENT ON COLUMN public.registrations.rejection_reason IS 'Reason provided by faculty when rejecting a coordinator request';
