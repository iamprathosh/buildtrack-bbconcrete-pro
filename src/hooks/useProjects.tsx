import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  job_number: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
  budget?: number;
  location?: string;
  project_manager_id?: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
  };
  user_profiles?: {
    id: string;
    full_name: string;
  };
}

export function useProjects() {
  const queryClient = useQueryClient();

  // Fetch all projects
  const {
    data: projects,
    isLoading,
    error
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customers (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      return data as any[];
    },
  });

  // Get project expenses to calculate spent amount
  const { data: projectExpenses } = useQuery({
    queryKey: ['project_expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('project_id, amount')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching project expenses:', error);
        throw error;
      }

      // Group expenses by project_id and sum amounts
      const expensesByProject = data?.reduce((acc, expense) => {
        if (!acc[expense.project_id]) {
          acc[expense.project_id] = 0;
        }
        acc[expense.project_id] += expense.amount || 0;
        return acc;
      }, {} as Record<string, number>) || {};

      return expensesByProject;
    },
    enabled: !!projects?.length,
  });

  // Get project assignments to count team members
  const { data: projectAssignments } = useQuery({
    queryKey: ['project_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_assignments')
        .select('project_id, user_id')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching project assignments:', error);
        throw error;
      }

      // Group assignments by project_id and count users
      const assignmentsByProject = data?.reduce((acc, assignment) => {
        if (!acc[assignment.project_id]) {
          acc[assignment.project_id] = 0;
        }
        acc[assignment.project_id]++;
        return acc;
      }, {} as Record<string, number>) || {};

      return assignmentsByProject;
    },
    enabled: !!projects?.length,
  });

  // Get project managers
  const { data: projectManagers } = useQuery({
    queryKey: ['project_managers'],
    queryFn: async () => {
      if (!projects?.length) return {};

      const managerIds = projects
        .map(p => p.project_manager_id)
        .filter(Boolean) as string[];

      if (managerIds.length === 0) return {};

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', managerIds);

      if (error) {
        console.error('Error fetching project managers:', error);
        return {};
      }

      // Convert to object for easier lookup
      return data?.reduce((acc, manager) => {
        acc[manager.id] = manager;
        return acc;
      }, {} as Record<string, { id: string; full_name: string }>) || {};
    },
    enabled: !!projects?.length,
  });

  // Create project mutation
  const createProject = useMutation({
    mutationFn: async (projectData: any) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      });
      console.error('Error creating project:', error);
    },
  });

  // Update project mutation
  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project.",
        variant: "destructive",
      });
      console.error('Error updating project:', error);
    },
  });

  // Delete project mutation
  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
      console.error('Error deleting project:', error);
    },
  });

  // Calculate progress based on project status and dates
  const calculateProgress = (project: Project) => {
    if (project.status === 'completed') return 100;
    if (project.status === 'planning') return 5;
    if (project.status === 'on_hold') return 0;
    
    // For active projects, calculate based on time elapsed
    if (project.start_date && project.end_date) {
      const now = new Date();
      const start = new Date(project.start_date);
      const end = new Date(project.end_date);
      
      if (now < start) return 0;
      if (now > end) return 100;
      
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    }
    
    return 50; // Default for active projects without dates
  };

  // Enhanced projects with calculated fields
  const enhancedProjects = projects?.map(project => ({
    ...project,
    progress: calculateProgress(project),
    spent: projectExpenses?.[project.id] || 0,
    teamSize: projectAssignments?.[project.id] || 0,
    client: project.customers?.name || 'Unknown Client',
    manager: projectManagers?.[project.project_manager_id || '']?.full_name || 'Unassigned',
  })) || [];

  return {
    projects: enhancedProjects,
    rawProjects: projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    projectExpenses,
    projectAssignments,
  };
}

// Hook for customers (for project creation)
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, contact')
        .order('name');

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data;
    },
  });
}

// Hook for users (for project manager assignment)
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role')
        .in('role', ['super_admin', 'project_manager'])
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data;
    },
  });
}