'use client'

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
  const stats = [
    {
      title: 'Total Inventory Value',
      value: '$234,500',
      change: '+12% from last month',
      changeType: 'positive' as const,
      icon: Package,
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
    {
      title: 'Monthly Revenue',
      value: '$89,400',
      change: '-5% from last month',
      changeType: 'negative' as const,
      icon: DollarSign,
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