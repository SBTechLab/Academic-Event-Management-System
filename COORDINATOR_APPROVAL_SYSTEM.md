# 🎯 Event-Based Coordinator Approval System

## 📋 Overview
Updated the Academic Event Management System to implement a faculty-approved coordinator system where:
- Students apply as coordinator for specific events
- Requests go to the faculty who created that event
- Faculty can approve/reject with reasons
- Students can view all their events and access coordinator dashboards

---

## ✨ Key Features

### 1. **Coordinator Request Flow**
- Student registers for event and selects "Event Coordinator" role
- Request status set to "pending" automatically
- Faculty receives notification in their dashboard
- Faculty reviews student information and approves/rejects
- Student sees status in "My Events" page

### 2. **Faculty Approval System**
- Faculty dashboard shows pending coordinator requests
- Displays student name, email, and event details
- Approve button: Changes status to "registered" (coordinator approved)
- Reject button: Opens modal to enter rejection reason
- Professional rejection modal with required reason field

### 3. **My Events Page for Students**
- Shows all registered events (participant + coordinator)
- Displays registration status with color-coded badges
- Shows rejection reasons if applicable
- "Coordinator Dashboard" button for approved coordinators
- "View Event" button for all registrations

---

## 🔄 Complete User Flow

### For Students:
1. Browse events on dashboard
2. Click "View Details & Register"
3. Choose role: Participant or Coordinator
4. If Coordinator selected:
   - Status set to "pending"
   - Message: "Coordinator request submitted! Waiting for faculty approval."
5. Check status in "My Events" page
6. If approved: Access "Coordinator Dashboard" button appears
7. If rejected: See rejection reason

### For Faculty:
1. Create event
2. View "Pending Coordinator Requests" in dashboard
3. See student details and event name
4. Click "Approve" → Student becomes coordinator
5. Click "Reject" → Modal opens
6. Enter rejection reason → Submit
7. Student notified with reason

---

## 📁 Files Modified

### Frontend:
1. **`StudentDashboard.jsx`**
   - Added "View My Events" link

2. **`MyEvents.jsx`** (NEW)
   - Displays all student registrations
   - Shows status badges
   - Coordinator dashboard access button
   - Rejection reason display

3. **`FacultyDashboard.jsx`**
   - Fetches coordinator requests from registrations table
   - Filters by faculty's events
   - Professional rejection modal
   - Approval/rejection handlers

4. **`EventDetails.jsx`**
   - Updated to show coordinator pending message
   - Stores registration data for status checking

5. **`router.jsx`**
   - Added `/my-events` route

### Backend:
1. **`registrationController.js`**
   - `registerForEvent`: Sets status to "pending" for coordinators
   - `updateRegistrationStatus`: Handles rejection_reason field

---

## 🗄️ Database Changes

### SQL Migration Required:
```sql
-- Run this SQL in Supabase:

-- Add rejection_reason column
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update status constraint
ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS registrations_status_check;

ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('registered', 'pending', 'rejected', 'attended', 'cancelled'));
```

### Existing Columns Used:
- `role_type`: 'participant' or 'coordinator'
- `status`: 'registered', 'pending', 'rejected', 'attended', 'cancelled'
- `rejection_reason`: Text field for rejection explanation

---

## 🎨 UI Components

### Status Badges:
- 🟢 **Confirmed** (registered) - Green
- 🟡 **Pending Approval** (pending) - Yellow
- 🔴 **Rejected** (rejected) - Red

### Role Badges:
- 🔵 **Participant** - Blue
- 🟣 **Coordinator** - Purple

### Buttons:
- **View Event** - Blue (all registrations)
- **Coordinator Dashboard** - Purple (approved coordinators only)

---

## 🔐 Access Control

### Student Access:
- Can apply as coordinator for any event
- Can view all their registrations
- Can access coordinator dashboard only if approved

### Faculty Access:
- Can see coordinator requests for their events only
- Can approve/reject requests
- Must provide reason for rejection

### Admin Access:
- Can see all registrations in event details
- Can view role types and statuses

---

## 📊 Registration Status Flow

```
Student Applies as Coordinator
         ↓
    Status: PENDING
         ↓
    Faculty Reviews
         ↓
    ┌─────────┴─────────┐
    ↓                   ↓
APPROVE              REJECT
    ↓                   ↓
Status:            Status:
REGISTERED         REJECTED
    ↓                   ↓
Coordinator        Reason Shown
Dashboard          to Student
Unlocked
```

---

## 🚀 API Endpoints Used

### Student:
- `GET /api/registrations/my-registrations` - Get all registrations
- `POST /api/registrations` - Register for event with role_type
- `GET /api/registrations/check/:eventId` - Check registration status

### Faculty:
- `GET /api/registrations` - Get all registrations (filtered by event)
- `PUT /api/registrations/:id` - Update status and rejection_reason

---

## ✅ Testing Checklist

- [ ] Student can apply as coordinator
- [ ] Request shows as "pending" in My Events
- [ ] Faculty sees request in dashboard
- [ ] Faculty can approve request
- [ ] Approved coordinator sees dashboard button
- [ ] Faculty can reject with reason
- [ ] Rejection reason displays to student
- [ ] Participant registration works normally
- [ ] My Events page shows all registrations
- [ ] Status badges display correctly
- [ ] Coordinator dashboard button only shows when approved

---

## 🔮 Future Enhancements

1. **Email Notifications**
   - Notify faculty of new coordinator requests
   - Notify students of approval/rejection

2. **Coordinator Limits**
   - Set maximum coordinators per event
   - Auto-reject if limit reached

3. **Coordinator Dashboard**
   - Manage event participants
   - Mark attendance
   - Send announcements

4. **Student Profile**
   - Show coordinator experience
   - Display coordinator badges
   - Event management history

---

## 📝 Important Notes

1. **Coordinator vs Participant:**
   - Participants: Auto-approved (status: 'registered')
   - Coordinators: Require faculty approval (status: 'pending')

2. **Rejection Reasons:**
   - Required field for faculty
   - Visible to students in My Events
   - Helps students understand decision

3. **Event-Specific:**
   - Coordinator role is per-event
   - Student can be coordinator for one event, participant for another
   - Faculty only sees requests for their events

---

**Status:** ✅ Implementation Complete  
**Version:** 2.0  
**Date:** 2024
