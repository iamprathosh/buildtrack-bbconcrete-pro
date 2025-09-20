'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { useUserProfile } from '@/hooks/useUserProfile'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
  PackageOpen,
  Shield,
  MapPin,
  ArrowRightLeft,
  ClipboardList,
  FolderOpen,
  Receipt,
  DollarSign,
  Database,
  HardDrive,
  ScanLine,
  Bell,
  UserPlus
} from 'lucide-react'

// Navigation items based on user roles
const navigationItems = {
  base: [
    { name: 'Dashboard', href: '/', icon: Home, badge: null },
  ],
  worker: [
    { name: 'Operations', href: '/worker/operations', icon: PackageOpen, badge: null },
    { name: 'Inventory', href: '/worker/inventory', icon: Package, badge: null },
    { name: 'Projects', href: '/worker/projects', icon: Building2, badge: null },
    { name: 'Equipment', href: '/worker/equipment', icon: Wrench, badge: null },
  ],
  manager: [
    { name: 'Operations', href: '/operations', icon: PackageOpen, badge: null },
    { name: 'Inventory', href: '/inventory', icon: Package, badge: null },
    { name: 'Projects', href: '/projects', icon: Building2, badge: null },
    { name: 'Reports', href: '/reports', icon: BarChart3, badge: null },
    { name: 'Procurement', href: '/procurement', icon: ShoppingCart, badge: null },
    { name: 'Vendors', href: '/vendors', icon: Truck, badge: null },
    { name: 'Equipment', href: '/equipment', icon: Wrench, badge: null },
  ],
  admin: [
    { name: 'Operations', href: '/operations', icon: PackageOpen, badge: null },
    { name: 'Inventory', href: '/inventory', icon: Package, badge: null },
    { name: 'Projects', href: '/projects', icon: Building2, badge: null },
    { name: 'Reports', href: '/reports', icon: BarChart3, badge: null },
    { name: 'Procurement', href: '/procurement', icon: ShoppingCart, badge: null },
    { name: 'Vendors', href: '/vendors', icon: Truck, badge: null },
    { name: 'Equipment', href: '/equipment', icon: Wrench, badge: null },
    { name: 'Users', href: '/users', icon: UserPlus, badge: null },
    { name: 'Settings', href: '/settings', icon: Settings, badge: null },
  ]
}

const quickActions = [
  { name: 'New Inventory', href: '/inventory/add', icon: Package },
  { name: 'Create Report', href: '/reports/new', icon: FileText },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const { profile, loading: profileLoading } = useUserProfile()

  // Get user role from Supabase profile
  const userRole = useMemo(() => {
    if (!profile) return 'worker'
    
    // Map Supabase roles to navigation roles
    switch (profile.role) {
      case 'super_admin': return 'admin'
      case 'project_manager': return 'manager'
      case 'worker': return 'worker'
      default: return 'worker'
    }
  }, [profile])

  const navigation = useMemo(() => {
    const items = [...navigationItems.base]
    
    if (isLoaded && user && profile && !profileLoading) {
      // Add role-specific navigation based on Supabase profile
      const roleItems = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.worker
      items.push(...roleItems)
    }
    
    return items
  }, [isLoaded, user, profile, profileLoading, userRole])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white p-1">
                  <Image 
                    src="/bb-logo.jpg" 
                    alt="B&B Concrete Logo" 
                    width={32} 
                    height={32} 
                    className="rounded object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BuildTrack</span>
                  <span className="truncate text-xs">B&B Concrete</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.name}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <SidebarMenuItem key={action.href}>
                    <SidebarMenuButton asChild size="sm" tooltip={action.name}>
                      <Link href={action.href}>
                        <Icon />
                        <span>{action.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/profile" className="flex items-center">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.imageUrl} alt={user?.firstName || 'User'} />
                  <AvatarFallback className="rounded-lg">
                    <Shield className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                  <span className="truncate text-xs capitalize">
                    {userRole}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}