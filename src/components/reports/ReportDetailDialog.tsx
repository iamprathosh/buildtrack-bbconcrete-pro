'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ReportDetailDialogProps {
  reportId: string | null
  isOpen: boolean
  onClose: () => void
  displayMode?: 'dialog' | 'sheet'
}

export function ReportDetailDialog({ 
  reportId, 
  isOpen, 
  onClose,
  displayMode = 'dialog' 
}: ReportDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Report Dialog</h3>
              <p className="text-muted-foreground">This component will be rebuilt with a new plan</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}