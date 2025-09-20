'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { DashboardHeader } from './DashboardHeader'
import { StatusBar } from './StatusBar'
import { AppSidebar } from './AppSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-x-hidden">
        <DashboardHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent pb-6 w-full max-w-full">
          <div className="p-4 w-full max-w-full">
            <div className="rounded-xl bg-muted/50 p-4 w-full max-w-full overflow-x-hidden">
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
      <StatusBar />
    </SidebarProvider>
  )
}
