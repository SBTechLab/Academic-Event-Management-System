# 🔧 Troubleshooting: Role Type Not Showing Correctly

## 🐛 Problem
In "My Events" page, all registrations show as "Participant" instead of showing coordinator status correctly.

---

## ✅ Solution Steps

### Step 1: Verify Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Check if role_type column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'registrations' 
AND column_name = 'role_type';
```

**Expected Result:** Should show role_type column with text data type

**If column doesn't exist, run:**
```sql
ALTER TABLE public.registrations 
ADD COLUMN role_type text CHECK (role_type IN ('participant', 'coordinator')) DEFAULT 'participant';
```

---

### Step 2: Check Existing Data

```sql
-- View recent registrations
SELECT 
    id,
    student_id,
    event_id,
    status,
    role_type,
    created_at
FROM public.registrations
ORDER BY created_at DESC
LIMIT 10;
```

**What to look for:**
- ✅ role_type column should exist
- ✅ Values should be 'participant' or 'coordinator'
- ❌ If all NULL → Need to update existing records

**If role_type is NULL for all records:**
```sql
UPDATE public.registrations 
SET role_type = 'participant' 
WHERE role_type IS NULL;
```

---

### Step 3: Test New Registration

1. **Login as student**
2. **Register for an event as coordinator**
3. **Check database immediately:**

```sql
-- Check the latest registration
SELECT 
    id,
    student_id,
    event_id,
    status,
    role_type,
    created_at
FROM public.registrations
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- status: 'pending'
- role_type: 'coordinator'

**If role_type is NULL:**
- Problem is in the backend registration code
- Check registrationController.js

---

### Step 4: Check Backend Logs

**In your terminal running the backend:**

Look for this log when fetching registrations:
```
Registrations fetched: [array of registrations]
```

**Check if role_type is in the data:**
```json
{
  "id": "...",
  "student_id": "...",
  "event_id": "...",
  "status": "pending",
  "role_type": "coordinator",  // ← Should be here
  "created_at": "..."
}
```

---

### Step 5: Check Frontend Console

**Open browser console (F12) on My Events page**

Look for:
```
My Registrations Data: [array]
```

**Check each registration object:**
```javascript
{
  id: "...",
  status: "pending",
  role_type: "coordinator",  // ← Should be here
  event: { title: "...", ... }
}
```

**If role_type is missing:**
- Backend is not returning it
- Check Supabase query in registrationController.js

---

## 🔍 Common Issues & Fixes

### Issue 1: Column Doesn't Exist

**Symptom:** Database error when registering

**Fix:**
```sql
ALTER TABLE public.registrations 
ADD COLUMN role_type text CHECK (role_type IN ('participant', 'coordinator')) DEFAULT 'participant';
```

---

### Issue 2: Old Registrations Have NULL role_type

**Symptom:** Old registrations show as participant, new ones work

**Fix:**
```sql
UPDATE public.registrations 
SET role_type = 'participant' 
WHERE role_type IS NULL;
```

---

### Issue 3: Backend Not Saving role_type

**Symptom:** New registrations still have NULL role_type

**Check:** `registrationController.js` line ~23:
```javascript
const { data, error } = await supabase
    .from('registrations')
    .insert([{ 
        event_id, 
        student_id, 
        status,
        role_type  // ← Must be here
    }])
```

**If missing, add it:**
```javascript
.insert([{ 
    event_id, 
    student_id, 
    status: role_type === 'coordinator' ? 'pending' : 'registered',
    role_type  // Add this line
}])
```

---

### Issue 4: Frontend Not Sending role_type

**Symptom:** Backend receives undefined role_type

**Check:** `EventDetails.jsx` confirmRegistration function:
```javascript
const response = await fetch('http://localhost:5001/api/registrations', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
        event_id: id, 
        role_type: selectedRole  // ← Must be here
    })
});
```

---

### Issue 5: Supabase RLS Policies

**Symptom:** Column exists but not returned in queries

**Check RLS policies:**
```sql
-- View RLS policies for registrations
SELECT * FROM pg_policies WHERE tablename = 'registrations';
```

**If policies are blocking role_type, update them:**
```sql
-- Allow authenticated users to read all columns
CREATE POLICY "Users can view registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (true);
```

---

## 🧪 Quick Test Script

Run this in Supabase SQL Editor to test everything:

```sql
-- 1. Check schema
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'registrations' AND column_name IN ('role_type', 'rejection_reason');

-- 2. Check data
SELECT id, status, role_type, created_at 
FROM registrations 
ORDER BY created_at DESC LIMIT 5;

-- 3. Check coordinator requests
SELECT COUNT(*) as coordinator_count 
FROM registrations 
WHERE role_type = 'coordinator';

-- 4. Check pending coordinator requests
SELECT COUNT(*) as pending_coordinator_count 
FROM registrations 
WHERE role_type = 'coordinator' AND status = 'pending';
```

**Expected Results:**
1. Both columns should exist
2. Should see role_type values
3. Should have some coordinator registrations
4. Should have pending coordinator requests

---

## 📝 Verification Checklist

After fixing, verify:

- [ ] Database has role_type column
- [ ] New registrations save role_type correctly
- [ ] Backend logs show role_type in data
- [ ] Frontend console shows role_type in data
- [ ] My Events page displays correct badges
- [ ] Coordinator shows purple badge
- [ ] Participant shows blue badge
- [ ] Pending status shows yellow badge
- [ ] Approved coordinator shows "Coordinator Dashboard" button

---

## 🆘 Still Not Working?

1. **Clear browser cache and reload**
2. **Restart backend server**
3. **Check all SQL migrations were run**
4. **Verify you're testing with NEW registrations** (old ones might have NULL)
5. **Check browser console for errors**
6. **Check backend terminal for errors**

---

## 📞 Debug Commands

**Backend (Node.js):**
```javascript
// Add to registrationController.js
console.log('Registration data:', { event_id, student_id, status, role_type });
```

**Frontend (React):**
```javascript
// Add to MyEvents.jsx
console.log('Registration:', reg);
console.log('Role Type:', reg.role_type);
```

**Database:**
```sql
-- Check specific student's registrations
SELECT * FROM registrations WHERE student_id = 'YOUR_STUDENT_ID';
```

---

**Last Updated:** 2024  
**Status:** Troubleshooting Guide
