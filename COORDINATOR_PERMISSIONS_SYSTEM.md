# 🎯 Coordinator Permissions System

## 📋 Overview
Comprehensive permission-based coordinator system where faculty can grant specific permissions to coordinators for each event.

---

## ✨ Key Features

### 1. **Faculty Permission Management**
- See coordinator request details
- View student information
- Grant specific permissions via checkboxes
- Approve with selected permissions
- Reject with reason

### 2. **Available Permissions**
- ✅ **Mark Attendance** - Mark participants as present/absent
- 👥 **View Participants** - See all registered participants
- ✏️ **Manage Event Details** - Edit event information
- 📢 **Send Announcements** - Send notifications to participants
- 📊 **Generate Reports** - Create attendance and participation reports
- 📋 **Manage Registrations** - Approve/cancel participant registrations

### 3. **Coordinator Dashboard**
- Permission-based interface
- Only shows features coordinator has access to
- Real-time participant management
- Attendance tracking
- Event statistics

---

## 🔄 Complete Flow

### Faculty Side:
1. Receives coordinator request
2. Clicks "See Details" button
3. Views student information
4. Selects permissions via checkboxes
5. Clicks "Approve with Permissions"
6. Permissions saved to database

### Student Side:
1. Applies as coordinator
2. Waits for approval
3. Once approved, sees "Coordinator Dashboard" button in My Events
4. Clicks button to access dashboard
5. Dashboard shows only granted permissions
6. Can perform actions based on permissions

---

## 🗄️ Database Setup

**Run this SQL in Supabase:**

```sql
-- Add permissions column
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS coordinator_permissions jsonb DEFAULT '[]'::jsonb;

-- Example data structure:
-- ["mark_attendance", "view_participants", "manage_event_details"]
```

---

## 📁 Files Created/Modified

### New Files:
1. **`CoordinatorDashboard.jsx`** - Permission-based coordinator interface
2. **`add_coordinator_permissions.sql`** - Database migration

### Modified Files:
1. **`FacultyDashboard.jsx`**
   - Added "See Details" button
   - Created permissions modal
   - Permission selection checkboxes
   - Approve with permissions functionality

2. **`registrationController.js`**
   - Added coordinator_permissions handling
   - Saves permissions array to database

3. **`router.jsx`**
   - Added `/coordinator/event/:eventId` route

---

## 🎨 UI Components

### Faculty Permission Modal:
- Student information card
- 6 permission checkboxes with descriptions
- Cancel, Reject, and Approve buttons
- Approve button disabled until at least 1 permission selected

### Coordinator Dashboard:
- Event header with details
- Permissions overview badges
- Statistics cards (Total, Attended, Registered)
- Tabbed interface (Participants, Attendance, Details)
- Permission-based tab visibility

---

## 🔐 Permission Details

| Permission | Description | Dashboard Feature |
|------------|-------------|-------------------|
| `mark_attendance` | Mark participants present/absent | Attendance tab with mark buttons |
| `view_participants` | View all registered participants | Participants tab with list |
| `manage_event_details` | Edit event information | Event Details tab (read-only for now) |
| `send_announcements` | Send notifications | Announcements feature (future) |
| `generate_reports` | Create reports | Reports feature (future) |
| `manage_registrations` | Approve/cancel registrations | Registration management (future) |

---

## 🧪 Testing Steps

### 1. Setup Database:
```sql
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS coordinator_permissions jsonb DEFAULT '[]'::jsonb;
```

### 2. Test Faculty Flow:
1. Login as faculty
2. Student applies as coordinator
3. Faculty dashboard shows request
4. Click "See Details"
5. Select permissions (e.g., Mark Attendance, View Participants)
6. Click "Approve with Permissions"
7. Verify request disappears

### 3. Test Coordinator Flow:
1. Login as approved coordinator student
2. Go to "My Events"
3. Find event with coordinator role
4. Click "Coordinator Dashboard"
5. Verify only granted permissions show
6. Test marking attendance
7. Test viewing participants

### 4. Verify Database:
```sql
SELECT 
    r.id,
    u.full_name,
    e.title,
    r.coordinator_permissions
FROM registrations r
JOIN users u ON r.student_id = u.id
JOIN events e ON r.event_id = e.id
WHERE r.role_type = 'coordinator' 
AND r.status = 'registered';
```

---

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/registrations/:id/status` | PUT | Update status and permissions |
| `/api/registrations/event/:eventId` | GET | Get event registrations |
| `/api/events/:eventId` | GET | Get event details |

---

## 🎯 Permission Logic

```javascript
// Check if coordinator has permission
const hasPermission = (permission) => permissions.includes(permission);

// Show tab only if permission granted
{hasPermission('view_participants') && (
    <button>Participants</button>
)}

// Enable feature only if permission granted
{hasPermission('mark_attendance') && (
    <button onClick={markAttendance}>Mark Present</button>
)}
```

---

## 🔮 Future Enhancements

1. **Send Announcements** - Email/SMS to participants
2. **Generate Reports** - PDF/Excel export
3. **Manage Registrations** - Approve/reject participants
4. **Edit Event Details** - Full edit capability
5. **Permission Templates** - Pre-defined permission sets
6. **Permission History** - Track permission changes
7. **Bulk Actions** - Mark all present, export all, etc.

---

## ✅ Success Criteria

- ✅ Faculty can see coordinator request details
- ✅ Faculty can select multiple permissions
- ✅ Permissions saved to database as JSON array
- ✅ Coordinator dashboard shows only granted permissions
- ✅ Mark attendance works for coordinators
- ✅ View participants works for coordinators
- ✅ Tabs show/hide based on permissions
- ✅ No permissions = message displayed

---

**Status:** ✅ Implementation Complete  
**Version:** 3.0  
**Date:** 2024
