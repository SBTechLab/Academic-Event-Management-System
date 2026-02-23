# Fix Coordinator Permissions Issue

## Problem
Coordinator dashboard shows "No permissions granted yet" even after faculty approves with permissions.

## Root Cause
The `coordinator_permissions` column doesn't exist in the `registrations` table in your Supabase database.

## Solution

### Step 1: Run SQL Migration in Supabase

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add coordinator_permissions column
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS coordinator_permissions jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.registrations.coordinator_permissions IS 'Array of permissions granted to coordinator';
```

5. Click **Run** or press `Ctrl+Enter`
6. You should see: "Success. No rows returned"

### Step 2: Verify Column Was Added

Run this query to verify:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'registrations' 
AND column_name = 'coordinator_permissions';
```

You should see:
- column_name: `coordinator_permissions`
- data_type: `jsonb`
- column_default: `'[]'::jsonb`

### Step 3: Re-approve Coordinator Requests

After adding the column:

1. Go to Faculty Dashboard
2. Find pending coordinator requests (or reject and re-request)
3. Click "See Details"
4. Select permissions (checkboxes)
5. Click "Approve with Permissions"

### Step 4: Test Coordinator Dashboard

1. Login as the student who was approved as coordinator
2. Go to "My Events"
3. Click "Coordinator Dashboard" button
4. You should now see the granted permissions

## Expected Result

Coordinator Dashboard should show:
- ✅ Permissions list (e.g., "Mark Attendance", "View Participants")
- ✅ Tabs based on permissions granted
- ✅ Functional features based on permissions

## If Still Not Working

Check browser console (F12) for errors and verify:
1. The SQL migration ran successfully
2. Faculty selected permissions before approving
3. The coordinator status is "registered" (not "pending")
