# Role-Based Registration System

This document explains how the role-based registration system works in BuildTrack BB Concrete Pro.

## Overview

The system implements a secure role-based registration process where:

- **Workers** can register freely without any additional password
- **Project Managers** and **Super Admins** require a special registration password

## Available Roles

The system supports three user roles:

| Role | Database Value | Description | Registration Password Required |
|------|----------------|-------------|--------------------------------|
| Worker | `worker` | Access to daily operations, inventory, and assigned projects | ❌ No |
| Project Manager | `project_manager` | Manage projects, approve requisitions, and oversee workers | ✅ Yes |
| Super Admin | `super_admin` | Full system access and administrative controls | ✅ Yes |

## How It Works

### 1. Registration Flow

1. **User clicks "Create Account"** on the login screen
2. **Role Selection**: User selects their desired role
   - Workers can proceed directly
   - Managers/Admins must enter a registration password
3. **Password Validation**: For elevated roles, the system validates the registration password
4. **Account Details**: User enters personal information (name, email, password)
5. **Email Verification**: User verifies their email address
6. **Profile Creation**: System creates user profile with the validated role

### 2. Technical Implementation

#### Client-Side Components

- **`RoleBasedRegistration.tsx`**: Main registration component with multi-step flow
- **`registrationPasswords.ts`**: Configuration file with role validation logic
- **`useUserProfile.tsx`**: Updated to handle role assignment from Clerk metadata

#### Role Assignment Process

1. During registration, the selected role is stored in Clerk's `unsafeMetadata`
2. After email verification, the role is available to the user profile sync process
3. `useUserProfile` hook reads the role from Clerk metadata and creates the Supabase user profile
4. The role is permanently stored in the `user_profiles` table

## Configuration

### Environment Variables

Set these variables in your `.env` file:

```bash
# Registration passwords for elevated roles
VITE_MANAGER_REGISTRATION_PASSWORD=your_secure_manager_password
VITE_ADMIN_REGISTRATION_PASSWORD=your_secure_admin_password
```

### Default Passwords (Development Only)

For development and testing, the following default passwords are configured:

- **Project Manager**: `manager123!`
- **Super Admin**: `admin123!`

> ⚠️ **Security Warning**: Change these passwords in production! Use strong, unique passwords.

## Admin Management

### Registration Password Management

Super Admins can view current registration passwords through the admin interface:

```typescript
import { RegistrationPasswordManager } from '@/components/admin/RegistrationPasswordManager';
```

This component provides:
- View current registration passwords
- Copy passwords to clipboard
- Security notes and instructions

### Updating Registration Passwords

To update registration passwords:

1. Update your `.env` file with new passwords:
   ```bash
   VITE_MANAGER_REGISTRATION_PASSWORD=new_secure_password
   VITE_ADMIN_REGISTRATION_PASSWORD=new_secure_admin_password
   ```

2. Restart your application
3. Inform authorized users of the new passwords

## Security Features

### Password Validation
- Registration passwords are validated client-side before account creation
- Invalid passwords prevent account creation
- Passwords are not stored in the database

### Role Protection
- Only validated users can obtain elevated roles
- Role assignment happens during the Clerk registration process
- User profiles are created with the validated role in Supabase

### Access Control
- Registration password management is restricted to Super Admins
- RLS policies protect all database operations based on user roles

## Usage Examples

### For Workers
1. Click "Create Account"
2. Select "Worker" role
3. Fill in account details
4. Verify email
5. Access granted immediately

### For Managers/Admins
1. Click "Create Account"
2. Select "Project Manager" or "Super Admin" role
3. Enter the registration password (obtain from admin)
4. Fill in account details
5. Verify email
6. Access granted with elevated permissions

## Troubleshooting

### Common Issues

1. **"Invalid registration password"**
   - Verify the correct password from your admin
   - Check for typos or extra spaces
   - Ensure the environment variables are set correctly

2. **"Only super admins can view registration passwords"**
   - Only users with `super_admin` role can access password management
   - Contact your system administrator

3. **User created with wrong role**
   - Check that environment variables are set correctly
   - Verify the registration password validation logic
   - Ensure Clerk metadata is being read properly

### Debugging

Enable console logging in the registration process:
- Check browser developer tools for registration flow logs
- Verify Clerk metadata is being set correctly
- Monitor user profile creation in Supabase

## Best Practices

1. **Password Security**
   - Use strong, unique registration passwords
   - Rotate passwords periodically
   - Share passwords securely (not via email/chat)

2. **User Management**
   - Regularly review user roles and permissions
   - Deactivate accounts for users who leave the organization
   - Monitor registration attempts for unusual activity

3. **Environment Management**
   - Never commit `.env` files to version control
   - Use different passwords for different environments
   - Secure environment variable storage in production

## Implementation Notes

- Uses Clerk for authentication and metadata storage
- Role validation happens entirely client-side
- No server endpoints required for role assignment
- Integrates seamlessly with existing Supabase RLS policies
- Compatible with existing user profile sync system

## Future Enhancements

Potential improvements for future versions:

1. **Database-Stored Passwords**: Move registration passwords to encrypted database storage
2. **Time-Limited Tokens**: Generate temporary registration codes
3. **Invitation System**: Admin-generated invitation links for elevated roles
4. **Audit Logging**: Track registration attempts and role assignments
5. **Self-Service Password Reset**: Allow admins to reset registration passwords through UI
