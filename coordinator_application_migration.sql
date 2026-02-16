-- Coordinator Application System Migration

-- Create coordinator_applications table
CREATE TABLE public.coordinator_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
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

-- Function to auto-assign role based on email
CREATE OR REPLACE FUNCTION public.assign_role_by_email()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role_id INT;
BEGIN
  IF NEW.email = 'sbbhalani11@gmail.com' THEN
    SELECT id INTO assigned_role_id FROM public.roles WHERE name = 'admin';
  ELSIF NEW.email LIKE '%@charusat.ac.in' THEN
    SELECT id INTO assigned_role_id FROM public.roles WHERE name = 'faculty';
  ELSIF NEW.email LIKE '%@charusat.edu.in' THEN
    SELECT id INTO assigned_role_id FROM public.roles WHERE name = 'student';
  ELSE
    SELECT id INTO assigned_role_id FROM public.roles WHERE name = 'student';
  END IF;
  
  NEW.role_id := assigned_role_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to use email-based role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role_id INT;
BEGIN
  IF NEW.email = 'sbbhalani18@gmail.com' THEN
    SELECT id INTO assigned_role_id FROM public.roles WHERE name = 'admin';
  ELSIF NEW.email LIKE '%@charusat.ac.in' THEN
    SELECT id INTO assigned_role_id FROM public.roles WHERE name = 'faculty';
  ELSIF NEW.email LIKE '%@charusat.edu.in' THEN
    SELECT id INTO assigned_role_id FROM public.roles WHERE name = 'student';
  ELSE
    SELECT id INTO assigned_role_id FROM public.roles WHERE name = 'student';
  END IF;

  INSERT INTO public.users (id, email, full_name, role_id)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', assigned_role_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
