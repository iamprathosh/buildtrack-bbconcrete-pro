import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row'];
type PurchaseOrderInsert = Database['public']['Tables']['purchase_orders']['Insert'];
type PurchaseOrderUpdate = Database['public']['Tables']['purchase_orders']['Update'];
type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row'];

export function usePurchaseOrders() {
  const { supabase } = useSupabaseClient();
  const queryClient = useQueryClient();

  // Fetch all purchase orders with vendor details
  const {
    data: purchaseOrders = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['purchase_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          vendor:vendors(name),
          project:projects(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch single purchase order with items
  const fetchPurchaseOrder = (id: string) => useQuery({
    queryKey: ['purchase_order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          vendor:vendors(*),
          project:projects(*),
          purchase_order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Create purchase order
  const createPurchaseOrder = useMutation({
    mutationFn: async (po: PurchaseOrderInsert) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(po)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create purchase order: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update purchase order
  const updatePurchaseOrder = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & PurchaseOrderUpdate) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      toast({
        title: "Success",
        description: "Purchase order updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update purchase order: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Add item to purchase order
  const addPurchaseOrderItem = useMutation({
    mutationFn: async (item: Database['public']['Tables']['purchase_order_items']['Insert']) => {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      toast({
        title: "Success",
        description: "Item added to purchase order",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    purchaseOrders,
    isLoading,
    error,
    fetchPurchaseOrder,
    createPurchaseOrder,
    updatePurchaseOrder,
    addPurchaseOrderItem
  };
}