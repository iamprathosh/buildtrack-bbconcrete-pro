import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserActivity } from '@/hooks/useUserActivity';

interface ActivityContextType {
  logPageView: (page: string, metadata?: Record<string, any>) => void;
  logUserAction: (action: string, metadata?: Record<string, any>) => void;
  sessionId: string;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}

interface ActivityProviderProps {
  children: React.ReactNode;
}

export function ActivityProvider({ children }: ActivityProviderProps) {
  const location = useLocation();
  const { logPageView, logUserAction, sessionId } = useUserActivity();
  const lastPageRef = useRef<string>('');
  const isLoggingRef = useRef<boolean>(false);

  // Track page views automatically with debouncing
  useEffect(() => {
    const currentPage = location.pathname + location.search;
    
    // Prevent duplicate page views and concurrent logging
    if (currentPage === lastPageRef.current || isLoggingRef.current) {
      return;
    }
    
    // Debounce page view logging
    const timeoutId = setTimeout(async () => {
      try {
        isLoggingRef.current = true;
        const pageName = getPageName(location.pathname);
        
        await logPageView(pageName, {
          path: location.pathname,
          search: location.search,
          timestamp: new Date().toISOString()
        });
        
        lastPageRef.current = currentPage;
        console.log('📍 Page view tracked:', pageName);
      } catch (error) {
        console.error('Failed to log page view:', error);
      } finally {
        isLoggingRef.current = false;
      }
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search, logPageView]);

  const contextValue: ActivityContextType = {
    logPageView,
    logUserAction,
    sessionId
  };

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
}

// Helper function to convert route paths to readable page names
function getPageName(pathname: string): string {
  const routes: Record<string, string> = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/inventory': 'Inventory Overview',
    '/inventory/add': 'Add Product',
    '/inventory/bulk-import': 'Bulk Import',
    '/inventory/locations': 'Location Management',
    '/inventory/transfer': 'Inventory Transfer',
    '/inventory/audit': 'Cycle Count',
    '/inventory/categories': 'Category Management',
    '/inventory/requisitions': 'Requisition Approval',
    '/projects': 'Projects Overview',
    '/customers': 'Customer Management',
    '/vendors': 'Vendors Overview',
    '/procurement': 'Purchase Order Management',
    '/procurement/invoices': 'Vendor Invoice Management',
    '/equipment': 'Equipment Overview',
    '/equipment/maintenance': 'Maintenance Log',
    '/users': 'User Management',
    '/users/roles': 'Role Permission Management',
    '/system/audit': 'System Audit Log',
    '/settings': 'System Settings',
    '/settings/advanced': 'Advanced Settings',
    '/system/data': 'Data Management',
    '/system/backup': 'Backup Recovery',
    '/reports': 'Advanced Reports',
    '/reports/builder': 'Report Builder',
    '/reports/saved': 'Saved Reports',
    '/reports/forecasting': 'Forecasting Dashboard',
    '/worker/operations': 'Worker Operations',
    '/worker/inventory': 'Worker Inventory',
    '/worker/equipment': 'Worker Equipment',
    '/worker/projects': 'Worker Projects',
    '/worker/scan': 'Barcode Scanning',
    '/worker/requisitions': 'Worker Requisitions',
    '/profile': 'User Profile',
    '/notifications': 'Notification Center',
    '/debug': 'Debug Page',
    '/auth-debug': 'Auth Debug',
    '/rls-debug': 'RLS Debug'
  };

  // Handle dynamic routes
  if (pathname.match(/^\/projects\/[^\/]+$/)) {
    return 'Project Details';
  }
  if (pathname.match(/^\/projects\/[^\/]+\/expenses$/)) {
    return 'Project Expenses';
  }
  if (pathname.match(/^\/projects\/[^\/]+\/invoices$/)) {
    return 'Project Invoicing';
  }
  if (pathname.match(/^\/inventory\/[^\/]+$/)) {
    return 'Product Details';
  }
  if (pathname.match(/^\/vendors\/[^\/]+$/)) {
    return 'Vendor Details';
  }
  if (pathname.match(/^\/equipment\/[^\/]+$/)) {
    return 'Equipment Details';
  }

  return routes[pathname] || `Page: ${pathname}`;
}