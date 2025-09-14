import { Button } from "@/components/ui/button";
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
  LogOut,
} from "lucide-react";
import { useState } from "react";
import BBLogo from "@/assets/bb-logo.jpg";

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, current: true },
  { name: "Inventory", href: "/inventory", icon: Package, current: false },
  { name: "Projects", href: "/projects", icon: Building2, current: false },
  { name: "Reports", href: "/reports", icon: BarChart3, current: false },
  { name: "Procurement", href: "/procurement", icon: ShoppingCart, current: false },
  { name: "Equipment", href: "/equipment", icon: Wrench, current: false },
  { name: "Users", href: "/users", icon: Users, current: false },
  { name: "Settings", href: "/settings", icon: Settings, current: false },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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
          return (
            <Button
              key={item.name}
              variant={item.current ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed ? "px-2" : "px-3",
                item.current && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              size={collapsed ? "icon" : "default"}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span className="ml-3 font-inter">{item.name}</span>}
            </Button>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          size={collapsed ? "icon" : "default"}
        >
          <Bell className="h-5 w-5" />
          {!collapsed && <span className="ml-3 font-inter">Notifications</span>}
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          size={collapsed ? "icon" : "default"}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3 font-inter">Sign Out</span>}
        </Button>
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