import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import { RoleValidationModal } from "./RoleValidationModal";
import { useState } from "react";
import { UserRole } from "@/config/registrationPasswords";
import { useAuthContext } from "@/contexts/AuthContext";

export function ClerkAuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>
        <AuthenticationScreen />
      </SignedOut>
      <SignedIn>
        <ProfileSyncWrapper>
          {children}
        </ProfileSyncWrapper>
      </SignedIn>
    </>
  );
}

function ProfileSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isLoading } = useAuthContext();

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-destructive">Authentication Error</CardTitle>
            <CardDescription>
              Please sign in to continue.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

function AuthenticationScreen() {
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleRoleValidated = (role: UserRole) => {
    // Role is stored in localStorage and will be picked up by useUserProfile
    // Now trigger Clerk's built-in registration
    setShowRoleModal(false);
    // Trigger the hidden Clerk signup button
    setTimeout(() => {
      const signupButton = document.getElementById('clerk-signup-trigger');
      if (signupButton) {
        signupButton.click();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to B&B Construtions Inventory</CardTitle>
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

          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={() => setShowRoleModal(true)}
          >
            Create Account
          </Button>
          
          <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
            <Button className="hidden" id="clerk-signup-trigger">
              Hidden Signup
            </Button>
          </SignUpButton>
        </CardContent>
      </Card>
      
      <RoleValidationModal 
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onValidated={handleRoleValidated}
      />
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
