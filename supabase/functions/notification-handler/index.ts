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
      case 'send_low_stock_alerts': {
        // Get products with low stock
        const { data: lowStockProducts, error } = await supabaseClient
          .from('products')
          .select('*, product_categories(name), inventory_locations(name)')
          .lt('current_stock', 'min_stock_level')
          .eq('is_active', true);

        if (error) throw error;

        // Create notifications for each low stock product
        const notifications = lowStockProducts.map(product => ({
          title: 'Low Stock Alert',
          message: `${product.name} is running low (${product.current_stock} remaining)`,
          type: 'warning',
          metadata: { product_id: product.id, stock_level: product.current_stock }
        }));

        return new Response(
          JSON.stringify({ 
            success: true, 
            alerts_sent: notifications.length,
            low_stock_products: lowStockProducts 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'notify_requisition_status': {
        const { requisition_id, status, user_id } = data;
        
        const { data: requisition } = await supabaseClient
          .from('requisitions')
          .select('*, projects(name)')
          .eq('id', requisition_id)
          .single();

        if (!requisition) throw new Error('Requisition not found');

        const notification = {
          title: 'Requisition Update',
          message: `Requisition ${requisition.requisition_number} for ${requisition.projects?.name} has been ${status}`,
          type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
          user_id: requisition.user_id,
          metadata: { requisition_id, status }
        };

        return new Response(
          JSON.stringify({ success: true, notification }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'notify_equipment_due_maintenance': {
        // Check for equipment due for maintenance
        const today = new Date().toISOString().split('T')[0];
        
        const { data: dueMaintenance, error } = await supabaseClient
          .from('equipment_maintenance')
          .select('*, equipment(name, equipment_number)')
          .eq('status', 'scheduled')
          .lte('scheduled_date', today);

        if (error) throw error;

        const notifications = dueMaintenance.map(maintenance => ({
          title: 'Maintenance Due',
          message: `${maintenance.equipment?.name} (${maintenance.equipment?.equipment_number}) is due for ${maintenance.maintenance_type}`,
          type: 'warning',
          metadata: { 
            equipment_id: maintenance.equipment_id,
            maintenance_id: maintenance.id,
            maintenance_type: maintenance.maintenance_type
          }
        }));

        return new Response(
          JSON.stringify({ 
            success: true, 
            maintenance_alerts: notifications.length,
            due_maintenance: dueMaintenance 
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
    console.error('Error in notification-handler function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});