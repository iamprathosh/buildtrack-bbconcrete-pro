import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { useMemo } from 'react';

type Equipment = Database['public']['Tables']['equipment']['Row'];
type EquipmentInsert = Database['public']['Tables']['equipment']['Insert'];
type EquipmentUpdate = Database['public']['Tables']['equipment']['Update'];
type EquipmentMaintenance = Database['public']['Tables']['equipment_maintenance']['Row'];
type MaintenanceInsert = Database['public']['Tables']['equipment_maintenance']['Insert'];

interface EquipmentWithMaintenance extends Equipment {
  next_maintenance?: string;
  last_maintenance?: string;
  maintenance_due_days?: number;
}

export const useEquipment = () => {
  const { supabase } = useSupabaseClient();
  const queryClient = useQueryClient();

  // Fetch all equipment with latest maintenance data
  const {
    data: equipment = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['equipment'],
    queryFn: async (): Promise<EquipmentWithMaintenance[]> => {
      // Fetch equipment and maintenance data in a single query with joins
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_maintenance (
            id,
            status,
            scheduled_date,
            completed_date,
            next_maintenance_date
          )
        `)
        .order('equipment_number', { ascending: true });

      if (equipmentError) throw equipmentError;

      // Process the joined data
      const equipmentWithMaintenance = equipmentData.map((eq) => {
        const maintenanceData = eq.equipment_maintenance || [];
        const nextMaintenance = maintenanceData.find(m => m.status === 'scheduled');
        const lastCompleted = maintenanceData.find(m => m.status === 'completed');

        return {
          ...eq,
          next_maintenance: nextMaintenance?.scheduled_date || nextMaintenance?.next_maintenance_date,
          last_maintenance: lastCompleted?.completed_date,
          maintenance_due_days: nextMaintenance?.scheduled_date 
            ? Math.ceil((new Date(nextMaintenance.scheduled_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
            : undefined
        };
      });

      return equipmentWithMaintenance;
    }
  });

  // Fetch equipment maintenance records
  const {
    data: maintenanceRecords = [],
    isLoading: isLoadingMaintenance
  } = useQuery({
    queryKey: ['equipment_maintenance'],
    queryFn: async (): Promise<EquipmentMaintenance[]> => {
      const { data, error } = await supabase
        .from('equipment_maintenance')
        .select(`
          *,
          equipment (
            equipment_number,
            name,
            category
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Create equipment mutation
  const createEquipment = useMutation({
    mutationFn: async (equipmentData: EquipmentInsert) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert([equipmentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Equipment added successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add equipment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update equipment mutation
  const updateEquipment = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & EquipmentUpdate) => {
      console.log('Updating equipment:', { id, updates });
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      console.log('Update data being sent:', updateData);
      
      const { data, error } = await supabase
        .from('equipment')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Update successful:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Equipment updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update equipment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Check out equipment mutation
  const checkOutEquipment = useMutation({
    mutationFn: async ({ id, userId, notes }: { id: string; userId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update({
          status: 'checked_out',
          checked_out_to: userId,
          checked_out_date: new Date().toISOString(),
          notes: notes,
          updated_at: new Date().toISOString()
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
        description: "Equipment checked out successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to check out equipment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Return equipment mutation
  const returnEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('equipment')
        .update({
          status: 'available',
          checked_out_to: null,
          checked_out_date: null,
          updated_at: new Date().toISOString()
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
        description: "Equipment returned successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to return equipment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Schedule maintenance mutation
  const scheduleMaintenance = useMutation({
    mutationFn: async (maintenanceData: MaintenanceInsert) => {
      const { data, error } = await supabase
        .from('equipment_maintenance')
        .insert([maintenanceData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment_maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Maintenance scheduled successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to schedule maintenance: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Complete maintenance mutation
  const completeMaintenance = useMutation({
    mutationFn: async ({ id, cost, notes }: { id: string; cost?: number; notes?: string }) => {
      const { data, error } = await supabase
        .from('equipment_maintenance')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0], // Date only
          cost,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment_maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Maintenance completed successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to complete maintenance: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete equipment mutation (admin only)
  const deleteEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Equipment deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete equipment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    equipment,
    isLoading,
    error,
    maintenanceRecords,
    isLoadingMaintenance,
    createEquipment,
    updateEquipment,
    checkOutEquipment,
    returnEquipment,
    scheduleMaintenance,
    completeMaintenance,
    deleteEquipment
  };
};

// Hook for getting equipment statistics
export const useEquipmentStats = () => {
  const { equipment } = useEquipment();

  const stats = useMemo(() => {
    const total = equipment.length;
    const available = equipment.filter(eq => eq.status === 'available').length;
    const checkedOut = equipment.filter(eq => eq.status === 'checked_out').length;
    const maintenance = equipment.filter(eq => eq.status === 'maintenance').length;
    const retired = equipment.filter(eq => eq.status === 'retired').length;
    const totalValue = equipment.reduce((sum, eq) => sum + (eq.current_value || 0), 0);
    const maintenanceDue = equipment.filter(eq => 
      eq.maintenance_due_days !== undefined && eq.maintenance_due_days <= 30
    ).length;

    return {
      total,
      available,
      checkedOut,
      maintenance,
      retired,
      totalValue,
      maintenanceDue
    };
  }, [equipment]);

  return stats;
};

// Hook for getting equipment by ID
export const useEquipmentById = (id: string) => {
  const { supabase } = useSupabaseClient();
  
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async (): Promise<EquipmentWithMaintenance | null> => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get maintenance history
      const { data: maintenanceData } = await supabase
        .from('equipment_maintenance')
        .select('*')
        .eq('equipment_id', id)
        .order('scheduled_date', { ascending: false });

      const nextMaintenance = maintenanceData?.find(m => m.status === 'scheduled');
      const lastCompleted = maintenanceData?.find(m => m.status === 'completed');

      return {
        ...data,
        next_maintenance: nextMaintenance?.scheduled_date || nextMaintenance?.next_maintenance_date,
        last_maintenance: lastCompleted?.completed_date,
        maintenance_due_days: nextMaintenance?.scheduled_date 
          ? Math.ceil((new Date(nextMaintenance.scheduled_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
          : undefined
      };
    },
    enabled: !!id
  });
};
