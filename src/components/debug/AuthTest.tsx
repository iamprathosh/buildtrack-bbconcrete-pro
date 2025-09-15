import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AuthTest() {
  const { user } = useUser();
  const { supabase, isAuthenticated, isLoading } = useSupabaseClient();
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    if (!user || !supabase) return;
    
    setTesting(true);
    const results: any = {};
    
    try {
      // Test 1: Check auth context
      results.authContext = await supabase.rpc('current_user_id');
      
      // Test 2: Try to query projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, status')
        .limit(3);
        
      results.projects = { data: projects, error: projectsError };
      
      // Test 3: Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      results.profile = { data: profile, error: profileError };
      
      // Test 4: Test stats query
      const { count: projectCount, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .in('status', ['planning', 'active']);
        
      results.stats = { count: projectCount, error: countError };
      
    } catch (error) {
      results.error = error;
    }
    
    setTestResults(results);
    setTesting(false);
  };

  useEffect(() => {
    if (isAuthenticated && !testing && !testResults) {
      runTests();
    }
  }, [isAuthenticated, user]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Authentication Integration Test</CardTitle>
        <CardDescription>
          Testing Clerk-Supabase integration and data access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            <div className="space-y-1">
              <p><strong>Clerk User:</strong> {user?.id ? <Badge variant="outline">✅ Authenticated</Badge> : <Badge variant="secondary">❌ Not authenticated</Badge>}</p>
              <p><strong>Supabase Client:</strong> {supabase ? <Badge variant="outline">✅ Available</Badge> : <Badge variant="secondary">❌ Not available</Badge>}</p>
              <p><strong>Auth Context:</strong> {isAuthenticated ? <Badge variant="outline">✅ Set</Badge> : <Badge variant="secondary">❌ Not set</Badge>}</p>
              <p><strong>Loading:</strong> {isLoading ? <Badge variant="secondary">🔄 Loading</Badge> : <Badge variant="outline">✅ Ready</Badge>}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">User Info</h3>
            <div className="text-sm space-y-1">
              <p><strong>ID:</strong> {user?.id || 'Not available'}</p>
              <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress || 'Not available'}</p>
              <p><strong>Name:</strong> {user?.fullName || 'Not set'}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">Test Results</h3>
            <Button 
              size="sm" 
              onClick={runTests} 
              disabled={testing || !isAuthenticated}
            >
              {testing ? 'Testing...' : 'Run Tests'}
            </Button>
          </div>
          
          {testResults && (
            <div className="bg-secondary/20 p-4 rounded-lg">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
