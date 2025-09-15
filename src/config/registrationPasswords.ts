// Registration passwords for elevated roles
// In production, these should be environment variables or fetched from a secure API
export const REGISTRATION_PASSWORDS = {
  project_manager: import.meta.env.VITE_MANAGER_REGISTRATION_PASSWORD || 'manager123!',
  super_admin: import.meta.env.VITE_ADMIN_REGISTRATION_PASSWORD || 'admin123!'
} as const;

export type UserRole = 'worker' | 'project_manager' | 'super_admin';

export const ROLE_LABELS = {
  worker: 'Worker',
  project_manager: 'Project Manager', 
  super_admin: 'Super Admin'
} as const;

export const ROLE_DESCRIPTIONS = {
  worker: 'Access to daily operations, inventory, and assigned projects',
  project_manager: 'Manage projects, approve requisitions, and oversee workers',
  super_admin: 'Full system access and administrative controls'
} as const;

// Validate if a role requires a registration password
export function requiresRegistrationPassword(role: UserRole): boolean {
  return role === 'project_manager' || role === 'super_admin';
}

// Validate registration password for a role
export function validateRegistrationPassword(role: UserRole, password: string): boolean {
  if (!requiresRegistrationPassword(role)) {
    return true; // Workers don't need a password
  }
  
  return REGISTRATION_PASSWORDS[role as keyof typeof REGISTRATION_PASSWORDS] === password;
}
