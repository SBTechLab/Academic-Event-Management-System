-- Student specific queries and mock data

-- 1. Insert or update mock Student Coordinator
INSERT INTO public.users (id, email, full_name, role_id, password)
VALUES (
    gen_random_uuid(),
    'd25ce143@charusat.edu.in',
    'Student Coordinator',
    (SELECT id FROM public.roles WHERE name = 'student_coordinator'),
    '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum'
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum',
    role_id = (SELECT id FROM public.roles WHERE name = 'student_coordinator'),
    full_name = 'Student Coordinator';

-- 2. Insert or update mock regular Student
INSERT INTO public.users (id, email, full_name, role_id, password)
VALUES (
    gen_random_uuid(),
    'd24it142@gmail.com',
    'Student D24',
    (SELECT id FROM public.roles WHERE name = 'student'),
    '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum'
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum',
    role_id = (SELECT id FROM public.roles WHERE name = 'student'),
    full_name = 'Student D24';

-- 3. Mock student notifications
INSERT INTO public.notifications (user_id, message, is_read)
SELECT id, 'Welcome to the Academic Event Management System!', false
FROM public.users WHERE email = 'd24it142@gmail.com'
LIMIT 1;

-- 4. Verify registrations and requests are intact
SELECT 
    r.id,
    r.status,
    r.role_type,
    u.full_name as student_name,
    e.title as event_title,
    r.registered_at
FROM public.registrations r
JOIN public.users u ON r.student_id = u.id
JOIN public.events e ON r.event_id = e.id
WHERE r.role_type = 'coordinator'
ORDER BY r.registered_at DESC;
