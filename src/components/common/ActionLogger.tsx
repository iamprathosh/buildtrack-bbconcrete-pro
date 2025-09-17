import React from 'react';
import { Button } from '@/components/ui/button';
import { useActivity } from '@/providers/ActivityProvider';
import { toast } from '@/hooks/use-toast';

interface ActionLoggerProps {
  action: string;
  description?: string;
  metadata?: Record<string, any>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  showToast?: boolean;
}

/**
 * ActionLogger - A wrapper component that logs user actions when clicked
 * 
 * Usage examples:
 * 
 * <ActionLogger 
 *   action="user_created" 
 *   description="Created new user account" 
 *   metadata={{ userId: newUserId, role: 'worker' }}
 * >
 *   <Button>Create User</Button>
 * </ActionLogger>
 * 
 * <ActionLogger 
 *   action="file_downloaded" 
 *   description="Downloaded inventory report"
 *   metadata={{ reportType: 'inventory', fileName: 'report.pdf' }}
 *   showToast={true}
 * >
 *   <Button variant="outline">Download Report</Button>
 * </ActionLogger>
 */
export function ActionLogger({ 
  action, 
  description, 
  metadata, 
  children, 
  onClick, 
  showToast = false,
  ...buttonProps 
}: ActionLoggerProps) {
  const { logUserAction } = useActivity();

  const handleClick = async () => {
    try {
      // Execute the custom onClick handler first
      if (onClick) {
        await onClick();
      }

      // Log the action
      logUserAction(action, {
        description,
        timestamp: new Date().toISOString(),
        ...metadata
      });

      // Show toast if requested
      if (showToast) {
        toast({
          title: 'Action Logged',
          description: description || `Action "${action}" has been recorded`,
        });
      }
    } catch (error) {
      console.error('Error in ActionLogger:', error);
    }
  };

  // If children is a button-like element, clone it with our click handler
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      ...buttonProps
    });
  }

  // Otherwise wrap in a button
  return (
    <Button onClick={handleClick} {...buttonProps}>
      {children}
    </Button>
  );
}

// Convenience hooks for common actions
export const useActionLogger = () => {
  const { logUserAction } = useActivity();

  return {
    logAction: (action: string, description?: string, metadata?: Record<string, any>) => {
      logUserAction(action, {
        description,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    },

    // Common actions
    logUserCreated: (userId: string, role: string) => {
      logUserAction('user_created', {
        description: `Created new user with role: ${role}`,
        userId,
        role,
        timestamp: new Date().toISOString()
      });
    },

    logUserUpdated: (userId: string, changes: Record<string, any>) => {
      logUserAction('user_updated', {
        description: `Updated user profile`,
        userId,
        changes,
        timestamp: new Date().toISOString()
      });
    },

    logUserStatusChanged: (userId: string, newStatus: boolean) => {
      logUserAction('user_status_changed', {
        description: `User ${newStatus ? 'activated' : 'deactivated'}`,
        userId,
        newStatus,
        timestamp: new Date().toISOString()
      });
    },

    logFileDownload: (fileName: string, fileType: string) => {
      logUserAction('file_downloaded', {
        description: `Downloaded ${fileType}: ${fileName}`,
        fileName,
        fileType,
        timestamp: new Date().toISOString()
      });
    },

    logReportGenerated: (reportType: string, parameters?: Record<string, any>) => {
      logUserAction('report_generated', {
        description: `Generated ${reportType} report`,
        reportType,
        parameters,
        timestamp: new Date().toISOString()
      });
    },

    logDataImport: (dataType: string, recordCount: number) => {
      logUserAction('data_imported', {
        description: `Imported ${recordCount} ${dataType} records`,
        dataType,
        recordCount,
        timestamp: new Date().toISOString()
      });
    },

    logSystemSettingChanged: (settingKey: string, oldValue: any, newValue: any) => {
      logUserAction('setting_changed', {
        description: `Changed system setting: ${settingKey}`,
        settingKey,
        oldValue,
        newValue,
        timestamp: new Date().toISOString()
      });
    }
  };
};