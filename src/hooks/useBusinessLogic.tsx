import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { toast } from '@/hooks/use-toast';

interface BusinessLogicParams {
  action: string;
  data?: any;
}

export function useBusinessLogic() {
  const { supabase } = useSupabaseClient();
  const queryClient = useQueryClient();

  // Call business logic edge function
  const callBusinessLogic = useMutation({
    mutationFn: async ({ action, data }: BusinessLogicParams) => {
      const { data: result, error } = await supabase.functions.invoke('business-logic', {
        body: { action, data }
      });
      
      if (error) throw error;
      return result;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Business logic operation failed: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Get stock level alerts
  const {
    data: stockAlerts,
    isLoading: isLoadingAlerts,
    error: stockAlertsError
  } = useQuery({
    queryKey: ['stock_alerts'],
    queryFn: async () => {
      try {
        const result = await callBusinessLogic.mutateAsync({
          action: 'stock_level_alerts'
        });
        return result;
      } catch (error) {
        console.warn('Stock alerts function failed, returning empty result:', error);
        // Return a safe fallback instead of throwing
        return {
          success: true,
          low_stock_products: [],
          alert_count: 0
        };
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 1, // Only retry once on failure
  });

  // Generate unique numbers
  const generateRequisitionNumber = async () => {
    return await callBusinessLogic.mutateAsync({
      action: 'generate_requisition_number'
    });
  };

  const generatePONumber = async () => {
    return await callBusinessLogic.mutateAsync({
      action: 'generate_po_number'
    });
  };

  // Bulk import products
  const bulkImportProducts = async (products: any[]) => {
    return await callBusinessLogic.mutateAsync({
      action: 'bulk_import_products',
      data: { products }
    });
  };

  // Get project cost summary
  const getProjectCostSummary = async (projectId: string) => {
    return await callBusinessLogic.mutateAsync({
      action: 'project_cost_summary',
      data: { project_id: projectId }
    });
  };

  return {
    stockAlerts,
    isLoadingAlerts,
    generateRequisitionNumber,
    generatePONumber,
    bulkImportProducts,
    getProjectCostSummary,
    callBusinessLogic
  };
}