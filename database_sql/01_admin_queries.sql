-- Admin specific queries and hotfixes

-- 1. Insert or update the main admin user with a fresh hashed password
INSERT INTO public.users (id, email, full_name, role_id, password)
VALUES (
    gen_random_uuid(),
    'sbbhalani18@gmail.com',
    'S. Bhalani',
    (SELECT id FROM public.roles WHERE name = 'admin'),
    '$2b$10$X65pYgsE/FPErcum8uSU.OGu77ki9TlT0DJSnr/GYokfdHs06GSyG'
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2b$10$X65pYgsE/FPErcum8uSU.OGu77ki9TlT0DJSnr/GYokfdHs06GSyG',
    role_id = (SELECT id FROM public.roles WHERE name = 'admin'),
    full_name = 'S. Bhalani';

-- 2. Insert or update the alternate admin user
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

-- 3. Verify admin users
SELECT u.id, u.email, u.full_name, r.name as role, 
       CASE WHEN u.password IS NOT NULL THEN 'Password Set' ELSE 'No Password' END as password_status
FROM public.users u
LEFT JOIN public.roles r ON u.role_id = r.id
WHERE r.name = 'admin';
