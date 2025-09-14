import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ChevronDown, Trash2, Archive, Edit, Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive' | 'secondary';
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
}

interface BulkActionsProps<T> {
  data: T[];
  selectedItems: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onAction: (actionId: string, selectedIds: string[]) => Promise<void>;
  getItemId: (item: T) => string;
  actions: BulkAction[];
  className?: string;
}

export function BulkActions<T>({
  data,
  selectedItems,
  onSelectionChange,
  onAction,
  getItemId,
  actions,
  className = ''
}: BulkActionsProps<T>) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const allSelected = data.length > 0 && selectedItems.size === data.length;
  const someSelected = selectedItems.size > 0 && selectedItems.size < data.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(getItemId)));
    }
  };

  const handleAction = async (action: BulkAction) => {
    if (selectedItems.size === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to perform this action",
        variant: "destructive"
      });
      return;
    }

    if (action.requiresConfirmation) {
      setPendingAction(action);
      setIsConfirmOpen(true);
    } else {
      await executeAction(action);
    }
  };

  const executeAction = async (action: BulkAction) => {
    setIsProcessing(true);
    try {
      await onAction(action.id, Array.from(selectedItems));
      toast({
        title: "Action completed",
        description: `${action.label} completed for ${selectedItems.size} item(s)`
      });
      onSelectionChange(new Set()); // Clear selection
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
      setPendingAction(null);
    }
  };

  const defaultActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationTitle: 'Delete Selected Items',
      confirmationDescription: 'Are you sure you want to delete the selected items? This action cannot be undone.'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      variant: 'secondary',
      requiresConfirmation: true,
      confirmationTitle: 'Archive Selected Items',
      confirmationDescription: 'Are you sure you want to archive the selected items?'
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      variant: 'default'
    }
  ];

  const availableActions = actions.length > 0 ? actions : defaultActions;

  return (
    <>
      <div className={`flex items-center gap-4 p-4 bg-card rounded-lg border ${className}`}>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            ref={(ref) => {
              if (ref && 'indeterminate' in ref) {
                (ref as any).indeterminate = someSelected;
              }
            }}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedItems.size > 0 ? (
              <Badge variant="secondary">
                {selectedItems.size} selected
              </Badge>
            ) : (
              'Select all'
            )}
          </span>
        </div>

        {selectedItems.size > 0 && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isProcessing}>
                  Bulk Actions
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {availableActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => handleAction(action)}
                      className={action.variant === 'destructive' ? 'text-destructive' : ''}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange(new Set())}
              disabled={isProcessing}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.confirmationTitle || 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.confirmationDescription || 
               `Are you sure you want to perform this action on ${selectedItems.size} item(s)?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingAction && executeAction(pendingAction)}
              className={pendingAction?.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}