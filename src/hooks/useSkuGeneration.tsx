import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseSkuGenerationReturn {
  generateSku: (categoryId?: string, categoryName?: string) => Promise<string>;
  isGenerating: boolean;
}

export function useSkuGeneration(): UseSkuGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSku = async (categoryId?: string, categoryName?: string): Promise<string> => {
    setIsGenerating(true);
    
    try {
      // If no category provided, use generic prefix
      let categoryPrefix = 'GEN';
      
      if (categoryName) {
        // Create category prefix from category name
        categoryPrefix = categoryName
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 3);
        
        // Ensure minimum 3 characters
        if (categoryPrefix.length < 3) {
          categoryPrefix = categoryPrefix.padEnd(3, '0');
        }
      }

      // Get the highest existing SKU number for this category prefix
      const { data: existingProducts, error } = await supabase
        .from('products')
        .select('sku')
        .like('sku', `${categoryPrefix}%`)
        .order('sku', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      let nextNumber = 1;

      if (existingProducts && existingProducts.length > 0) {
        const lastSku = existingProducts[0].sku;
        // Extract number from SKU (assuming format: PREFIX-XXX or PREFIXNNN)
        const numberMatch = lastSku.match(/(\d+)$/);
        if (numberMatch) {
          nextNumber = parseInt(numberMatch[1], 10) + 1;
        }
      }

      // Format the new SKU with zero-padded number
      const newSku = `${categoryPrefix}-${nextNumber.toString().padStart(3, '0')}`;
      
      return newSku;

    } catch (error) {
      console.error('Error generating SKU:', error);
      toast.error('Failed to generate SKU');
      return `GEN-${Date.now().toString().slice(-6)}`; // Fallback SKU
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateSku,
    isGenerating
  };
}