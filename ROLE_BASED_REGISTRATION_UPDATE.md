# 🎯 Role-Based Event Registration System

## 📋 Overview
Updated the Academic Event Management System to allow students to apply as either **Participant** or **Event Coordinator** for each individual event, removing the general coordinator request system.

---

## ✨ Key Changes

### 1. **Student Dashboard** (`StudentDashboard.jsx`)
- ✅ Removed general "Become a Coordinator" section
- ✅ Students now apply for roles per event
- ✅ Cleaner dashboard focused on event browsing

### 2. **Event Details Page** (`EventDetails.jsx`)
- ✅ Added professional **Role Selection Modal**
- ✅ Students choose between:
  - 👥 **Participant** - Attend and participate in the event
  - ⭐ **Event Coordinator** - Help organize and manage the event
- ✅ Modal shows when clicking "Register for Event"
- ✅ Beautiful UI with radio buttons and descriptions
- ✅ Admin view shows participant roles with badges

### 3. **Backend Controller** (`registrationController.js`)
- ✅ Updated `registerForEvent` to accept `role_type` parameter
- ✅ Defaults to 'participant' if not specified
- ✅ Stores role in database with registration

### 4. **Database**
- ✅ SQL migration file already exists: `add_role_type_to_registrations.sql`
- ✅ Adds `role_type` column with CHECK constraint
- ✅ Values: 'participant' or 'coordinator'

---

## 🔄 User Flow

### For Students:
1. Browse events on dashboard
2. Click "View Details & Register" on any event
3. Click "Register for Event" button
4. **Role Selection Modal appears**
5. Choose role: Participant or Coordinator
6. Click "Confirm Registration"
7. Success message shows with selected role

### For Admin/Faculty:
1. View event details
2. See all registrations with role badges
3. Coordinators shown with purple badge
4. Participants shown with blue badge

---

## 🎨 UI Features

### Role Selection Modal:
- Clean, modern design
- Radio button selection
- Visual feedback (border color changes)
- Icons for each role (👥 and ⭐)
- Clear descriptions
- Cancel and Confirm buttons
- Smooth fade-in animation

### Registration Display:
- Color-coded badges:
  - 🟣 Purple for Coordinators
  - 🔵 Blue for Participants
- Shows in admin event details view

---

## 📝 Database Setup

Run the SQL migration if not already done:

```sql
-- Add role_type column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN role_type text CHECK (role_type IN ('participant', 'coordinator')) DEFAULT 'participant';

-- Update existing registrations to have participant role
UPDATE public.registrations 
SET role_type = 'participant' 
WHERE role_type IS NULL;
```

---

## 🚀 Benefits

1. **Flexibility** - Students can choose different roles for different events
2. **Transparency** - Clear role identification in admin view
3. **Better Organization** - Event-specific coordinators
4. **User Experience** - Professional modal interface
5. **Scalability** - Easy to add more roles in future

---

## 🔮 Future Enhancements

- Add coordinator approval workflow
- Limit number of coordinators per event
- Show coordinator responsibilities
- Coordinator-specific dashboard features
- Coordinator badges on student profiles

---

## ✅ Testing Checklist

- [ ] Student can register as participant
- [ ] Student can register as coordinator
- [ ] Modal shows and closes properly
- [ ] Registration saves with correct role_type
- [ ] Admin sees role badges in event details
- [ ] Cannot register twice for same event
- [ ] Error messages display correctly

---

**Status:** ✅ Implementation Complete
**Date:** 2024
