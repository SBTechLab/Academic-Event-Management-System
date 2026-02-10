-- Enable UUID extension
create extension if not exists "uuid-ossp";

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
  status text check (status in ('pending', 'approved', 'completed')) default 'pending',
  image_url text,
  created_at timestamptz default now()
);

-- Enable RLS on events
alter table public.events enable row level security;

-- Create registrations table
create table public.registrations (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade,
  student_id uuid references public.users(id) on delete cascade,
  status text check (status in ('registered', 'attended', 'cancelled')) default 'registered',
  registered_at timestamptz default now(),
  unique(event_id, student_id)
);

-- Enable RLS on registrations
alter table public.registrations enable row level security;

-- Create notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on notifications
alter table public.notifications enable row level security;

-- RLS Policies

-- Users: Read own profile
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Events: Public read access
create policy "Events are viewable by everyone" on public.events
  for select using (true);

-- Events: Faculty and Admin can insert/update
-- Note: This requires a way to check user role. 
-- For simplicity in this script, we assume role check via app logic or a helper function in DB.
-- A robust RLS would join with roles table.

-- Helper function to check role
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users u
    join public.roles r on u.role_id = r.id
    where u.id = auth.uid() and r.name = 'admin'
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_faculty()
returns boolean as $$
begin
  return exists (
    select 1 from public.users u
    join public.roles r on u.role_id = r.id
    where u.id = auth.uid() and r.name = 'faculty'
  );
end;
$$ language plpgsql security definer;

-- Apply Event Modification Policies
create policy "Faculty and Admin can create events" on public.events
  for insert with check (public.is_admin() or public.is_faculty());

create policy "Faculty and Admin can update events" on public.events
  for update using (public.is_admin() or public.is_faculty());

-- Registrations: Student view own, Faculty/Admin view all
create policy "Students view own registrations" on public.registrations
  for select using (auth.uid() = student_id);

create policy "Faculty/Admin view all registrations" on public.registrations
  for select using (public.is_admin() or public.is_faculty());

create policy "Students can register" on public.registrations
  for insert with check (auth.uid() = student_id);

-- Notifications: View own
create policy "Users view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role_id)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', (select id from public.roles where name = 'student'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
