import { SimpleAuthTest } from "@/components/debug/SimpleAuthTest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const AuthDebug = () => {
  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button asChild variant="outline">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">🔧 Authentication Debug</h1>
        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      {/* Main debug component */}
      <SimpleAuthTest />

      {/* Instructions */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>📋 Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">What this page does:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tests Clerk authentication directly</li>
              <li>Tests Supabase database connection</li>
              <li>Tests the auth context setting function</li>
              <li>Tests basic database queries</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">If you see errors:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Auth Context Failed:</strong> Database functions missing or broken</li>
              <li><strong>Query Failed:</strong> RLS policies are blocking access</li>
              <li><strong>User ID None:</strong> Clerk authentication is not working</li>
            </ul>
          </div>

          <div className="p-3 bg-info/10 text-info rounded-md">
            <strong>💡 Tip:</strong> If this page shows all green checkmarks but your dashboard still shows a blank screen, 
            the issue is in the AuthContext or SupabaseProvider components.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebug;