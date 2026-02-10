# Authentication Rules

## Provider
- Supabase Authentication

## Rules
- All users must authenticate
- Role assigned after signup
- Token must be verified on every request

## Authorization
- Admin: Full access
- Faculty: Event management
- Student Coordinator: Registration & attendance
- Student: View & register only

## Security
- No role stored only in frontend
- Backend must verify role for every action
