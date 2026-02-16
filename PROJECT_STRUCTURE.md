# Project Structure Summary

## Dashboards by Role:

### 1. StudentDashboard.jsx
- Shows available events, registrations, attended events
- **Coordinator Request Feature**: Students can apply to become coordinators directly from dashboard
- Shows coordinator request status (pending/approved/rejected)
- Quick actions: Browse events, view coordinator status

### 2. FacultyDashboard.jsx  
- Shows faculty's created events
- **Coordinator Request Management**: Shows pending coordinator requests count
- Alert notification for pending requests
- Quick actions: Create events, manage coordinators
- Links to review coordinator requests

### 3. AdminDashboard.jsx
- Shows total events, pending events, total users
- Admin-level quick actions: Create events, manage events, coordinator requests
- Recent events overview

## Login Flow:
- Admin → `/admin-dashboard`
- Faculty → `/faculty-dashboard` 
- Student/Student Coordinator → `/student-dashboard`

## Coordinator Request Workflow:
1. **Student**: Applies from StudentDashboard → Request goes to "pending" status
2. **Faculty**: Sees pending requests in FacultyDashboard → Reviews in CoordinatorRequests.jsx
3. **Faculty**: Approves/Rejects → Student sees updated status in StudentDashboard

## Files Removed:
- `Dashboard.jsx` (old generic dashboard - no longer needed)

## Key Features:
- Role-based dashboards
- Integrated coordinator request system
- Real-time status updates
- Clean navigation flow
- Proper authentication with bcrypt hashing