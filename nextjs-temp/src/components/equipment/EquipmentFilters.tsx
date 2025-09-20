'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface EquipmentFiltersProps {
  filters: any
  onFiltersChange: (filters: any) => void
  equipment: any[]
}

export function EquipmentFilters({ filters, onFiltersChange }: EquipmentFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment, models, locations..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  )
}