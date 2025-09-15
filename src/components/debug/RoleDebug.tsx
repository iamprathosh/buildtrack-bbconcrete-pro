import { useUser } from '@clerk/clerk-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function RoleDebug() {
  const { user } = useUser();
  const { profile, loading, error } = useUserProfile();

  const handleClearStorage = () => {
    localStorage.removeItem('pendingUserRole');
    console.log('Cleared pendingUserRole from localStorage');
  };

  const handleSetTestRole = (role: string) => {
    localStorage.setItem('pendingUserRole', role);
    console.log(`Set pendingUserRole to: ${role}`);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Role Debug Information</CardTitle>
        <CardDescription>
          Debug information for role assignment and profile sync
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Clerk User Info</h3>
            <div className="text-sm space-y-1">
              <p><strong>ID:</strong> {user?.id || 'Not loaded'}</p>
              <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress || 'Not available'}</p>
              <p><strong>Full Name:</strong> {user?.fullName || 'Not set'}</p>
              <p><strong>First Name:</strong> {user?.firstName || 'Not set'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">User Profile</h3>
            <div className="text-sm space-y-1">
              {loading && <p>Loading profile...</p>}
              {error && <p className="text-red-600">Error: {error}</p>}
              {profile && (
                <>
                  <p><strong>Role:</strong> <Badge>{profile.role}</Badge></p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Name:</strong> {profile.full_name}</p>
                  <p><strong>Active:</strong> {profile.is_active ? '✅' : '❌'}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">localStorage Debug</h3>
          <div className="text-sm">
            <p><strong>pendingUserRole:</strong> {localStorage.getItem('pendingUserRole') || 'Not set'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Clerk Metadata</h3>
          <div className="text-sm">
            <p><strong>Unsafe Metadata:</strong> {JSON.stringify(user?.unsafeMetadata || {}, null, 2)}</p>
            <p><strong>Private Metadata:</strong> {JSON.stringify(user?.privateMetadata || {}, null, 2)}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" onClick={handleClearStorage}>
            Clear localStorage
          </Button>
          <Button size="sm" onClick={() => handleSetTestRole('super_admin')}>
            Set Super Admin
          </Button>
          <Button size="sm" onClick={() => handleSetTestRole('project_manager')}>
            Set Manager
          </Button>
          <Button size="sm" onClick={() => handleSetTestRole('worker')}>
            Set Worker
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Open browser console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  );
}
