'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

interface AddEquipmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onEquipmentAdded: (equipment: any) => void
}

export function AddEquipmentDialog({ isOpen, onClose }: AddEquipmentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
          <DialogDescription>
            Register new construction equipment or machinery
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">Add equipment dialog</p>
            <p className="text-sm text-muted-foreground">
              Equipment registration form would go here
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Add Equipment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}