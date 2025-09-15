import { Button } from "@/components/ui/button";
import { ClerkUserButton } from "@/components/auth/ClerkAuth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  FileText,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wrench,
  Home,
  Bell,
  PackageOpen,
  Cog
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthContext } from "@/contexts/AuthContext";
import BBLogo from "@/assets/bb-logo.jpg";

interface SidebarProps {
  className?: string;
}

// Base navigation available to all users
const baseNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
];

// Worker-specific navigation
const workerNavigation = [
  { name: "Operations", href: "/worker/operations", icon: PackageOpen },
  { name: "Inventory", href: "/worker/inventory", icon: Package },
  { name: "Equipment", href: "/worker/equipment", icon: Wrench },
  { name: "Projects", href: "/worker/projects", icon: Building2 },
];

// Manager/Admin navigation
const managerNavigation = [
  { name: "Operations", href: "/worker/operations", icon: PackageOpen },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Projects", href: "/projects", icon: Building2 },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Procurement", href: "/procurement", icon: ShoppingCart },
  { name: "Vendors", href: "/vendors", icon: Truck },
  { name: "Equipment", href: "/equipment", icon: Wrench },
];

// Super Admin navigation
const adminNavigation = [
  { name: "Operations", href: "/worker/operations", icon: PackageOpen },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Projects", href: "/projects", icon: Building2 },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Procurement", href: "/procurement", icon: ShoppingCart },
  { name: "Vendors", href: "/vendors", icon: Truck },
  { name: "Equipment", href: "/equipment", icon: Wrench },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profile } = useUserProfile();
  const { isAuthenticated } = useAuthContext();

  // Memoize navigation to prevent recalculation on every render
  const navigation = useMemo(() => {
    if (!isAuthenticated || !profile) {
      console.log('🔍 Using base navigation (no auth/profile)');
      return baseNavigation;
    }
    
    console.log('🔍 Using navigation for role:', profile.role);
    switch (profile.role) {
      case 'worker':
        return [...baseNavigation, ...workerNavigation];
      case 'project_manager':
        return [...baseNavigation, ...managerNavigation];
      case 'super_admin':
        return [...baseNavigation, ...adminNavigation];
      default:
        return baseNavigation;
    }
  }, [isAuthenticated, profile?.role]);

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-16" : "w-64",
        "transition-all duration-300",
        className
      )}
    >
      {/* Logo Header */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-sidebar-primary">
            <span className="text-xs font-bold text-sidebar-primary-foreground">B&B</span>
          </div>
        ) : (
          <img src={BBLogo} alt="BuildTrack" className="h-8" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed ? "px-2" : "px-3",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              size={collapsed ? "icon" : "default"}
            >
              <Link to={item.href}>
                <Icon className="h-5 w-5" />
                {!collapsed && <span className="ml-3 font-inter">{item.name}</span>}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          size={collapsed ? "icon" : "default"}
        >
          <Link to="/notifications">
            <Bell className="h-5 w-5" />
            {!collapsed && <span className="ml-3 font-inter">Notifications</span>}
          </Link>
        </Button>
        
        <div className="flex justify-center mt-2">
          <ClerkUserButton />
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
          size="sm"
        >
          <span className="text-xs font-inter">
            {collapsed ? "→" : "←"}
          </span>
        </Button>
      </div>
    </div>
  );
}