# 🔧 Debug: Permissions Not Showing

## 🐛 Problem
Coordinator dashboard shows "No permissions granted yet" even after approval.

---

## ✅ Quick Checks

### 1. Check Browser Console (F12)
Look for these debug logs:
```
All registrations: [...]
My registrations: [...]
My coordinator registration: {...}
Permissions found: [...]
```

### 2. Verify Database
```sql
-- Check if permissions were saved
SELECT 
    id,
    student_id,
    event_id,
    status,
    role_type,
    coordinator_permissions
FROM registrations
WHERE role_type = 'coordinator' 
AND status = 'registered'
ORDER BY id DESC
LIMIT 5;
```

**Expected:** `coordinator_permissions` should be a JSON array like:
```json
["mark_attendance", "view_participants"]
```

**If NULL or empty:** Faculty didn't select permissions when approving

---

## 🔍 Common Issues

### Issue 1: Permissions Column Doesn't Exist

**Check:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'registrations' 
AND column_name = 'coordinator_permissions';
```

**Fix:**
```sql
ALTER TABLE public.registrations 
ADD COLUMN coordinator_permissions jsonb DEFAULT '[]'::jsonb;
```

---

### Issue 2: Faculty Approved Without Selecting Permissions

**Symptom:** Database shows `[]` or `null` for coordinator_permissions

**Solution:** 
1. Faculty must reject and re-approve
2. This time, select at least 1 permission checkbox
3. Click "Approve with Permissions"

---

### Issue 3: Wrong Event ID

**Check console logs:**
```
My coordinator registration: undefined
```

**Verify:** URL should be `/coordinator/event/CORRECT_EVENT_ID`

---

### Issue 4: Not Registered as Coordinator

**Check:**
```sql
SELECT * FROM registrations 
WHERE student_id = 'YOUR_USER_ID' 
AND event_id = 'EVENT_ID';
```

**Expected:**
- role_type: 'coordinator'
- status: 'registered'

---

## 🧪 Test Steps

### 1. Fresh Approval Test:
1. **Student:** Apply as coordinator for NEW event
2. **Faculty:** 
   - Click "See Details"
   - Select 2-3 permissions
   - Click "Approve with Permissions"
3. **Check Database:**
   ```sql
   SELECT coordinator_permissions 
   FROM registrations 
   WHERE id = LAST_REGISTRATION_ID;
   ```
4. **Student:** 
   - Go to My Events
   - Click "Coordinator Dashboard"
   - Check browser console for logs
   - Verify permissions show

### 2. Re-Approve Existing:
If coordinator already approved without permissions:
1. **Faculty:** Find registration in database
2. **Run SQL:**
   ```sql
   UPDATE registrations 
   SET coordinator_permissions = '["mark_attendance", "view_participants"]'::jsonb
   WHERE id = REGISTRATION_ID;
   ```
3. **Student:** Refresh coordinator dashboard

---

## 📊 Debug Queries

### Check Specific Student:
```sql
SELECT 
    r.id,
    r.status,
    r.role_type,
    r.coordinator_permissions,
    u.full_name,
    e.title
FROM registrations r
JOIN users u ON r.student_id = u.id
JOIN events e ON r.event_id = e.id
WHERE u.email = 'student@example.com'
AND r.role_type = 'coordinator';
```

### Check Specific Event:
```sql
SELECT 
    r.id,
    r.status,
    r.role_type,
    r.coordinator_permissions,
    u.full_name
FROM registrations r
JOIN users u ON r.student_id = u.id
WHERE r.event_id = 'EVENT_ID'
AND r.role_type = 'coordinator';
```

---

## 🔧 Manual Fix

If you need to manually add permissions:

```sql
-- Update specific registration
UPDATE registrations 
SET coordinator_permissions = '["mark_attendance", "view_participants", "manage_event_details"]'::jsonb
WHERE id = 'REGISTRATION_ID';

-- Or update by student and event
UPDATE registrations 
SET coordinator_permissions = '["mark_attendance", "view_participants"]'::jsonb
WHERE student_id = 'STUDENT_ID' 
AND event_id = 'EVENT_ID'
AND role_type = 'coordinator';
```

---

## ✅ Verification Checklist

After fixing:
- [ ] Database shows permissions array
- [ ] Browser console shows "Permissions found: [...]"
- [ ] Dashboard shows permission badges
- [ ] Tabs appear based on permissions
- [ ] Can mark attendance (if permission granted)
- [ ] Can view participants (if permission granted)

---

**Most Common Cause:** Faculty approved without selecting any permissions. Solution: Re-approve with permissions selected.
