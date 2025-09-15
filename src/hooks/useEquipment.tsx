import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type Equipment = Database['public']['Tables']['equipment']['Row'];
type EquipmentInsert = Database['public']['Tables']['equipment']['Insert'];
type EquipmentUpdate = Database['public']['Tables']['equipment']['Update'];

export function useEquipment() {
  const { supabase } = useSupabaseClient();
  const queryClient = useQueryClient();

  // Fetch all equipment
  const {
    data: equipment = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create equipment
  const createEquipment = useMutation({
    mutationFn: async (equipment: EquipmentInsert) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Equipment created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create equipment: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update equipment
  const updateEquipment = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & EquipmentUpdate) => {
      const { data, error } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update equipment: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Check out equipment
  const checkOutEquipment = useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update({
          status: 'checked_out',
          checked_out_to: userId,
          checked_out_date: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Equipment checked out successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to check out equipment: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Return equipment
  const returnEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('equipment')
        .update({
          status: 'available',
          checked_out_to: null,
          checked_out_date: null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Equipment returned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to return equipment: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    equipment,
    isLoading,
    error,
    createEquipment,
    updateEquipment,
    checkOutEquipment,
    returnEquipment
  };
}