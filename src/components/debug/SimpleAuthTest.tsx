import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthDebugInfo {
  clerkLoaded: boolean;
  clerkSignedIn: boolean;
  clerkUserId: string | null;
  clerkUserEmail: string | null;
  supabaseAuthSet: boolean;
  supabaseCanQuery: boolean;
  productsCount: number | null;
  projectsCount: number | null;
  error: string | null;
}

export function SimpleAuthTest() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo>({
    clerkLoaded: false,
    clerkSignedIn: false,
    clerkUserId: null,
    clerkUserEmail: null,
    supabaseAuthSet: false,
    supabaseCanQuery: false,
    productsCount: null,
    projectsCount: null,
    error: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const runFullTest = async () => {
    setIsLoading(true);
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    
    try {
      const newDebugInfo: AuthDebugInfo = {
        clerkLoaded: authLoaded && userLoaded,
        clerkSignedIn: isSignedIn || false,
        clerkUserId: user?.id || null,
        clerkUserEmail: user?.emailAddresses?.[0]?.emailAddress || null,
        supabaseAuthSet: false,
        supabaseCanQuery: false,
        productsCount: null,
        projectsCount: null,
        error: null,
      };

      if (user?.id) {
        console.log('🧪 Testing auth with user ID:', user.id);
        
        // Step 1: Set auth context
        try {
          await supabase.rpc('set_auth_context', { user_id: user.id });
          newDebugInfo.supabaseAuthSet = true;
          console.log('✅ Auth context set successfully');
        } catch (error) {
          console.error('❌ Failed to set auth context:', error);
          newDebugInfo.error = `Failed to set auth context: ${error}`;
        }

        // Step 2: Test basic queries
        if (newDebugInfo.supabaseAuthSet) {
          try {
            const [productsResult, projectsResult] = await Promise.all([
              supabase.from('products').select('*', { count: 'exact', head: true }),
              supabase.from('projects').select('*', { count: 'exact', head: true }),
            ]);

            if (productsResult.error) {
              throw new Error(`Products query failed: ${productsResult.error.message}`);
            }
            if (projectsResult.error) {
              throw new Error(`Projects query failed: ${projectsResult.error.message}`);
            }

            newDebugInfo.supabaseCanQuery = true;
            newDebugInfo.productsCount = productsResult.count;
            newDebugInfo.projectsCount = projectsResult.count;
            console.log('✅ Supabase queries successful');
          } catch (error) {
            console.error('❌ Supabase queries failed:', error);
            newDebugInfo.error = `Query failed: ${error}`;
          }
        }
      }

      setDebugInfo(newDebugInfo);
    } catch (error) {
      console.error('❌ Full test failed:', error);
      setDebugInfo(prev => ({ ...prev, error: `Full test failed: ${error}` }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoaded && userLoaded) {
      runFullTest();
    }
  }, [authLoaded, userLoaded, user?.id]);

  const getStatusIcon = (status: boolean) => status ? '✅' : '❌';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Authentication Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Clerk Status:</strong>
            <div>{getStatusIcon(debugInfo.clerkLoaded)} Auth Loaded</div>
            <div>{getStatusIcon(debugInfo.clerkSignedIn)} Signed In</div>
            <div>👤 User ID: {debugInfo.clerkUserId || 'None'}</div>
            <div>📧 Email: {debugInfo.clerkUserEmail || 'None'}</div>
          </div>
          
          <div>
            <strong>Supabase Status:</strong>
            <div>{getStatusIcon(debugInfo.supabaseAuthSet)} Auth Context Set</div>
            <div>{getStatusIcon(debugInfo.supabaseCanQuery)} Can Query Database</div>
            <div>📦 Products: {debugInfo.productsCount ?? 'N/A'}</div>
            <div>🏗️ Projects: {debugInfo.projectsCount ?? 'N/A'}</div>
          </div>
        </div>

        {debugInfo.error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md">
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}

        <Button 
          onClick={runFullTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? '🔄 Testing...' : '🔄 Re-run Test'}
        </Button>

        <div className="text-xs text-muted-foreground bg-secondary p-3 rounded">
          <strong>Expected Result:</strong> All checkmarks should be green (✅) and you should see actual counts for products and projects. 
          If any are red (❌), the error message will help identify the issue.
        </div>
      </CardContent>
    </Card>
  );
}