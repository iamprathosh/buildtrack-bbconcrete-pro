import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type Requisition = Database['public']['Tables']['requisitions']['Row'];
type RequisitionInsert = Database['public']['Tables']['requisitions']['Insert'];
type RequisitionUpdate = Database['public']['Tables']['requisitions']['Update'];

export function useRequisitions() {
  const queryClient = useQueryClient();

  // Fetch all requisitions
  const {
    data: requisitions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['requisitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requisitions')
        .select(`
          *,
          project:projects(name),
          requisition_items(
            *,
            product:products(name, sku)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's own requisitions
  const {
    data: myRequisitions = [],
    isLoading: isLoadingMy
  } = useQuery({
    queryKey: ['my_requisitions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('requisitions')
        .select(`
          *,
          project:projects(name),
          requisition_items(
            *,
            product:products(name, sku)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create requisition
  const createRequisition = useMutation({
    mutationFn: async (requisition: RequisitionInsert) => {
      const { data, error } = await supabase
        .from('requisitions')
        .insert(requisition)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['my_requisitions'] });
      toast({
        title: "Success",
        description: "Requisition submitted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit requisition: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update requisition (approval/rejection)
  const updateRequisition = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & RequisitionUpdate) => {
      const { data, error } = await supabase
        .from('requisitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['my_requisitions'] });
      toast({
        title: "Success",
        description: "Requisition updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update requisition: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Add requisition item
  const addRequisitionItem = useMutation({
    mutationFn: async (item: Database['public']['Tables']['requisition_items']['Insert']) => {
      const { data, error } = await supabase
        .from('requisition_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['my_requisitions'] });
      toast({
        title: "Success",
        description: "Item added to requisition",
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
    requisitions,
    myRequisitions,
    isLoading,
    isLoadingMy,
    error,
    createRequisition,
    updateRequisition,
    addRequisitionItem
  };
}