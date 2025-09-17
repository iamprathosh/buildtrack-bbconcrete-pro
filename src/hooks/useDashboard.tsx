import { useQuery } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { useAuthContext } from '@/contexts/AuthContext';

export interface DashboardStats {
  totalInventoryValue: number;
  activeProjectsCount: number;
  lowStockItemsCount: number;
  teamMembersCount: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info';
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  budget: number;
  progress: number;
  customer_name?: string;
}

export function useDashboard() {
  const { supabase, isAuthenticated } = useSupabaseClient();
  const { userId } = useAuthContext();
  
  // Debug logging
  console.log('🔍 useDashboard - isAuthenticated:', isAuthenticated, 'userId:', userId);
  
  // We'll fetch low stock data directly instead of using the business logic function

  // Fetch dashboard statistics with optimized parallel queries
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['dashboard_stats'],
    enabled: true, // Temporarily bypass auth check
    queryFn: async (): Promise<DashboardStats> => {
      // Set auth context if we have a user ID
      if (userId) {
        try {
          await supabase.rpc('set_auth_context', { user_id: userId });
          console.log('✅ Auth context set in stats query:', userId);
        } catch (error) {
          console.warn('⚠️ Failed to set auth context in stats query:', error);
        }
      }
      
      // Run all queries in parallel for better performance
      const [productsResult, projectsResult, usersResult] = await Promise.all([
        // Get products for inventory value and low stock count
        supabase
          .from('products')
          .select('current_stock, mauc, min_stock_level')
          .eq('is_active', true),
        
        // Get active projects count
        supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .in('status', ['planning', 'active']),
        
        // Get team members count
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
      ]);

      const { data: products, error: productsError } = productsResult;
      const { count: activeProjectsCount, error: projectsError } = projectsResult;
      const { count: teamMembersCount, error: usersError } = usersResult;

      if (productsError) throw productsError;
      if (projectsError) throw projectsError;
      if (usersError) throw usersError;

      // Calculate stats from products data
      let totalInventoryValue = 0;
      let lowStockItemsCount = 0;

      products?.forEach(product => {
        // Calculate inventory value
        totalInventoryValue += product.current_stock * (product.mauc || 0);
        
        // Check if low stock
        if (product.current_stock < product.min_stock_level) {
          lowStockItemsCount++;
        }
      });

      return {
        totalInventoryValue,
        activeProjectsCount: activeProjectsCount || 0,
        lowStockItemsCount,
        teamMembersCount: teamMembersCount || 0
      };
    },
    staleTime: 2 * 60 * 1000, // Data stays fresh for 2 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes (less frequent)
  });

  // Fetch recent activity from both audit_logs AND stock_transactions (comprehensive business activity)
  const {
    data: recentActivity,
    isLoading: isLoadingActivity
  } = useQuery({
    queryKey: ['recent_activity_comprehensive'],
    enabled: true,
    queryFn: async (): Promise<RecentActivity[]> => {
      // Set auth context if we have a user ID
      if (userId) {
        try {
          await supabase.rpc('set_auth_context', { user_id: userId });
        } catch (error) {
          console.warn('⚠️ Failed to set auth context in activity query:', error);
        }
      }
      
      const allActivities: RecentActivity[] = [];
      
      // 1. Get audit log activities (all business operations)
      try {
        const { data: auditData, error: auditError } = await supabase
          .from('audit_logs')
          .select('id, table_name, action, new_values, old_values, timestamp')
          .order('timestamp', { ascending: false })
          .limit(10);

        if (auditData && !auditError) {
          const auditActivities: RecentActivity[] = auditData.map((log) => {
            let description = '';
            let type: 'success' | 'warning' | 'info' = 'info';

            switch (log.table_name) {
              case 'products':
                if (log.action === 'INSERT') {
                  description = `New product added: ${log.new_values?.name || 'Unknown'}`;
                  type = 'success';
                } else if (log.action === 'UPDATE') {
                  const oldStock = log.old_values?.current_stock;
                  const newStock = log.new_values?.current_stock;
                  if (oldStock && newStock && newStock > oldStock) {
                    description = `Inventory increased: ${log.new_values?.name || 'Product'} (+${newStock - oldStock})`;
                    type = 'success';
                  } else {
                    description = `Product updated: ${log.new_values?.name || 'Unknown'}`;
                    type = 'info';
                  }
                }
                break;
              case 'equipment':
                if (log.action === 'INSERT') {
                  description = `New equipment added: ${log.new_values?.name || 'Unknown'}`;
                  type = 'success';
                } else if (log.action === 'UPDATE') {
                  const oldStatus = log.old_values?.status;
                  const newStatus = log.new_values?.status;
                  const checkedOutTo = log.new_values?.checked_out_to;
                  if (newStatus === 'checked_out' && checkedOutTo) {
                    description = `Equipment checked out: ${log.new_values?.name || 'Unknown'} to ${checkedOutTo}`;
                    type = 'warning';
                  } else if (oldStatus === 'checked_out' && newStatus === 'available') {
                    description = `Equipment returned: ${log.new_values?.name || 'Unknown'}`;
                    type = 'success';
                  } else {
                    description = `Equipment updated: ${log.new_values?.name || 'Unknown'}`;
                    type = 'info';
                  }
                }
                break;
              case 'projects':
                if (log.action === 'INSERT') {
                  description = `New project created: ${log.new_values?.name || 'Unknown'}`;
                  type = 'success';
                } else if (log.action === 'UPDATE') {
                  const newStatus = log.new_values?.status;
                  if (newStatus === 'completed') {
                    description = `Project completed: ${log.new_values?.name || 'Unknown'}`;
                    type = 'success';
                  } else {
                    description = `Project updated: ${log.new_values?.name || 'Unknown'}`;
                    type = 'info';
                  }
                }
                break;
              case 'purchase_orders':
                if (log.action === 'INSERT') {
                  description = `Purchase order created: ${log.new_values?.po_number || 'Unknown'}`;
                  type = 'success';
                } else if (log.action === 'UPDATE' && log.new_values?.status === 'received') {
                  description = `Purchase order received: ${log.new_values?.po_number || 'Unknown'}`;
                  type = 'success';
                }
                break;
              case 'expenses':
                if (log.action === 'INSERT') {
                  const amount = log.new_values?.amount ? `$${Number(log.new_values.amount).toLocaleString()}` : '';
                  description = `New expense recorded: ${log.new_values?.description || 'Unknown'} ${amount}`;
                  type = 'warning';
                }
                break;
              case 'customer_invoices':
                if (log.action === 'INSERT') {
                  description = `Customer invoice created: ${log.new_values?.invoice_number || 'Unknown'}`;
                  type = 'success';
                }
                break;
              default:
                description = `${log.table_name.replace('_', ' ').toUpperCase()}: ${log.action.toLowerCase()}`;
                type = 'info';
            }

            return {
              id: log.id,
              action: log.action,
              description,
              timestamp: log.timestamp,
              type
            };
          });
          
          allActivities.push(...auditActivities);
        }
      } catch (error) {
        console.warn('Failed to load audit logs:', error);
      }
      
      // 2. Get stock transaction activities (for immediate data)
      try {
        const { data: stockData, error: stockError } = await supabase
          .from('stock_transactions')
          .select(`
            id,
            transaction_type,
            quantity,
            transaction_date,
            created_at,
            products!inner (name),
            projects (name)
          `)
          .order('created_at', { ascending: false })
          .limit(8);

        if (stockData && !stockError) {
          const stockActivities: RecentActivity[] = stockData.map((transaction: any) => {
            let description = '';
            let type: 'success' | 'warning' | 'info' = 'info';
            const productName = transaction.products?.name || 'Unknown Product';
            const projectName = transaction.projects?.name || 'Unknown Project';
            const quantity = transaction.quantity || 0;

            switch (transaction.transaction_type) {
              case 'pull':
                description = `${quantity} ${productName} pulled for ${projectName}`;
                type = 'info';
                break;
              case 'receive':
                description = `${quantity} ${productName} received into inventory`;
                type = 'success';
                break;
              case 'return':
                description = `${quantity} ${productName} returned from ${projectName}`;
                type = 'warning';
                break;
            }

            return {
              id: transaction.id + '_stock',
              action: transaction.transaction_type.toUpperCase(),
              description,
              timestamp: transaction.created_at || transaction.transaction_date,
              type
            };
          });
          
          allActivities.push(...stockActivities);
        }
      } catch (error) {
        console.warn('Failed to load stock transactions:', error);
      }

      // Sort all activities by timestamp and return top 20
      return allActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);
    },
    staleTime: 2 * 60 * 1000, // Data stays fresh for 2 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch active projects summary
  const {
    data: activeProjects,
    isLoading: isLoadingProjects
  } = useQuery({
    queryKey: ['dashboard_active_projects'],
    enabled: true, // Temporarily bypass auth check
    queryFn: async (): Promise<ProjectSummary[]> => {
      // Set auth context if we have a user ID
      if (userId) {
        try {
          await supabase.rpc('set_auth_context', { user_id: userId });
        } catch (error) {
          console.warn('⚠️ Failed to set auth context in projects query:', error);
        }
      }
      
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          budget,
          start_date,
          end_date,
          customers!inner (
            name
          )
        `)
        .in('status', ['planning', 'active'])
        .order('created_at', { ascending: false })
        .limit(3); // Reduced from 5 to 3 for faster loading

      if (error) throw error;

      // Calculate progress based on start and end dates
      const projectSummaries: ProjectSummary[] = projects?.map((project: any) => {
        let progress = 0;
        
        if (project.start_date && project.end_date) {
          const startDate = new Date(project.start_date);
          const endDate = new Date(project.end_date);
          const currentDate = new Date();
          
          if (currentDate >= startDate && currentDate <= endDate) {
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = currentDate.getTime() - startDate.getTime();
            progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          } else if (currentDate > endDate) {
            progress = 100;
          }
        }

        // Determine status display
        let statusDisplay = project.status;
        if (project.status === 'planning') statusDisplay = 'Planning';
        else if (project.status === 'active') statusDisplay = 'Active';

        return {
          id: project.id,
          name: project.name,
          status: statusDisplay,
          budget: project.budget || 0,
          progress: Math.round(progress),
          customer_name: project.customers?.name
        };
      }) || [];

      return projectSummaries;
    },
    staleTime: 3 * 60 * 1000, // Data stays fresh for 3 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  return {
    stats,
    recentActivity,
    activeProjects,
    stockAlerts: stats ? { low_stock_products: [], alert_count: stats.lowStockItemsCount } : null,
    isLoading: isLoadingStats || isLoadingActivity || isLoadingProjects,
    isLoadingStats,
    isLoadingActivity,
    isLoadingProjects,
    isLoadingAlerts: false, // No longer loading alerts separately
    error: statsError
  };
}
