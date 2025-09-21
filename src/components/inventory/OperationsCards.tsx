"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react'
import { OperationsForm } from '@/components/operations/OperationsForm'

export function OperationsCards() {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<'IN' | 'OUT' | 'RETURN'>('OUT')

  const launch = (type: 'IN' | 'OUT' | 'RETURN') => {
    setSelectedType(type)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => launch('IN')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock In</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Record incoming inventory</div>
            <Button className="mt-3" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); launch('IN') }}>Start</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => launch('OUT')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Dispatch materials to projects</div>
            <Button className="mt-3" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); launch('OUT') }}>Start</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => launch('RETURN')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Return</CardTitle>
            <RotateCcw className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Record items returned to stock</div>
            <Button className="mt-3" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); launch('RETURN') }}>Start</Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedType === 'IN' ? 'Record Stock In' : selectedType === 'OUT' ? 'Record Stock Out' : 'Record Return'}
            </DialogTitle>
          </DialogHeader>
          <OperationsForm initialType={selectedType} />
        </DialogContent>
      </Dialog>
    </div>
  )
}