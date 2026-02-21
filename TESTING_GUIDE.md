# 🧪 Testing Guide: Coordinator Approval System

## 📋 Prerequisites

### Database Setup
Run this SQL in Supabase first:
```sql
-- Add rejection_reason column to registrations
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update status constraint
ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS registrations_status_check;

ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('registered', 'pending', 'rejected', 'attended', 'cancelled'));

-- Ensure role_type column exists
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS role_type text CHECK (role_type IN ('participant', 'coordinator')) DEFAULT 'participant';
```

---

## 🔍 Test Scenarios

### Test 1: Student Applies as Coordinator

**Steps:**
1. Login as a student
2. Go to Events page
3. Click on any approved event
4. Click "Register for Event"
5. Select "⭐ Event Coordinator" option
6. Click "Confirm Registration"

**Expected Result:**
- ✅ Message: "Coordinator request submitted! Waiting for faculty approval."
- ✅ Registration created with status: "pending"
- ✅ role_type: "coordinator"

---

### Test 2: Faculty Sees Coordinator Request

**Steps:**
1. Login as faculty (who created the event)
2. Go to Faculty Dashboard
3. Look for "Pending Coordinator Requests" section

**Expected Result:**
- ✅ Section shows pending coordinator requests
- ✅ Displays student name and email
- ✅ Shows event title
- ✅ Shows application date
- ✅ "Approve" and "Reject" buttons visible

**Debug if not showing:**
```javascript
// Check in browser console:
// 1. Network tab - look for API calls to /api/registrations/event/:id
// 2. Check response data
// 3. Verify user.id matches event.created_by
```

---

### Test 3: Faculty Approves Coordinator

**Steps:**
1. In Faculty Dashboard
2. Find a pending coordinator request
3. Click "Approve" button

**Expected Result:**
- ✅ Request disappears from pending list
- ✅ Registration status changed to "registered"
- ✅ Student can now access coordinator dashboard

---

### Test 4: Faculty Rejects Coordinator

**Steps:**
1. In Faculty Dashboard
2. Find a pending coordinator request
3. Click "Reject" button
4. Modal opens
5. Enter rejection reason (e.g., "Need more experience")
6. Click "Reject Request"

**Expected Result:**
- ✅ Professional modal appears
- ✅ Rejection reason is required
- ✅ Request disappears from pending list
- ✅ Registration status changed to "rejected"
- ✅ rejection_reason saved in database

---

### Test 5: Student Views My Events

**Steps:**
1. Login as student (who applied as coordinator)
2. Go to Student Dashboard
3. Click "View My Events →"

**Expected Result:**
- ✅ Shows all registered events
- ✅ Pending coordinator shows: "⏳ Pending Approval"
- ✅ Approved coordinator shows: "✓ Confirmed" + "Coordinator Dashboard" button
- ✅ Rejected coordinator shows: "✗ Rejected" + rejection reason

---

### Test 6: Approved Coordinator Access

**Steps:**
1. Student with approved coordinator status
2. Go to "My Events" page
3. Find event where they are coordinator
4. Click "Coordinator Dashboard" button

**Expected Result:**
- ✅ Button only visible for approved coordinators
- ✅ Redirects to coordinator dashboard for that event
- ✅ (Dashboard functionality to be implemented)

---

### Test 7: Participant Registration (Normal Flow)

**Steps:**
1. Login as student
2. Register for event
3. Select "👥 Participant" option
4. Confirm registration

**Expected Result:**
- ✅ Instant registration (no approval needed)
- ✅ Status: "registered"
- ✅ Shows as "✓ Confirmed" in My Events
- ✅ No "Coordinator Dashboard" button

---

## 🐛 Common Issues & Solutions

### Issue 1: Coordinator Requests Not Showing in Faculty Dashboard

**Possible Causes:**
1. Event not created by logged-in faculty
2. No pending coordinator requests
3. API endpoint issue

**Solution:**
```javascript
// Check in FacultyDashboard.jsx console:
console.log('Faculty Events:', myEvents);
console.log('Pending Requests:', pendingRequests);

// Verify:
// - myEvents contains events created by faculty
// - API call to /api/registrations/event/:id returns data
// - Registrations have role_type='coordinator' and status='pending'
```

---

### Issue 2: Rejection Reason Not Saving

**Check:**
1. Database has rejection_reason column
2. API endpoint is `/api/registrations/:id/status`
3. Request body includes rejection_reason

**Verify in Network Tab:**
```json
{
  "status": "rejected",
  "rejection_reason": "Your reason here"
}
```

---

### Issue 3: Coordinator Dashboard Button Not Showing

**Requirements:**
- role_type = 'coordinator'
- status = 'registered' (approved)

**Check in MyEvents.jsx:**
```javascript
{reg.role_type === 'coordinator' && reg.status === 'registered' && (
    <Link to={`/coordinator/event/${reg.event_id}`}>
        Coordinator Dashboard
    </Link>
)}
```

---

## 📊 Database Verification Queries

### Check Registrations:
```sql
SELECT 
    r.id,
    r.status,
    r.role_type,
    r.rejection_reason,
    u.full_name as student_name,
    e.title as event_title,
    e.created_by as faculty_id
FROM registrations r
JOIN users u ON r.student_id = u.id
JOIN events e ON r.event_id = e.id
WHERE r.role_type = 'coordinator'
ORDER BY r.created_at DESC;
```

### Check Pending Coordinator Requests:
```sql
SELECT 
    r.*,
    u.full_name,
    u.email,
    e.title as event_title
FROM registrations r
JOIN users u ON r.student_id = u.id
JOIN events e ON r.event_id = e.id
WHERE r.role_type = 'coordinator' 
AND r.status = 'pending';
```

---

## ✅ Success Criteria

All tests pass when:
- ✅ Students can apply as coordinator
- ✅ Faculty sees requests for their events only
- ✅ Faculty can approve requests
- ✅ Faculty can reject with reason
- ✅ Students see status in My Events
- ✅ Rejection reasons display correctly
- ✅ Coordinator dashboard button appears when approved
- ✅ Participant registration works normally

---

## 🔧 API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/registrations` | POST | Register for event |
| `/api/registrations/my-registrations` | GET | Get student's registrations |
| `/api/registrations/event/:eventId` | GET | Get event registrations (faculty) |
| `/api/registrations/:id/status` | PUT | Update registration status |
| `/api/registrations/check/:eventId` | GET | Check if registered |

---

**Last Updated:** 2024  
**Status:** Ready for Testing
