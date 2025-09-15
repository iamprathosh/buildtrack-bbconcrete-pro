import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type Vendor = Database['public']['Tables']['vendors']['Row'];
type VendorInsert = Database['public']['Tables']['vendors']['Insert'];
type VendorUpdate = Database['public']['Tables']['vendors']['Update'];

export function useVendors() {
  const queryClient = useQueryClient();

  // Fetch all vendors
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch a single vendor by ID
  const useVendorById = (id: string) => useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Create a new vendor
  const createVendor = useMutation({
    mutationFn: async (vendor: VendorInsert) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert(vendor)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create vendor: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update a vendor
  const updateVendor = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & VendorUpdate) => {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update vendor: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete a vendor
  const deleteVendor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete vendor: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    vendors,
    isLoading,
    useVendorById,
    createVendor,
    updateVendor,
    deleteVendor
  };
}
