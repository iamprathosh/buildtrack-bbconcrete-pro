import { DebugUserSync } from '@/components/DebugUserSync';
import { RoleDebug } from '@/components/debug/RoleDebug';
import { AuthTest } from '@/components/debug/AuthTest';
import { UserRoleManager } from '@/components/admin/UserRoleManager';

/**
 * Debug page for testing user profile syncing
 * Add this temporarily to your routes for debugging purposes
 * Remove from production builds
 */
export function DebugPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-8">
        <div className="flex justify-center">
          <DebugUserSync />
        </div>
        <AuthTest />
        <RoleDebug />
        <UserRoleManager />
      </div>
    </div>
  );
}

export default DebugPage;
