import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, data } = await req.json();

    switch (action) {
      case 'transfer_inventory': {
        const { product_id, from_location_id, to_location_id, quantity, user_id, notes } = data;

        // Validate sufficient stock at source location
        const { data: product } = await supabaseClient
          .from('products')
          .select('current_stock, name')
          .eq('id', product_id)
          .eq('location_id', from_location_id)
          .single();

        if (!product || product.current_stock < quantity) {
          throw new Error('Insufficient stock for transfer');
        }

        // Create transfer out transaction
        const { data: transferOut, error: outError } = await supabaseClient
          .from('stock_transactions')
          .insert({
            product_id,
            transaction_type: 'pull',
            quantity,
            user_id,
            notes: `Transfer to location: ${notes}`,
            transaction_date: new Date().toISOString()
          })
          .select()
          .single();

        if (outError) throw outError;

        // Create transfer in transaction
        const { data: transferIn, error: inError } = await supabaseClient
          .from('stock_transactions')
          .insert({
            product_id,
            transaction_type: 'receive',
            quantity,
            user_id,
            notes: `Transfer from location: ${notes}`,
            transaction_date: new Date().toISOString()
          })
          .select()
          .single();

        if (inError) throw inError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            transfer_out: transferOut,
            transfer_in: transferIn,
            message: `Successfully transferred ${quantity} units of ${product.name}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cycle_count_reconciliation': {
        const { product_id, counted_quantity, user_id, notes } = data;

        // Get current system stock
        const { data: product } = await supabaseClient
          .from('products')
          .select('current_stock, name')
          .eq('id', product_id)
          .single();

        if (!product) throw new Error('Product not found');

        const variance = counted_quantity - product.current_stock;

        if (variance !== 0) {
          // Create adjustment transaction
          const { data: adjustment, error } = await supabaseClient
            .from('stock_transactions')
            .insert({
              product_id,
              transaction_type: variance > 0 ? 'receive' : 'pull',
              quantity: Math.abs(variance),
              user_id,
              notes: `Cycle count adjustment: ${notes}. Variance: ${variance}`,
              transaction_date: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;

          return new Response(
            JSON.stringify({ 
              success: true,
              adjustment,
              variance,
              message: `Adjusted ${product.name} by ${variance} units`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            variance: 0,
            message: `${product.name} count matches system - no adjustment needed`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_reorder_levels': {
        // Get all products that need reordering
        const { data: lowStockProducts, error } = await supabaseClient
          .from('products')
          .select('*, product_categories(name), inventory_locations(name)')
          .lt('current_stock', 'min_stock_level')
          .eq('is_active', true);

        if (error) throw error;

        // Calculate suggested reorder quantities
        const reorderSuggestions = lowStockProducts.map(product => ({
          product_id: product.id,
          product_name: product.name,
          current_stock: product.current_stock,
          min_stock_level: product.min_stock_level,
          max_stock_level: product.max_stock_level,
          suggested_order_quantity: product.max_stock_level - product.current_stock,
          category: product.product_categories?.name,
          location: product.inventory_locations?.name
        }));

        return new Response(
          JSON.stringify({ 
            success: true,
            products_needing_reorder: reorderSuggestions.length,
            reorder_suggestions: reorderSuggestions
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Error in inventory-operations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});