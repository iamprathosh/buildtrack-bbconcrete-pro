import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
      case 'bulk_import_products': {
        const { products } = data;
        
        // Validate and process product data
        const processedProducts = products.map((product: any) => ({
          name: product.name || 'Unnamed Product',
          sku: product.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          unit_of_measure: product.unit_of_measure || 'each',
          current_stock: parseInt(product.current_stock) || 0,
          min_stock_level: parseInt(product.min_stock_level) || 0,
          max_stock_level: parseInt(product.max_stock_level) || 1000,
          mauc: parseFloat(product.mauc) || 0.00,
          category_id: product.category_id,
          location_id: product.location_id,
          supplier: product.supplier,
          description: product.description,
          is_active: product.is_active !== false
        }));

        const { data: insertedProducts, error } = await supabaseClient
          .from('products')
          .insert(processedProducts)
          .select();

        if (error) throw error;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully imported ${insertedProducts.length} products`,
            data: insertedProducts 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'generate_requisition_number': {
        // Generate unique requisition number
        const { data: lastReq } = await supabaseClient
          .from('requisitions')
          .select('requisition_number')
          .order('created_at', { ascending: false })
          .limit(1);

        let nextNumber = 1;
        if (lastReq && lastReq.length > 0) {
          const lastNumber = parseInt(lastReq[0].requisition_number.split('-')[1]);
          nextNumber = lastNumber + 1;
        }

        const requisitionNumber = `REQ-${nextNumber.toString().padStart(3, '0')}`;

        return new Response(
          JSON.stringify({ 
            success: true, 
            requisition_number: requisitionNumber 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'generate_po_number': {
        // Generate unique purchase order number
        const { data: lastPO } = await supabaseClient
          .from('purchase_orders')
          .select('po_number')
          .order('created_at', { ascending: false })
          .limit(1);

        let nextNumber = 1;
        if (lastPO && lastPO.length > 0) {
          const lastNumber = parseInt(lastPO[0].po_number.split('-')[1]);
          nextNumber = lastNumber + 1;
        }

        const poNumber = `PO-${nextNumber.toString().padStart(4, '0')}`;

        return new Response(
          JSON.stringify({ 
            success: true, 
            po_number: poNumber 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'stock_level_alerts': {
        // Get products with low stock levels - using a custom SQL query since PostgREST doesn't support column comparisons directly
        const { data: lowStockProducts, error } = await supabaseClient.rpc(
          'get_low_stock_products'
        );

        // If the RPC function doesn't exist, fallback to a basic query
        if (error && error.message.includes('function get_low_stock_products')) {
          // Fallback: get all products and filter on the client side
          const { data: allProducts, error: productsError } = await supabaseClient
            .from('products')
            .select('*')
            .eq('is_active', true);
            
          if (productsError) throw productsError;
          
          const filteredProducts = allProducts?.filter(
            product => product.current_stock < product.min_stock_level
          ) || [];
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              low_stock_products: filteredProducts,
              alert_count: filteredProducts.length
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (error) throw error;

        return new Response(
          JSON.stringify({ 
            success: true, 
            low_stock_products: lowStockProducts || [],
            alert_count: (lowStockProducts || []).length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'project_cost_summary': {
        const { project_id } = data;
        
        // Calculate total project costs
        const { data: expenses } = await supabaseClient
          .from('expenses')
          .select('amount')
          .eq('project_id', project_id);

        const { data: stockTransactions } = await supabaseClient
          .from('stock_transactions')
          .select('quantity, unit_cost')
          .eq('project_id', project_id)
          .eq('transaction_type', 'pull');

        const expenseTotal = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;
        const materialTotal = stockTransactions?.reduce((sum, trans) => 
          sum + (trans.quantity * (trans.unit_cost || 0)), 0) || 0;

        return new Response(
          JSON.stringify({ 
            success: true, 
            expense_total: expenseTotal,
            material_total: materialTotal,
            grand_total: expenseTotal + materialTotal
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
    console.error('Error in business-logic function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});