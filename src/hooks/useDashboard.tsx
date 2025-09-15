import { useQuery } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';

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
  
  // We'll fetch low stock data directly instead of using the business logic function

  // Fetch dashboard statistics with optimized parallel queries
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['dashboard_stats'],
    enabled: isAuthenticated,
    queryFn: async (): Promise<DashboardStats> => {
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

  // Fetch recent activity from audit logs (optimized)
  const {
    data: recentActivity,
    isLoading: isLoadingActivity
  } = useQuery({
    queryKey: ['recent_activity'],
    enabled: isAuthenticated,
    queryFn: async (): Promise<RecentActivity[]> => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, action, table_name, new_values, timestamp')
        .order('timestamp', { ascending: false })
        .limit(5); // Reduced from 10 to 5 for faster loading

      if (error) {
        // If audit_logs fails, return empty array instead of crashing
        console.warn('Failed to load recent activity:', error);
        return [];
      }

      // Transform audit logs into readable activity
      const activities: RecentActivity[] = data?.map((log) => {
        let description = '';
        let type: 'success' | 'warning' | 'info' = 'info';

        switch (log.table_name) {
          case 'products':
            if (log.action === 'INSERT') {
              description = `New product added: ${log.new_values?.name || 'Unknown'}`;
              type = 'success';
            } else if (log.action === 'UPDATE') {
              description = `Product updated: ${log.new_values?.name || 'Unknown'}`;
              type = 'info';
            }
            break;
          case 'projects':
            if (log.action === 'INSERT') {
              description = `New project created: ${log.new_values?.name || 'Unknown'}`;
              type = 'success';
            } else if (log.action === 'UPDATE') {
              description = `Project updated: ${log.new_values?.name || 'Unknown'}`;
              type = 'info';
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
          case 'stock_transactions':
            if (log.action === 'INSERT') {
              const transactionType = log.new_values?.transaction_type;
              if (transactionType === 'out') {
                description = `Materials issued for project`;
                type = 'info';
              } else if (transactionType === 'in') {
                description = `Stock received`;
                type = 'success';
              }
            }
            break;
          default:
            description = `${log.table_name} ${log.action.toLowerCase()}`;
            type = 'info';
        }

        return {
          id: log.id,
          action: log.action,
          description,
          timestamp: log.timestamp,
          type
        };
      }) || [];

      return activities;
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes (much less frequent)
  });

  // Fetch active projects summary
  const {
    data: activeProjects,
    isLoading: isLoadingProjects
  } = useQuery({
    queryKey: ['dashboard_active_projects'],
    enabled: isAuthenticated,
    queryFn: async (): Promise<ProjectSummary[]> => {
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
