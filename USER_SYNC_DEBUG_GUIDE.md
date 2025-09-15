# User Profile Sync Debug Guide

## Overview
This guide helps you debug and resolve user profile syncing issues between Clerk authentication and your Supabase database.

## What's Been Added

### 1. Enhanced Logging
- ✅ `useUserProfile` hook now has detailed console logging
- ✅ `syncUserProfile` utility has comprehensive error handling and logging
- ✅ All operations are tracked with emojis and detailed messages

### 2. Debug Tools
- ✅ `DebugUserSync` component for manual testing
- ✅ `DebugPage` for easy access to debug tools
- ✅ Additional utility functions for user management

### 3. Utility Functions
- ✅ `checkUserProfileExists()` - Check if profile exists
- ✅ `getAllUserProfiles()` - Get all user profiles
- ✅ `updateUserRole()` - Change user roles
- ✅ `toggleUserStatus()` - Activate/deactivate users
- ✅ `batchSyncUsers()` - Sync multiple users at once

## How to Debug

### Step 1: Add Debug Page (Temporary)
Add this route to your router for debugging:

```tsx
// In your router/App.tsx
import DebugPage from '@/pages/DebugPage';

// Add this route temporarily
<Route path="/debug-user-sync" element={<DebugPage />} />
```

### Step 2: Test Current User Sync
1. Navigate to `/debug-user-sync`
2. Open browser console (F12)
3. Click "Manual Sync" to force sync your current user
4. Watch console for detailed logging

### Step 3: Check Database
1. Go to your Supabase dashboard
2. Open the `user_profiles` table
3. Verify that users are being created/updated

### Step 4: Test Profile Check
1. Use "Check Profile" to verify profile existence
2. Use "Get All Profiles" to see all users in the database

## Common Issues & Solutions

### Issue: Users Not Appearing in Database
**Symptoms:** Clerk users exist but don't show up in Supabase `user_profiles` table

**Debug Steps:**
1. Check console for sync errors
2. Use "Manual Sync" button to force sync
3. Verify Supabase RLS policies allow inserts
4. Check if `user_profiles` table exists with correct schema

**Solution:** Run manual sync or check database permissions

### Issue: Profile Creation Fails
**Symptoms:** Error messages in console about insert failures

**Debug Steps:**
1. Check Supabase RLS policies
2. Verify table schema matches expected fields
3. Check if user already exists with different data

**Solution:** 
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Temporarily disable RLS for testing (re-enable after)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

### Issue: Role/Permission Issues
**Symptoms:** Database operation denied errors

**Solution:**
1. Check your Supabase service role key
2. Verify RLS policies allow your operations
3. Ensure your app is using the correct API key

## Database Schema Check
Ensure your `user_profiles` table has these columns:

```sql
CREATE TABLE user_profiles (
  id text PRIMARY KEY,
  email text,
  full_name text,
  role user_role DEFAULT 'worker',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

## Testing Checklist

- [ ] Navigate to debug page `/debug-user-sync`
- [ ] See current user info displayed correctly
- [ ] Click "Manual Sync" and check console
- [ ] Verify profile appears in Supabase dashboard
- [ ] Test "Check Profile" function
- [ ] Test role updates (promote to manager)
- [ ] Check that Users tab now shows the profile

## Automatic Sync Setup (Future)
For production, consider setting up:
1. **Clerk Webhooks** - Automatically sync when users sign up
2. **Background Jobs** - Periodically sync all users
3. **Real-time Sync** - Sync on every login

## Cleanup
After debugging, remove:
- Debug route from your router
- `DebugPage.tsx` and `DebugUserSync.tsx` files
- Or wrap them in `process.env.NODE_ENV === 'development'` checks

## Need Help?
If issues persist:
1. Check the browser console for detailed error messages
2. Verify your Supabase connection and permissions
3. Test database operations directly in Supabase dashboard
4. Check that all required environment variables are set
