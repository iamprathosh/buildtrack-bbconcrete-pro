import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  syncUserProfile, 
  checkUserProfileExists, 
  getAllUserProfiles,
  updateUserRole,
  toggleUserStatus 
} from '@/utils/syncUserProfile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { AlertCircle, CheckCircle, RefreshCw, User, Users, Database } from 'lucide-react';

/**
 * Debug component for testing and troubleshooting user profile syncing
 * Only use this in development - remove from production builds
 */
export function DebugUserSync() {
  const { user } = useUser();
  const { profile, loading, error, refetch } = useUserProfile();
  const { supabase } = useSupabaseClient();
  const [debugResults, setDebugResults] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  const runDebugTest = async (testName: string, testFn: () => Promise<any>) => {
    try {
      setDebugLoading(true);
      console.log(`🧪 Running debug test: ${testName}`);
      const result = await testFn();
      setDebugResults({ type: 'success', testName, result });
      console.log(`✅ Debug test completed: ${testName}`, result);
    } catch (error) {
      console.error(`❌ Debug test failed: ${testName}`, error);
      setDebugResults({ type: 'error', testName, error });
    } finally {
      setDebugLoading(false);
    }
  };

  const handleManualSync = () => {
    if (!user) return;
    runDebugTest('Manual User Sync', () => syncUserProfile({
      id: user.id,
      emailAddresses: user.emailAddresses,
      fullName: user.fullName,
      firstName: user.firstName
    }, supabase));
  };

  const handleCheckProfile = () => {
    if (!user) return;
    runDebugTest('Check Profile Exists', () => checkUserProfileExists(user.id, supabase));
  };

  const handleGetAllProfiles = () => {
    runDebugTest('Get All Profiles', () => getAllUserProfiles(supabase));
  };

  const handlePromoteToManager = () => {
    if (!user) return;
    runDebugTest('Promote to Manager', () => updateUserRole(user.id, 'manager', supabase));
  };

  const handleToggleStatus = () => {
    if (!user || !profile) return;
    runDebugTest('Toggle Status', () => toggleUserStatus(user.id, !profile.is_active, supabase));
  };

  if (!user) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Debug User Sync
          </CardTitle>
          <CardDescription>
            User profile syncing debug tools (Development only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No authenticated user found. Please sign in to use debug tools.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Debug User Sync
          </CardTitle>
          <CardDescription>
            User profile syncing debug tools (Development only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Clerk User Info</h4>
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
                <p><strong>Full Name:</strong> {user.fullName || 'N/A'}</p>
                <p><strong>First Name:</strong> {user.firstName || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Supabase Profile Info</h4>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : error ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : profile ? (
                <div className="text-sm space-y-1">
                  <p><strong>ID:</strong> {profile.id}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Name:</strong> {profile.full_name}</p>
                  <p><strong>Role:</strong> <Badge variant="outline">{profile.role}</Badge></p>
                  <p><strong>Active:</strong> <Badge variant={profile.is_active ? "default" : "secondary"}>{profile.is_active ? 'Yes' : 'No'}</Badge></p>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No profile found in Supabase</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Debug Actions */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Debug Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleManualSync}
                disabled={debugLoading}
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Manual Sync
              </Button>
              
              <Button
                onClick={handleCheckProfile}
                disabled={debugLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Check Profile
              </Button>
              
              <Button
                onClick={handleGetAllProfiles}
                disabled={debugLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Get All Profiles
              </Button>
              
              {profile && (
                <>
                  <Button
                    onClick={handlePromoteToManager}
                    disabled={debugLoading || profile.role === 'manager'}
                    variant="outline"
                    size="sm"
                  >
                    Promote to Manager
                  </Button>
                  
                  <Button
                    onClick={handleToggleStatus}
                    disabled={debugLoading}
                    variant="outline"
                    size="sm"
                  >
                    Toggle Status ({profile.is_active ? 'Deactivate' : 'Activate'})
                  </Button>
                </>
              )}
              
              <Button
                onClick={() => refetch()}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Profile
              </Button>
            </div>
          </div>

          {/* Debug Results */}
          {debugResults && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Debug Results</h4>
              <Alert className={debugResults.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {debugResults.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <strong>{debugResults.testName}:</strong>{' '}
                  {debugResults.type === 'success' ? 'Success' : 'Error'}
                  <pre className="mt-2 text-xs bg-white/50 p-2 rounded border overflow-auto max-h-40">
                    {JSON.stringify(
                      debugResults.type === 'success' ? debugResults.result : debugResults.error,
                      null,
                      2
                    )}
                  </pre>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Instructions */}
          <div className="border-t pt-4 text-sm text-muted-foreground">
            <h4 className="font-semibold mb-2">Instructions:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use <strong>Manual Sync</strong> to force sync the current user</li>
              <li>Use <strong>Check Profile</strong> to verify if a profile exists in Supabase</li>
              <li>Use <strong>Get All Profiles</strong> to see all users in the database</li>
              <li>Monitor the browser console for detailed logging</li>
              <li>Check Supabase dashboard to verify database changes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
