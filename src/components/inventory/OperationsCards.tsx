"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react'
import { OperationsForm } from '@/components/operations/OperationsForm'

export function OperationsCards({ autoOpenType }: { autoOpenType?: 'IN' | 'OUT' | 'RETURN' }) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<'IN' | 'OUT' | 'RETURN'>('OUT')

  // Auto open dialog if requested
  useEffect(() => {
    if (autoOpenType) {
      setSelectedType(autoOpenType)
      setOpen(true)
    }
  }, [autoOpenType])

  const launch = (type: 'IN' | 'OUT' | 'RETURN') => {
    setSelectedType(type)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-green-500 hover:border-l-green-600" onClick={() => launch('IN')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-green-700">Stock In</CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">Record incoming inventory from suppliers and deliveries</CardDescription>
            <Button className="w-full" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); launch('IN') }}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Record Stock In
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-red-500 hover:border-l-red-600" onClick={() => launch('OUT')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-red-700">Stock Out</CardTitle>
            <div className="rounded-full bg-red-100 p-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">Dispatch materials and equipment to projects</CardDescription>
            <Button className="w-full" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); launch('OUT') }}>
              <TrendingDown className="mr-2 h-4 w-4" />
              Record Stock Out
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600" onClick={() => launch('RETURN')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-blue-700">Return</CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">Record items returned from projects to stock</CardDescription>
            <Button className="w-full" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); launch('RETURN') }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Record Return
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedType === 'IN' && <><TrendingUp className="h-5 w-5 text-green-600" />Record Stock In</>}
              {selectedType === 'OUT' && <><TrendingDown className="h-5 w-5 text-red-600" />Record Stock Out</>}
              {selectedType === 'RETURN' && <><RotateCcw className="h-5 w-5 text-blue-600" />Record Return</>}
            </DialogTitle>
            <DialogDescription>
              {selectedType === 'IN' && 'Add items to your inventory from suppliers or other sources.'}
              {selectedType === 'OUT' && 'Dispatch materials and equipment to projects or locations.'}
              {selectedType === 'RETURN' && 'Return items back to inventory from projects or other locations.'}
            </DialogDescription>
          </DialogHeader>
          <OperationsForm initialType={selectedType} />
        </DialogContent>
      </Dialog>
    </div>
  )
}