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
      case 'approve_requisition': {
        const { requisition_id, approved_by, approved_quantities } = data;

        // Update requisition status
        const { data: requisition, error: reqError } = await supabaseClient
          .from('requisitions')
          .update({
            status: 'approved',
            approved_by,
            approved_date: new Date().toISOString()
          })
          .eq('id', requisition_id)
          .select('*, projects(name), user_profiles!requisitions_user_id_fkey(full_name)')
          .single();

        if (reqError) throw reqError;

        // Update approved quantities for each item
        if (approved_quantities && approved_quantities.length > 0) {
          for (const item of approved_quantities) {
            const { error: itemError } = await supabaseClient
              .from('requisition_items')
              .update({ quantity_approved: item.quantity_approved })
              .eq('id', item.item_id);

            if (itemError) throw itemError;
          }
        }

        // Create stock transactions for approved items
        const { data: requisitionItems } = await supabaseClient
          .from('requisition_items')
          .select('*, products(name)')
          .eq('requisition_id', requisition_id)
          .not('quantity_approved', 'is', null);

        const stockTransactions = [];
        for (const item of requisitionItems || []) {
          if (item.quantity_approved && item.quantity_approved > 0) {
            const { data: transaction, error: transError } = await supabaseClient
              .from('stock_transactions')
              .insert({
                product_id: item.product_id,
                project_id: requisition.project_id,
                transaction_type: 'pull',
                quantity: item.quantity_approved,
                user_id: requisition.user_id,
                unit_cost: item.unit_cost,
                notes: `Requisition ${requisition.requisition_number} - ${item.products?.name}`,
                transaction_date: new Date().toISOString()
              })
              .select()
              .single();

            if (transError) throw transError;
            stockTransactions.push(transaction);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            requisition,
            stock_transactions: stockTransactions,
            message: `Requisition ${requisition.requisition_number} approved successfully`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reject_requisition': {
        const { requisition_id, rejected_by, rejection_reason } = data;

        const { data: requisition, error } = await supabaseClient
          .from('requisitions')
          .update({
            status: 'rejected',
            approved_by: rejected_by,
            approved_date: new Date().toISOString(),
            notes: rejection_reason
          })
          .eq('id', requisition_id)
          .select('*, projects(name)')
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ 
            success: true,
            requisition,
            message: `Requisition ${requisition.requisition_number} rejected`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'approve_purchase_order': {
        const { po_id, approved_by } = data;

        const { data: purchaseOrder, error } = await supabaseClient
          .from('purchase_orders')
          .update({
            status: 'approved',
            approved_by,
            approved_date: new Date().toISOString()
          })
          .eq('id', po_id)
          .select('*, vendors(name), projects(name)')
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ 
            success: true,
            purchase_order: purchaseOrder,
            message: `Purchase Order ${purchaseOrder.po_number} approved`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'receive_purchase_order': {
        const { po_id, received_items, received_by } = data;

        // Update PO status to received
        const { data: purchaseOrder, error: poError } = await supabaseClient
          .from('purchase_orders')
          .update({
            status: 'received',
            actual_delivery_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', po_id)
          .select()
          .single();

        if (poError) throw poError;

        // Update received quantities and create stock transactions
        const stockTransactions = [];
        for (const item of received_items) {
          // Update received quantity
          const { error: itemError } = await supabaseClient
            .from('purchase_order_items')
            .update({ received_quantity: item.received_quantity })
            .eq('id', item.item_id);

          if (itemError) throw itemError;

          // Create stock transaction for received items
          if (item.received_quantity > 0) {
            const { data: transaction, error: transError } = await supabaseClient
              .from('stock_transactions')
              .insert({
                product_id: item.product_id,
                transaction_type: 'receive',
                quantity: item.received_quantity,
                user_id: received_by,
                unit_cost: item.unit_price,
                notes: `PO ${purchaseOrder.po_number} receipt`,
                transaction_date: new Date().toISOString()
              })
              .select()
              .single();

            if (transError) throw transError;
            stockTransactions.push(transaction);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            purchase_order: purchaseOrder,
            stock_transactions: stockTransactions,
            message: `Purchase Order ${purchaseOrder.po_number} received successfully`
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
    console.error('Error in approval-workflow function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});