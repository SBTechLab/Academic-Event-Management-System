# Profile & Dashboard Updates - Summary

## Changes Made:

### 1. Created Profile Page (`client/src/pages/Profile.jsx`)
- Edit profile functionality (update full name)
- Back button for navigation
- **Student-only feature**: Coordinator application form
  - Only visible when role = 'student'
  - Shows application status if already applied
  - Allows students to apply with reason

### 2. Updated Dashboard (`client/src/pages/Dashboard.jsx`)
- Added back button (← Back) at top
- Changed "Edit Profile" button to link to `/profile` page

### 3. Updated Router (`client/src/router.jsx`)
- Added `/profile` route

## Features by Role:

### Student Profile:
- Edit name
- View email & role
- **Apply for Coordinator** section
- See application status (pending/approved/rejected)

### Faculty/Admin/Coordinator Profile:
- Edit name
- View email & role
- No coordinator application section

## API Endpoints Used:
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/coordinator/apply` - Apply for coordinator (students only)
- `GET /api/coordinator/my-application` - Get application status

## Navigation:
- Dashboard → "Edit Profile" → Profile page
- Profile page → "← Back" → Previous page
- Dashboard → "← Back" → Previous page

## Testing:
1. Login as student (email ending with @charusat.edu.in)
2. Go to Dashboard
3. Click "Edit Profile"
4. Update name and apply for coordinator
5. Use back button to navigate
