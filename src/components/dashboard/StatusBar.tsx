'use client'

import { Badge } from '@/components/ui/badge'
import { useSidebar } from '@/components/ui/sidebar'
import { 
  Database, 
  Server, 
  Shield, 
  Wifi,
  Clock,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusItem {
  label: string
  status: 'online' | 'warning' | 'error'
  icon: React.ElementType
}

export function StatusBar() {
  const { state } = useSidebar()
  const statusItems: StatusItem[] = [
    { label: 'Database', status: 'online', icon: Database },
    { label: 'API', status: 'online', icon: Server },
    { label: 'Auth', status: 'online', icon: Shield },
    { label: 'Backup', status: 'warning', icon: Activity },
  ]

  const getStatusColor = (status: StatusItem['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: StatusItem['status']) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'warning':
        return 'Warning'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
    }
  }

  // Calculate left offset based on sidebar state
  // Default sidebar width is 16rem when expanded, 3rem when collapsed  
  const leftOffset = state === 'expanded' ? '16rem' : '3rem'
  
  return (
    <footer 
      className="fixed bottom-0 h-6 bg-background/95 backdrop-blur-sm border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground z-50 transition-all duration-200"
      style={{
        left: leftOffset,
        right: 0,
      }}
    >
      <div className="flex items-center space-x-4">
        {/* System Status */}
        {statusItems.map((item) => {
          const IconComponent = item.icon
          return (
            <div key={item.label} className="flex items-center space-x-1">
              <IconComponent className="h-3 w-3" />
              <span>{item.label}:</span>
              <div className={cn('h-1.5 w-1.5 rounded-full', getStatusColor(item.status))} />
              <span className="text-[10px]">{getStatusText(item.status)}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          <Wifi className="h-3 w-3" />
          <span>Connected</span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Updated 2m ago</span>
        </div>

        {/* Version */}
        <div className="flex items-center space-x-1">
          <span>BuildTrack v1.0.0</span>
        </div>
      </div>
    </footer>
  )
}