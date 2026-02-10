-- =========================================================================================
-- Enhanced Database Seed Script
-- =========================================================================================
-- This script:
-- 1. Enables necessary extensions.
-- 2. Ensures Roles exist.
-- 3. Upserts Users (Admin, Faculty, Coordinator, Student) with specific emails and names.
-- 4. Assigns correct Roles.
-- 5. Creates Sample Events.
-- 6. Creates Sample Registrations and Notifications.
-- =========================================================================================

-- Enable pgcrypto
create extension if not exists "pgcrypto";

DO $$
DECLARE
  -- Role IDs
  role_admin_id int;
  role_faculty_id int;
  role_coord_id int;
  role_student_id int;
  
  -- User IDs (We use fixed UUIDs for seed data to link relationships reliably, or look them up if they exist)
  -- Note: In a real scenario, you might query them. Here we try to fetch or generate.
  v_admin_id uuid;
  v_faculty_id uuid;
  v_coord_id uuid;
  v_student_id uuid;

BEGIN
  -- 1. Ensure Roles Exist and Get IDs
  INSERT INTO public.roles (name) VALUES ('admin'), ('faculty'), ('student_coordinator'), ('student') ON CONFLICT (name) DO NOTHING;
  
  SELECT id INTO role_admin_id FROM public.roles WHERE name = 'admin';
  SELECT id INTO role_faculty_id FROM public.roles WHERE name = 'faculty';
  SELECT id INTO role_coord_id FROM public.roles WHERE name = 'student_coordinator';
  SELECT id INTO role_student_id FROM public.roles WHERE name = 'student';

  -- 2. Upsert Admin User (S. Bhalani)
  -- We rely on email uniqueness. If exists, we get the ID. If not, we create.
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'sbbhalani11@gmail.com';
  
  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (v_admin_id, '00000000-0000-0000-0000-000000000000', 'sbbhalani11@gmail.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "S. Bhalani"}', 'authenticated', 'authenticated');
  END IF;

  -- 3. Upsert Faculty User (Meet Rajani)
  SELECT id INTO v_faculty_id FROM auth.users WHERE email = 'rajanimeet2005@gmail.com';
  
  IF v_faculty_id IS NULL THEN
    v_faculty_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (v_faculty_id, '00000000-0000-0000-0000-000000000000', 'rajanimeet2005@gmail.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Meet Rajani"}', 'authenticated', 'authenticated');
  END IF;

  -- 4. Upsert Student Coordinator
  SELECT id INTO v_coord_id FROM auth.users WHERE email = 'd25ce143@charusat.edu.in';
  
  IF v_coord_id IS NULL THEN
    v_coord_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (v_coord_id, '00000000-0000-0000-0000-000000000000', 'd25ce143@charusat.edu.in', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Student Coordinator"}', 'authenticated', 'authenticated');
  END IF;

  -- 5. Upsert Student
  SELECT id INTO v_student_id FROM auth.users WHERE email = 'd24it142@gmail.com';
  
  IF v_student_id IS NULL THEN
    v_student_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (v_student_id, '00000000-0000-0000-0000-000000000000', 'd24it142@gmail.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Student D24"}', 'authenticated', 'authenticated');
  END IF;

  -- 6. Ensure public.users entries exist and Assign Roles
  -- Triggers might have handled insertion content, but we enforce specific Roles and Names here.
  
  -- Admin
  INSERT INTO public.users (id, email, full_name, role_id)
  VALUES (v_admin_id, 'sbbhalani11@gmail.com', 'S. Bhalani', role_admin_id)
  ON CONFLICT (id) DO UPDATE SET role_id = role_admin_id, full_name = 'S. Bhalani';

  -- Faculty
  INSERT INTO public.users (id, email, full_name, role_id)
  VALUES (v_faculty_id, 'rajanimeet2005@gmail.com', 'Meet Rajani', role_faculty_id)
  ON CONFLICT (id) DO UPDATE SET role_id = role_faculty_id, full_name = 'Meet Rajani';

  -- Coordinator
  INSERT INTO public.users (id, email, full_name, role_id)
  VALUES (v_coord_id, 'd25ce143@charusat.edu.in', 'Student Coordinator', role_coord_id)
  ON CONFLICT (id) DO UPDATE SET role_id = role_coord_id, full_name = 'Student Coordinator';

  -- Student
  INSERT INTO public.users (id, email, full_name, role_id)
  VALUES (v_student_id, 'd24it142@gmail.com', 'Student D24', role_student_id)
  ON CONFLICT (id) DO UPDATE SET role_id = role_student_id, full_name = 'Student D24';


  -- 7. Create Sample Events (Created by Faculty)
  INSERT INTO public.events (id, title, description, date, time, location, created_by, coordinator_id, status, image_url)
  VALUES 
    (
      gen_random_uuid(), 
      'Tech Innovation Summit 2026', 
      'Annual summit showcasing student innovations and final year projects. Keynote speakers from top tech industries.', 
      (now() + interval '10 days')::date, 
      '10:00', 
      'Auditorium A', 
      v_faculty_id, 
      v_coord_id, 
      'approved', 
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2670'
    ),
    (
      gen_random_uuid(), 
      'AI & Machine Learning Workshop', 
      'Hands-on workshop on the fundamentals of Neural Networks and Deep Learning using Python and TensorFlow.', 
      (now() + interval '5 days')::date, 
      '14:00', 
      'Computer Lab 3', 
      v_faculty_id, 
      v_coord_id, 
      'approved', 
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=2670'
    ),
     (
      gen_random_uuid(), 
      'Cultural Night Rehearsal', 
      'Initial screening and rehearsal for the upcoming Cultural Night. Open for all departments.', 
      (now() + interval '2 days')::date, 
      '16:00', 
      'Student Center', 
      v_faculty_id, 
      v_coord_id, 
      'approved', 
      'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=2670'
    )
  ON CONFLICT DO NOTHING; -- Simple check to avoid duplicates if run multiple times (though UUIDs are random)

  -- 8. Add Notifications
  INSERT INTO public.notifications (user_id, message, is_read)
  VALUES
    (v_student_id, 'Welcome to the Academic Event Management System!', false),
    (v_student_id, 'New event "Tech Innovation Summit 2026" has been approved.', false),
    (v_coord_id, 'You have been assigned as coordinator for "AI & Machine Learning Workshop".', false);

END $$;
