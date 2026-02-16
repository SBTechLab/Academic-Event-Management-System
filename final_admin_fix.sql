-- Fix admin user with correct email, password and role
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

-- Verify admin user
SELECT u.email, u.full_name, r.name as role 
FROM public.users u
LEFT JOIN public.roles r ON u.role_id = r.id
WHERE u.email = 'sbbhalani18@gmail.com';