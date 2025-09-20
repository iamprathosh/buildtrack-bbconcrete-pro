'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'

interface AddUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onUserAdded: (user: any) => void
}

export function AddUserDialog({ isOpen, onClose }: AddUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation to add a new team member
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">Add user dialog</p>
            <p className="text-sm text-muted-foreground">
              User invitation form would go here
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}