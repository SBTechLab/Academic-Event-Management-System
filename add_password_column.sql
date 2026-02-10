-- Add password column to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing users with hashed passwords (bcrypt format)
-- Password: password123
-- Bcrypt hash: $2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum
UPDATE public.users SET password = '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum' WHERE email = 'sbbhalani11@gmail.com';
UPDATE public.users SET password = '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum' WHERE email = 'rajanimeet2005@gmail.com';
UPDATE public.users SET password = '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum' WHERE email = 'd25ce143@charusat.edu.in';
UPDATE public.users SET password = '$2b$10$.ZpWnYLqpOq3yFMWKwQo0OkZLguCs8LShfsTSMZ2Rm3.bctDmiRum' WHERE email = 'd24it142@gmail.com';
