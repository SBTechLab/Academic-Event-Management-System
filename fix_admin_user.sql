-- Ensure admin user exists with proper password
-- Run this in your Supabase SQL editor

-- First, ensure the password column exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- Insert or update admin user with hashed password
-- Password: password123 (bcrypt hashed)
INSERT INTO public.users (id, email, full_name, role_id, password)
VALUES (
    gen_random_uuid(),
    'sbbhalani11@gmail.com',
    'S. Bhalani',
    (SELECT id FROM public.roles WHERE name = 'admin'),
    '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum'
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum',
    role_id = (SELECT id FROM public.roles WHERE name = 'admin'),
    full_name = 'S. Bhalani';

-- Verify the admin user exists
SELECT u.id, u.email, u.full_name, r.name as role, 
       CASE WHEN u.password IS NOT NULL THEN 'Password Set' ELSE 'No Password' END as password_status
FROM public.users u
LEFT JOIN public.roles r ON u.role_id = r.id
WHERE u.email = 'sbbhalani11@gmail.com';