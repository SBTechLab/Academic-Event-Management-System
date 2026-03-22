-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create roles table
create table public.roles (
  id serial primary key,
  name text not null unique
);

-- Insert roles
insert into public.roles (name) values 
('admin'), 
('faculty'), 
('student_coordinator'), 
('student');

-- Create users table (extends auth.users)

create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role_id int references public.roles(id) on delete set null,
  avatar_url text,
  password text,
  year text check (year in ('1', '2', '3', '4')),
  created_at timestamptz default now()
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Create events table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  date date not null,
  time time not null,
  location text not null,
  created_by uuid references public.users(id) on delete set null,
  coordinator_id uuid references public.users(id) on delete set null,
  status text check (status in ('pending', 'approved', 'rejected', 'cancelled')) default 'pending',
  image_url text,
  event_type text check (event_type in ('seminar', 'workshop', 'technical', 'cultural', 'guest_lecture', 'competition', 'other')) default 'general',
  eligible_years text[] default array['1', '2', '3', '4'],
  rejection_reason text,
  update_reason text,
  created_at timestamptz default now()
);

-- Enable RLS on events
alter table public.events enable row level security;

-- Create registrations table
create table public.registrations (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade,
  student_id uuid references public.users(id) on delete cascade,
  status text check (status in ('registered', 'pending', 'rejected', 'attended', 'cancelled')) default 'registered',
  role_type text check (role_type in ('participant', 'coordinator')) default 'participant',
  rejection_reason text,
  permissions jsonb default '[]'::jsonb,
  coordinator_permissions jsonb default '[]'::jsonb,
  registered_at timestamptz default now(),
  unique(event_id, student_id)
);

-- Enable RLS on registrations
alter table public.registrations enable row level security;

-- Create coordinator_applications table
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
ALTER TABLE public.coordinator_applications ENABLE ROW LEVEL SECURITY;

-- Create coordinator_requests table
CREATE TABLE IF NOT EXISTS public.coordinator_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

-- Create notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  message text not null,
  type text check (type in ('success', 'warning', 'info', 'error')) default 'info',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on notifications
alter table public.notifications enable row level security;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- RLS Policies Base Functions
create or replace function public.is_admin() returns boolean as $$
begin
  return exists (
    select 1 from public.users u
    join public.roles r on u.role_id = r.id
    where u.id = auth.uid() and r.name = 'admin'
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_faculty() returns boolean as $$
begin
  return exists (
    select 1 from public.users u
    join public.roles r on u.role_id = r.id
    where u.id = auth.uid() and r.name = 'faculty'
  );
end;
$$ language plpgsql security definer;

-- Trigger for new auth user -> public user
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.users (id, email, full_name, role_id)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', (select id from public.roles where name = 'student'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Disable RLS temporarily or add permissive policies for backend service role operations
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinator_requests DISABLE ROW LEVEL SECURITY;
