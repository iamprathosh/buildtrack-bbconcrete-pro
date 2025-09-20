'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Search, 
  Command, 
  Loader2, 
  Settings,
  LogOut,
  User,
  Moon,
  Sun
} from 'lucide-react'
import { useUser, UserButton } from '@clerk/nextjs'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isSearchOpen) {
      // Global shortcut: Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setIsSearchOpen(true)
        return
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsSearchOpen(false)
        setSelectedIndex(-1)
        searchInputRef.current?.blur()
        break
    }
  }, [isSearchOpen])

  // Handle clicks outside search to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const handleSearchFocus = () => {
    setIsSearchOpen(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedIndex(-1)
    
    if (!isSearchOpen) {
      setIsSearchOpen(true)
    }
  }

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (!searchContainerRef.current?.contains(document.activeElement)) {
        setIsSearchOpen(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full max-w-full overflow-x-hidden">
      <div className="flex h-16 items-center justify-between px-6 w-full max-w-full min-w-0">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <SidebarTrigger className="-ml-1 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Search */}
          <div ref={searchContainerRef} className="relative hidden md:block">
            <div className="relative">
              <Search className={cn(
                "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors z-10",
                isSearchOpen ? "text-primary" : "text-muted-foreground"
              )} />
              
              <Input
                ref={searchInputRef}
                placeholder="Search..."
                className={cn(
                  "w-64 pl-10 pr-10 transition-all duration-200",
                  isSearchOpen && "ring-2 ring-primary/20 border-primary/50"
                )}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                aria-label="Global search"
                aria-expanded={isSearchOpen}
              />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : !isSearchOpen && !searchQuery ? (
                  <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                    <Command className="h-3 w-3" />
                    K
                  </kbd>
                ) : null}
              </div>
            </div>
            
            {/* Search Results Dropdown */}
            {isSearchOpen && searchQuery.length >= 2 && (
              <div className="absolute top-full mt-2 w-full z-50 rounded-md border bg-popover p-1 shadow-md">
                <div className="p-2 text-sm text-muted-foreground">
                  Search functionality coming soon...
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs"
            >
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>

        </div>
      </div>
    </header>
  )
}