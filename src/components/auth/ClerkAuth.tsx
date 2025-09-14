import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export function ClerkAuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>
        <AuthenticationScreen />
      </SignedOut>
      <SignedIn>
        {children}
      </SignedIn>
    </>
  );
}

function AuthenticationScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to BuildTrack</CardTitle>
          <CardDescription>
            Sign in to access your inventory and project management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </SignInButton>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
            <Button variant="outline" className="w-full" size="lg">
              Create Account
            </Button>
          </SignUpButton>
        </CardContent>
      </Card>
    </div>
  );
}

export function ClerkUserButton() {
  return (
    <SignedIn>
      <UserButton 
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
          }
        }}
        afterSignOutUrl="/"
      />
    </SignedIn>
  );
}