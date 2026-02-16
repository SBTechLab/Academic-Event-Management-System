-- Ensure coordinator_requests table exists and is properly configured
CREATE TABLE IF NOT EXISTS public.coordinator_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  UNIQUE(student_id)
);

-- Disable RLS for testing
ALTER TABLE public.coordinator_requests DISABLE ROW LEVEL SECURITY;

-- Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'coordinator_requests' 
AND table_schema = 'public';