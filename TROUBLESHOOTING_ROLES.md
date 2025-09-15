# 🔧 Role-Based Registration Troubleshooting

## ✅ Quick Fixes Applied

I've fixed the following issues:

1. **✅ Updated your admin accounts** - Both `guruprathosh@gmail.com` and `vovetab525@merumart.com` now have `super_admin` role
2. **✅ Improved role assignment logic** - Better localStorage handling to prevent race conditions  
3. **✅ Added debugging tools** - Debug page with role management tools

## 🧪 How to Test & Debug

### 1. Access Debug Page
Navigate to: **`/debug`** in your app

This page includes:
- **User Profile Debug Info** - Shows Clerk user data, profile sync status, role info
- **Role Management** - View and update user roles (super admin only)
- **localStorage Debug** - See what's stored in browser storage

### 2. Check Your Current Role
1. **Refresh your browser** or sign out and back in
2. You should now see the **Super Admin dashboard**
3. If still showing worker dashboard, check the debug page

### 3. Test New Registration
1. **Sign out** of your current account
2. **Click "Create Account"**
3. **Select "Super Admin"** role
4. **Enter password**: `admin123!`
5. **Complete registration** through Clerk
6. **Check debug page** to verify role assignment

## 🔍 Debugging Steps

### If Profile Sync is Failing:

1. **Open browser console** (F12)
2. **Look for logs** starting with 🔄, 📋, ➕, etc.
3. **Check for errors** in red

### If Role Assignment is Wrong:

1. **Go to `/debug` page**
2. **Check localStorage** section for `pendingUserRole`
3. **Use "Set Test Role" buttons** to test different roles
4. **Use User Role Manager** to manually fix user roles

### If Dashboard Shows Wrong Content:

1. **Hard refresh** the page (Ctrl+F5)
2. **Clear browser cache** and cookies
3. **Sign out and back in**
4. **Check role in debug page**

## 🛠️ Manual Fixes

### Update User Role via Database:
```sql
-- Update specific user by email
UPDATE user_profiles SET role = 'super_admin' WHERE email = 'your@email.com';

-- Update specific user by ID  
UPDATE user_profiles SET role = 'super_admin' WHERE id = 'your_clerk_user_id';
```

### Update User Role via Debug Page:
1. Go to `/debug`
2. Find user in **User Role Manager** section
3. Use dropdown to change role
4. Changes apply immediately

## 🚨 Common Issues & Solutions

### Issue: "Profile Sync Error"
**Solution**: 
- Check browser console for specific error
- Verify Supabase connection
- Check RLS policies are working

### Issue: Role shows as "worker" after registration
**Solution**:
- Check if `pendingUserRole` was set in localStorage during registration
- Verify registration password was correct
- Use debug page to manually set role

### Issue: Dashboard doesn't match user role
**Solution**:
- Hard refresh browser (Ctrl+F5)
- Clear cache and sign out/in
- Check useUserProfile hook is working correctly

### Issue: Can't access admin features
**Solution**:
- Verify role in database: `SELECT * FROM user_profiles WHERE email = 'your@email.com';`
- Update role if needed using debug page or SQL

## 📋 Current Status

### ✅ Working:
- Role validation during registration
- Password protection for elevated roles  
- Database role storage
- Manual role management via debug page

### ⚠️ To Monitor:
- localStorage timing issues during registration
- Profile sync race conditions
- Dashboard role-based rendering

## 🎯 Next Steps

1. **Test the current system** - Your admin accounts should work now
2. **Try new registrations** - Test worker/manager/admin flows
3. **Use debug tools** - Monitor role assignments  
4. **Report issues** - If anything still doesn't work, check debug page first

## 🔒 Security Notes

- Default passwords are for development only
- Change them in production: `VITE_MANAGER_REGISTRATION_PASSWORD` and `VITE_ADMIN_REGISTRATION_PASSWORD`
- Role changes in database take effect immediately
- Users may need to refresh browser to see UI changes

---

**Your admin accounts are now fixed! Try refreshing your browser - you should see the Super Admin dashboard.** 🚀
