'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Building2, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  className?: string
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, className }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50 border-green-200',
    negative: 'text-red-600 bg-red-50 border-red-200',
    neutral: 'text-muted-foreground bg-muted',
  }

  const TrendIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : null

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={cn(
            'flex items-center text-xs mt-1 px-2 py-1 rounded-full w-fit',
            changeColors[changeType]
          )}>
            {TrendIcon && <TrendIcon className="h-3 w-3 mr-1" />}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsOverview() {
  const [inCount, setInCount] = useState<number>(0)
  const [outCount, setOutCount] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/simple-transactions/summary', { cache: 'no-store' })
        const data = await res.json()
        const summary = data.summary || {}
        setInCount(Number(summary?.IN?.count || 0))
        setOutCount(Number(summary?.OUT?.count || 0))
      } catch (e) {
        setInValue(0)
        setOutValue(0)
      }
    }
    load()
  }, [])

  const formatNumber = (v: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v)

  const stats = [
    {
      title: 'Stock In (7d)',
      value: formatNumber(inCount),
      change: '',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Stock Out (7d)',
      value: formatNumber(outCount),
      change: '',
      changeType: 'negative' as const,
      icon: TrendingDown,
    },
    {
      title: 'Active Projects',
      value: '18',
      change: '+2 new this week',
      changeType: 'positive' as const,
      icon: Building2,
    },
    {
      title: 'Team Members',
      value: '32',
      change: 'No change',
      changeType: 'neutral' as const,
      icon: Users,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
        />
      ))}
    </div>
  )
}
