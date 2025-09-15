import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export function useCustomers() {
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const useCustomerById = (id: string) => useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const createCustomer = useMutation({
    mutationFn: async (customer: CustomerInsert) => {
      // Generate next customer number if not provided
      let customerData = { ...customer };
      if (!customerData.customer_number) {
        const { data: maxNumber } = await supabase
          .from('customers')
          .select('customer_number')
          .order('customer_number', { ascending: false })
          .limit(1)
          .single();
        
        customerData.customer_number = (maxNumber?.customer_number || 1000) + 1;
      }
      
      const { data, error } = await supabase.from('customers').insert(customerData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: "Success", description: "Customer created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create customer: ${error.message}`, variant: "destructive" });
    }
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & CustomerUpdate) => {
      const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast({ title: "Success", description: "Customer updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update customer: ${error.message}`, variant: "destructive" });
    }
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: "Success", description: "Customer deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete customer: ${error.message}`, variant: "destructive" });
    }
  });

  return {
    customers,
    isLoading,
    useCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
}
