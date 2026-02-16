-- Fix coordinator_applications foreign key constraint

-- Drop existing table if it has issues
DROP TABLE IF EXISTS public.coordinator_applications CASCADE;

-- Recreate with correct foreign key
CREATE TABLE public.coordinator_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.coordinator_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view own applications" ON public.coordinator_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can create applications" ON public.coordinator_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin/Faculty can view all applications" ON public.coordinator_applications
  FOR SELECT USING (public.is_admin() OR public.is_faculty());

CREATE POLICY "Admin/Faculty can update applications" ON public.coordinator_applications
  FOR UPDATE USING (public.is_admin() OR public.is_faculty());
