-- Fix admin user role
UPDATE public.users 
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin')
WHERE email = 'sbbhalani18@gmail.com';

-- Verify the user role
SELECT u.email, u.full_name, r.name as role 
FROM public.users u
LEFT JOIN public.roles r ON u.role_id = r.id
WHERE u.email = 'sbbhalani18@gmail.com';