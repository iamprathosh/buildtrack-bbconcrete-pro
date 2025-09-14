import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category_id?: string;
  location_id?: string;
  unit_of_measure: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  supplier?: string;
  location?: string;
  mauc?: number;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductInsert {
  name: string;
  sku: string;
  description?: string;
  category_id?: string;
  location_id?: string;
  unit_of_measure: string;
  current_stock?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  supplier?: string;
  location?: string;
  mauc?: number;
  image_url?: string;
  is_active?: boolean;
}

export function useProducts() {
  const queryClient = useQueryClient();

  // Fetch all products
  const {
    data: products,
    isLoading,
    error
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(name),
          inventory_locations(name)
        `)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add product: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct
  };
}

// Hook for product categories
export function useProductCategories() {
  return useQuery({
    queryKey: ['product_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}

// Hook for inventory locations
export function useInventoryLocations() {
  return useQuery({
    queryKey: ['inventory_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_locations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}