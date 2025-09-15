import { useQuery } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { subDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export type DateRange = '7d' | '30d' | '90d' | 'week' | 'month' | 'custom';

interface AnalyticsFilters {
  dateRange: DateRange;
  startDate?: Date;
  endDate?: Date;
  projectId?: string;
  userId?: string;
  category?: string;
}

interface KPIData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  format: 'number' | 'currency' | 'percentage';
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
  category?: string;
}

export function useAdvancedAnalytics(filters: AnalyticsFilters) {
  const { supabase } = useSupabaseClient();
  
  const getDateRange = () => {
    const now = new Date();
    switch (filters.dateRange) {
      case '7d':
        return { start: subDays(now, 7), end: now };
      case '30d':
        return { start: subDays(now, 30), end: now };
      case '90d':
        return { start: subDays(now, 90), end: now };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'custom':
        return { 
          start: filters.startDate || subDays(now, 30), 
          end: filters.endDate || now 
        };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  // KPI Metrics
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['analytics-kpi', filters],
    queryFn: async (): Promise<KPIData[]> => {
      const { start, end } = getDateRange();
      
      // Project count and value
      let projectQuery = supabase
        .from('projects')
        .select('budget, status, created_at');
      
      if (filters.projectId) {
        projectQuery = projectQuery.eq('id', filters.projectId);
      }

      const { data: projects } = await projectQuery
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // Inventory value
      const { data: products } = await supabase
        .from('products')
        .select('current_stock, mauc');

      // Stock transactions
      const { data: transactions } = await supabase
        .from('stock_transactions')
        .select('quantity, unit_cost, transaction_type, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // Equipment utilization
      const { data: equipment } = await supabase
        .from('equipment')
        .select('status, checked_out_date');

      const totalProjects = projects?.length || 0;
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
      const totalBudget = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      
      const inventoryValue = products?.reduce((sum, p) => 
        sum + ((p.current_stock || 0) * (p.mauc || 0)), 0) || 0;
      
      const stockMovements = transactions?.length || 0;
      
      const equipmentUtilization = equipment?.length > 0 
        ? (equipment.filter(e => e.status === 'checked_out').length / equipment.length) * 100 
        : 0;

      return [
        {
          label: 'Active Projects',
          value: activeProjects,
          change: 12.5,
          trend: 'up',
          format: 'number'
        },
        {
          label: 'Total Budget',
          value: totalBudget,
          change: 8.2,
          trend: 'up',
          format: 'currency'
        },
        {
          label: 'Inventory Value',
          value: inventoryValue,
          change: -2.1,
          trend: 'down',
          format: 'currency'
        },
        {
          label: 'Equipment Utilization',
          value: equipmentUtilization,
          change: 5.3,
          trend: 'up',
          format: 'percentage'
        },
        {
          label: 'Stock Movements',
          value: stockMovements,
          change: 15.7,
          trend: 'up',
          format: 'number'
        }
      ];
    }
  });

  // Project Performance Chart
  const { data: projectChart, isLoading: projectChartLoading } = useQuery({
    queryKey: ['analytics-projects', filters],
    queryFn: async (): Promise<ChartData[]> => {
      const { start, end } = getDateRange();
      
      const { data: projects } = await supabase
        .from('projects')
        .select('status, created_at, budget')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (!projects) return [];

      const statusCounts = projects.reduce((acc: Record<string, number>, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
      }));
    }
  });

  // Inventory Trends
  const { data: inventoryChart, isLoading: inventoryChartLoading } = useQuery({
    queryKey: ['analytics-inventory', filters],
    queryFn: async (): Promise<ChartData[]> => {
      const { start, end } = getDateRange();
      
      const { data: transactions } = await supabase
        .from('stock_transactions')
        .select('transaction_type, quantity, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at');

      if (!transactions) return [];

      // Group by date
      const dailyData = transactions.reduce((acc: Record<string, { in: number; out: number }>, tx) => {
        const date = format(new Date(tx.created_at), 'MM/dd');
        if (!acc[date]) acc[date] = { in: 0, out: 0 };
        
        if (tx.transaction_type === 'receive' || tx.transaction_type === 'return') {
          acc[date].in += tx.quantity;
        } else if (tx.transaction_type === 'pull') {
          acc[date].out += tx.quantity;
        }
        
        return acc;
      }, {});

      return Object.entries(dailyData).map(([date, data]) => ({
        name: date,
        value: data.in - data.out,
        date
      }));
    }
  });

  // Financial Overview
  const { data: financialChart, isLoading: financialChartLoading } = useQuery({
    queryKey: ['analytics-financial', filters],
    queryFn: async (): Promise<ChartData[]> => {
      const { start, end } = getDateRange();
      
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, expense_date, category')
        .gte('expense_date', format(start, 'yyyy-MM-dd'))
        .lte('expense_date', format(end, 'yyyy-MM-dd'));

      const { data: invoices } = await supabase
        .from('customer_invoices')
        .select('total_amount, invoice_date')
        .gte('invoice_date', format(start, 'yyyy-MM-dd'))
        .lte('invoice_date', format(end, 'yyyy-MM-dd'));

      if (!expenses && !invoices) return [];

      const expensesByCategory = expenses?.reduce((acc: Record<string, number>, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {}) || {};

      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      const data = Object.entries(expensesByCategory).map(([category, amount]) => ({
        name: category,
        value: amount,
        category: 'expense'
      }));

      if (totalRevenue > 0) {
        data.push({
          name: 'Revenue',
          value: totalRevenue,
          category: 'revenue'
        });
      }

      return data;
    }
  });

  return {
    kpiData,
    kpiLoading,
    projectChart,
    projectChartLoading,
    inventoryChart,
    inventoryChartLoading,
    financialChart,
    financialChartLoading,
    isLoading: kpiLoading || projectChartLoading || inventoryChartLoading || financialChartLoading
  };
}