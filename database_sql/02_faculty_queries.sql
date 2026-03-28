-- Faculty specific queries and mock data

-- 1. Insert or update the main faculty user
INSERT INTO public.users (id, email, full_name, role_id, password)
VALUES (
    gen_random_uuid(),
    'rajanimeet2005@gmail.com',
    'Meet Rajani',
    (SELECT id FROM public.roles WHERE name = 'faculty'),
    '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum'
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum',
    role_id = (SELECT id FROM public.roles WHERE name = 'faculty'),
    full_name = 'Meet Rajani';

-- 2. Insert mock events created by the faculty
INSERT INTO public.events (id, title, description, date, time, location, created_by, status, image_url, event_type)
VALUES 
    (
      gen_random_uuid(), 
      'Tech Innovation Summit 2026', 
      'Annual summit showcasing student innovations and final year projects. Keynote speakers from top tech industries.', 
      (now() + interval '10 days')::date, 
      '10:00', 
      'Auditorium A', 
      (SELECT id FROM public.users WHERE email = 'rajanimeet2005@gmail.com' LIMIT 1), 
      'approved', 
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2670',
      'technical'
    ),
    (
      gen_random_uuid(), 
      'AI & Machine Learning Workshop', 
      'Hands-on workshop on the fundamentals of Neural Networks and Deep Learning using Python and TensorFlow.', 
      (now() + interval '5 days')::date, 
      '14:00', 
      'Computer Lab 3', 
      (SELECT id FROM public.users WHERE email = 'rajanimeet2005@gmail.com' LIMIT 1), 
      'approved', 
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=2670',
      'workshop'
    )
ON CONFLICT DO NOTHING;
