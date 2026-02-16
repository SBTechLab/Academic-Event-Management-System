# Role Assignment & Coordinator Application System

## Implementation Summary

### 1. Email-Based Role Assignment

**Automatic role assignment during registration:**
- `sbbhalani11@gmail.com` → **Admin**
- `*@charusat.ac.in` → **Faculty**
- `*@charusat.edu.in` → **Student**
- All others → **Student** (default)

### 2. Student Coordinator Application Flow

**Process:**
1. Student registers → Gets 'student' role automatically
2. Student applies for coordinator position (provides reason)
3. Admin/Faculty reviews application
4. On approval → Student role upgraded to 'student_coordinator'
5. Notification sent to student

### 3. Files Created

#### Database
- `coordinator_application_migration.sql` - Run this in Supabase SQL Editor

#### Backend
- `server/controllers/coordinatorController.js` - Application logic
- `server/routes/coordinatorRoutes.js` - API endpoints
- `server/index.js` - Updated with new routes

#### Frontend
- `client/src/components/CoordinatorApplication.jsx` - Student application form
- `client/src/components/CoordinatorApplications.jsx` - Admin/Faculty review panel

### 4. API Endpoints

```
POST   /api/coordinator/apply              - Student applies (requires 'student' role)
GET    /api/coordinator/my-application     - Get own application status
GET    /api/coordinator/applications       - Get all applications (admin/faculty only)
PATCH  /api/coordinator/applications/:id   - Approve/reject (admin/faculty only)
```

### 5. Setup Instructions

1. **Run Database Migration:**
   ```sql
   -- Execute coordinator_application_migration.sql in Supabase SQL Editor
   ```

2. **Backend is ready** - Routes already added to server/index.js

3. **Add to Frontend Router:**
   ```jsx
   // In router.jsx or App.jsx
   import CoordinatorApplication from './components/CoordinatorApplication';
   import CoordinatorApplications from './components/CoordinatorApplications';
   
   // Student route
   <Route path="/apply-coordinator" element={<CoordinatorApplication />} />
   
   // Admin/Faculty route
   <Route path="/coordinator-applications" element={<CoordinatorApplications />} />
   ```

4. **Test Flow:**
   - Register with @charusat.edu.in email → Should get 'student' role
   - Register with @charusat.ac.in email → Should get 'faculty' role
   - Student applies for coordinator
   - Admin/Faculty approves
   - Student role changes to 'student_coordinator'

### 6. Database Schema

```sql
coordinator_applications:
- id (UUID)
- user_id (UUID) - References users
- reason (TEXT) - Why they want to be coordinator
- status (TEXT) - 'pending', 'approved', 'rejected'
- applied_at (TIMESTAMP)
- reviewed_by (UUID) - Admin/Faculty who reviewed
- reviewed_at (TIMESTAMP)
```

### 7. Security

- RLS policies ensure students only see their own applications
- Only admin/faculty can view all applications and approve/reject
- Role upgrade happens automatically on approval
- Notifications sent on approval/rejection
