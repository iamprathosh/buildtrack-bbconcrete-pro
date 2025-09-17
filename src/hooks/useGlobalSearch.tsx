import { useQuery } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';

export interface SearchResult {
  id: string;
  type: 'product' | 'project' | 'customer' | 'vendor' | 'purchase_order';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
}

export function useGlobalSearch(query: string, enabled: boolean = true) {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ['global_search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchTerm = query.trim().toLowerCase();
      const results: SearchResult[] = [];

      try {
        // Search Products - optimized query
        const { data: products } = await supabase
          .from('products')
          .select(`
            id, name, sku, current_stock,
            product_categories(name)
          `)
          .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
          .eq('is_active', true)
          .limit(5);

        products?.forEach(product => {
          results.push({
            id: product.id,
            type: 'product',
            title: product.name,
            subtitle: `SKU: ${product.sku}`,
            description: `Stock: ${product.current_stock || 0}`,
            url: `/inventory/${product.id}`,
            metadata: {
              category: product.product_categories?.name,
              stock: product.current_stock
            }
          });
        });

        // Search Projects - optimized
        const { data: projects } = await supabase
          .from('projects')
          .select(`
            id, name, job_number, status,
            customers(name)
          `)
          .or(`name.ilike.%${searchTerm}%,job_number.ilike.%${searchTerm}%`)
          .limit(5);

        projects?.forEach(project => {
          results.push({
            id: project.id,
            type: 'project',
            title: project.name,
            subtitle: `Job #${project.job_number}`,
            description: project.customers?.name || `Status: ${project.status}`,
            url: `/projects/${project.id}`,
            metadata: {
              status: project.status,
              customer: project.customers?.name
            }
          });
        });

        // Search Customers
        const { data: customers } = await supabase
          .from('customers')
          .select('id, name, contact, email, phone')
          .or(`name.ilike.%${searchTerm}%,contact.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
          .limit(3);

        customers?.forEach(customer => {
          results.push({
            id: customer.id,
            type: 'customer',
            title: customer.name,
            subtitle: customer.contact || 'Customer',
            description: customer.email || customer.phone,
            url: `/customers`,
            metadata: {
              contact: customer.contact,
              email: customer.email,
              phone: customer.phone
            }
          });
        });

        // Search Vendors
        const { data: vendors } = await supabase
          .from('vendors')
          .select('id, name, contact_person, email, phone')
          .or(`name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .limit(3);

        vendors?.forEach(vendor => {
          results.push({
            id: vendor.id,
            type: 'vendor',
            title: vendor.name,
            subtitle: vendor.contact_person || 'Vendor',
            description: vendor.email || vendor.phone,
            url: `/vendors/${vendor.id}`,
            metadata: {
              contact: vendor.contact_person,
              email: vendor.email,
              phone: vendor.phone
            }
          });
        });

        // Search Purchase Orders
        const { data: purchaseOrders } = await supabase
          .from('purchase_orders')
          .select(`
            id, po_number, status, total_amount,
            vendors(name)
          `)
          .or(`po_number.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
          .limit(3);

        purchaseOrders?.forEach(po => {
          results.push({
            id: po.id,
            type: 'purchase_order',
            title: `PO ${po.po_number}`,
            subtitle: po.vendors?.name || 'Purchase Order',
            description: `Status: ${po.status} • $${po.total_amount?.toLocaleString() || '0'}`,
            url: `/procurement`,
            metadata: {
              status: po.status,
              vendor: po.vendors?.name,
              amount: po.total_amount
            }
          });
        });

        // Sort results by relevance (exact matches first, then partial matches)
        return results.sort((a, b) => {
          const aExactMatch = a.title.toLowerCase().includes(searchTerm);
          const bExactMatch = b.title.toLowerCase().includes(searchTerm);
          
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          
          return a.title.localeCompare(b.title);
        });

      } catch (error) {
        console.error('Search error:', error);
        return [];
      }
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000 // 5 minutes cache
  });
}