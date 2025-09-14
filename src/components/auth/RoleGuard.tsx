import { ReactNode } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Database } from "@/integrations/supabase/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

type UserRole = Database['public']['Enums']['user_role'];

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  showError?: boolean;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null, 
  showError = false 
}: RoleGuardProps) {
  const { profile, loading, error, hasAnyRole } = useUserProfile();

  if (loading) {
    return <Skeleton className="h-8 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to verify permissions: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!profile || !hasAnyRole(allowedRoles)) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this feature.
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenient role-specific guards
export function AdminOnlyGuard({ children, fallback, showError }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['super_admin']} fallback={fallback} showError={showError}>
      {children}
    </RoleGuard>
  );
}

export function AdminManagerGuard({ children, fallback, showError }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['super_admin', 'project_manager']} fallback={fallback} showError={showError}>
      {children}
    </RoleGuard>
  );
}

export function WorkerGuard({ children, fallback, showError }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['worker']} fallback={fallback} showError={showError}>
      {children}
    </RoleGuard>
  );
}