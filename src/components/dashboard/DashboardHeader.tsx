'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Bell, TrendingUp, TrendingDown, RotateCcw, Package } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

type HeaderTransaction = {
  id: string
  type: 'IN' | 'OUT' | 'RETURN' | string
  product?: string
  sku?: string
  quantity?: number
  unit?: string
  project?: string
  user?: string
  timestamp?: string
  status?: string
  created_at?: string
  done_at?: string
}

function isToday(dateStr?: string | null) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<HeaderTransaction[]>([])

const loadTransactions = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/operations/transactions?limit=100&today=1', { credentials: 'same-origin' })
      if (res.ok) {
        const data = await res.json()
        const items: HeaderTransaction[] = (data.transactions || [])
        setTransactions(items)
      } else {
        setTransactions([])
      }
    } catch (e) {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadTransactions()
    }
  }, [open])

  const getBestDate = (t: HeaderTransaction) => t.timestamp || t.done_at || t.created_at
  const todays = transactions.filter((t) => isToday(getBestDate(t)))
  const countToday = todays.length

  const renderIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'RETURN':
        return <RotateCcw className="h-4 w-4 text-blue-600" />
      default:
        return <Package className="h-4 w-4" />
    }
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
          {/* Notifications */}
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {countToday > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                  >
                    {countToday}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0">
              <div className="p-3 border-b font-medium">Today's Transactions</div>
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                ) : todays.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No transactions today</div>
                ) : (
                  todays.map((t) => (
                    <div key={t.id} className="px-3 py-2 hover:bg-accent/50 flex items-start gap-2">
                      {renderIcon(String(t.type))}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {(t.product || 'Unknown Product')} • {String(t.type)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          Qty {t.quantity ?? '-'} {t.unit ?? ''} {t.project ? `• ${t.project}` : ''}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
