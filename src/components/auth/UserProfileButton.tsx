import { SignedIn, useUser } from "@clerk/clerk-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Shield, Briefcase, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  project_manager: 'Manager',
  worker: 'Worker'
};

const ROLE_ICONS = {
  super_admin: Shield,
  project_manager: Briefcase,
  worker: Wrench
};

const ROLE_COLORS = {
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  project_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  worker: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

export function UserProfileButton() {
  const { user } = useUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' });
  };

  if (!user) return null;

  // Get user initials for fallback
  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.emailAddresses[0]?.emailAddress[0].toUpperCase() || 'U';

  const roleLabel = profile?.role ? ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] : 'Loading...';
  const RoleIcon = profile?.role ? ROLE_ICONS[profile.role as keyof typeof ROLE_ICONS] : User;
  const roleColorClass = profile?.role ? ROLE_COLORS[profile.role as keyof typeof ROLE_COLORS] : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

  return (
    <SignedIn>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-auto px-3 py-2">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user.imageUrl} 
                  alt={user.fullName || user.emailAddresses[0]?.emailAddress}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* User info and role */}
              <div className="hidden md:flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {user.fullName || user.emailAddresses[0]?.emailAddress}
                </span>
                {profileLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs h-4 px-1.5 ${roleColorClass} border-0`}
                  >
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {roleLabel}
                  </Badge>
                )}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user.imageUrl} 
                    alt={user.fullName || user.emailAddresses[0]?.emailAddress}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {user.fullName || 'Unknown User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
              
              {/* Role badge */}
              <div className="flex items-center justify-start">
                {profileLoading ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${roleColorClass} border-0`}
                  >
                    <RoleIcon className="h-3 w-3 mr-1.5" />
                    {roleLabel}
                  </Badge>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Account
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            
            {/* Show Settings only for admins and managers */}
            {profile?.role && ['super_admin', 'project_manager'].includes(profile.role) && (
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SignedIn>
  );
}