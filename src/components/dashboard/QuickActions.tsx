'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  Package,
  Building2,
  FileText,
  Users,
  Wrench,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
  role?: string[]
}

export function QuickActions() {
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role as string || 'worker'

  const actions: QuickAction[] = [
    {
      title: 'Add Equipment',
      description: 'Add a new equipment item',
      icon: Wrench,
      href: '/equipment',
      color: 'bg-slate-600 hover:bg-slate-700',
      role: ['manager', 'admin']
    },
    {
      title: 'Add Inventory',
      description: 'Create a new product item',
      icon: Package,
      href: '/inventory?action=add-item',
      color: 'bg-blue-500 hover:bg-blue-600',
      role: ['manager', 'admin', 'worker']
    },
    {
      title: 'Stock In',
      description: 'Receive stock into inventory',
      icon: Plus,
      href: '/inventory?action=stock&type=IN',
      color: 'bg-green-500 hover:bg-green-600',
      role: ['manager', 'admin', 'worker']
    },
    {
      title: 'Stock Out',
      description: 'Dispatch stock to projects',
      icon: BarChart3,
      href: '/inventory?action=stock&type=OUT',
      color: 'bg-orange-500 hover:bg-orange-600',
      role: ['manager', 'admin', 'worker']
    },
    {
      title: 'Stock Return',
      description: 'Return stock back to inventory',
      icon: Building2,
      href: '/inventory?action=stock&type=RETURN',
      color: 'bg-purple-500 hover:bg-purple-600',
      role: ['manager', 'admin', 'worker']
    }
  ]

  // Filter actions based on user role
  const filteredActions = actions.filter(action => 
    !action.role || action.role.includes(userRole)
  )

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {filteredActions.slice(0, 4).map((action) => {
              const IconComponent = action.icon
              return (
                <Link 
                  key={action.title} 
                  href={action.href}
                  className="group flex flex-col items-center space-y-2 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:shadow-md transition-all duration-200"
                >
                  <div className={`p-2 rounded-full text-white ${action.color} group-hover:scale-105 transition-transform`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm group-hover:text-accent-foreground">{action.title}</div>
                    <div className="text-xs text-muted-foreground group-hover:text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
