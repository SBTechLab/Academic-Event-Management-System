-- Delete existing admin user and create fresh one
DELETE FROM public.users WHERE email = 'sbbhalani18@gmail.com';

-- Insert admin user with fresh hash
INSERT INTO public.users (id, email, full_name, role_id, password)
VALUES (
    gen_random_uuid(),
    'sbbhalani18@gmail.com',
    'S. Bhalani',
    (SELECT id FROM public.roles WHERE name = 'admin'),
    '$2b$10$Ilu8/l6.3yOfiahzR6C/8uuGfuH5ee7wmzY/Vk9uwXrGF47HIqxkC'
);

-- Verify
SELECT u.email, u.full_name, r.name as role, 
       CASE WHEN u.password IS NOT NULL THEN 'Has Password' ELSE 'No Password' END as pwd_status
FROM public.users u
LEFT JOIN public.roles r ON u.role_id = r.id
WHERE u.email = 'sbbhalani18@gmail.com';