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
      case 'inventory_valuation_report': {
        const { date_filter = 'current' } = data;

        const { data: products, error } = await supabaseClient
          .from('products')
          .select(`
            *,
            product_categories(name),
            inventory_locations(name)
          `)
          .eq('is_active', true);

        if (error) throw error;

        const valuationReport = products.map(product => ({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          category: product.product_categories?.name || 'Uncategorized',
          location: product.inventory_locations?.name || 'Unknown',
          current_stock: product.current_stock,
          unit_cost: product.mauc || 0,
          total_value: (product.current_stock || 0) * (product.mauc || 0),
          min_stock_level: product.min_stock_level,
          max_stock_level: product.max_stock_level,
          stock_status: product.current_stock <= product.min_stock_level ? 'Low' : 
                       product.current_stock >= product.max_stock_level ? 'Overstocked' : 'Normal'
        }));

        const totalValue = valuationReport.reduce((sum, item) => sum + item.total_value, 0);
        const lowStockItems = valuationReport.filter(item => item.stock_status === 'Low').length;

        return new Response(
          JSON.stringify({ 
            success: true,
            report_date: new Date().toISOString(),
            total_inventory_value: totalValue,
            total_products: valuationReport.length,
            low_stock_items: lowStockItems,
            inventory_details: valuationReport
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'project_cost_report': {
        const { project_id, date_from, date_to } = data;

        let projectQuery = supabaseClient
          .from('projects')
          .select(`
            *,
            customers(name),
            expenses(amount, expense_date, category, description),
            stock_transactions(quantity, unit_cost, transaction_date, products(name))
          `);

        if (project_id) {
          projectQuery = projectQuery.eq('id', project_id);
        }

        const { data: projects, error } = await projectQuery;
        if (error) throw error;

        const projectReports = projects.map(project => {
          let expenses = project.expenses || [];
          let materialCosts = project.stock_transactions || [];

          // Filter by date if provided
          if (date_from || date_to) {
            if (date_from) {
              expenses = expenses.filter(exp => exp.expense_date >= date_from);
              materialCosts = materialCosts.filter(trans => trans.transaction_date >= date_from);
            }
            if (date_to) {
              expenses = expenses.filter(exp => exp.expense_date <= date_to);
              materialCosts = materialCosts.filter(trans => trans.transaction_date <= date_to);
            }
          }

          const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
          const totalMaterialCosts = materialCosts.reduce((sum, trans) => 
            sum + (trans.quantity * (trans.unit_cost || 0)), 0);

          return {
            project_id: project.id,
            project_name: project.name,
            customer: project.customers?.name,
            job_number: project.job_number,
            status: project.status,
            budget: project.budget,
            total_expenses: totalExpenses,
            total_material_costs: totalMaterialCosts,
            total_project_costs: totalExpenses + totalMaterialCosts,
            budget_utilization: project.budget ? 
              ((totalExpenses + totalMaterialCosts) / project.budget * 100) : 0,
            expense_breakdown: expenses.reduce((acc, exp) => {
              acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
              return acc;
            }, {}),
            material_usage: materialCosts.map(trans => ({
              product_name: trans.products?.name,
              quantity_used: trans.quantity,
              unit_cost: trans.unit_cost,
              total_cost: trans.quantity * (trans.unit_cost || 0)
            }))
          };
        });

        return new Response(
          JSON.stringify({ 
            success: true,
            report_date: new Date().toISOString(),
            projects: projectReports
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'equipment_utilization_report': {
        const { date_from, date_to } = data;

        const { data: equipment, error } = await supabaseClient
          .from('equipment')
          .select('*');

        if (error) throw error;

        const utilizationReport = equipment.map(item => {
          const isCheckedOut = item.status === 'checked_out';
          const daysSinceCheckout = isCheckedOut && item.checked_out_date ? 
            Math.floor((new Date().getTime() - new Date(item.checked_out_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;

          return {
            equipment_id: item.id,
            equipment_name: item.name,
            equipment_number: item.equipment_number,
            category: item.category,
            status: item.status,
            checked_out_to: item.checked_out_to,
            checked_out_date: item.checked_out_date,
            days_checked_out: daysSinceCheckout,
            purchase_cost: item.purchase_cost,
            current_value: item.current_value,
            location: item.location
          };
        });

        const totalEquipment = equipment.length;
        const checkedOutEquipment = equipment.filter(item => item.status === 'checked_out').length;
        const utilizationRate = totalEquipment > 0 ? (checkedOutEquipment / totalEquipment * 100) : 0;

        return new Response(
          JSON.stringify({ 
            success: true,
            report_date: new Date().toISOString(),
            total_equipment: totalEquipment,
            checked_out_equipment: checkedOutEquipment,
            utilization_rate: utilizationRate,
            equipment_details: utilizationReport
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
    console.error('Error in report-generator function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});