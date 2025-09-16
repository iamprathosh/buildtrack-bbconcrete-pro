import { useQuery } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';

export function useProjectTransactions(projectId?: string) {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ['project_transactions', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            unit_of_measure,
            product_categories (
              name
            )
          ),
          user_profiles (
            id,
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project transactions:', error);
        throw error;
      }

      return data?.map(transaction => ({
        ...transaction,
        product_name: transaction.products?.name || 'Unknown Product',
        product_sku: transaction.products?.sku || '',
        product_unit: transaction.products?.unit_of_measure || '',
        product_category: transaction.products?.product_categories?.name || 'Uncategorized',
        user_name: transaction.user_profiles?.full_name || 'Unknown User'
      })) || [];
    },
    enabled: !!projectId,
  });
}