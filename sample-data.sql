-- Insert sample data for testing the BuildTrack application

-- Insert sample inventory locations
INSERT INTO public.inventory_locations (name, address_line_1, city, state, zip_code) VALUES
('Main Warehouse', '123 Industrial Blvd', 'Springfield', 'IL', '62701'),
('Downtown Storage', '456 Commerce St', 'Springfield', 'IL', '62702'),
('North Facility', '789 North Ave', 'Chicago', 'IL', '60601');

-- Insert sample equipment
INSERT INTO public.equipment (name, equipment_number, category, model, status, location, purchase_cost, current_value) VALUES
('Concrete Mixer - Large', 'EQ-001', 'Machinery', 'CM-3000', 'available', 'Main Warehouse', 15000.00, 12000.00),
('Power Drill Set', 'EQ-002', 'Tools', 'PD-Pro', 'available', 'Downtown Storage', 450.00, 350.00),
('Safety Harness', 'EQ-003', 'Safety', 'SH-Premium', 'available', 'Main Warehouse', 85.00, 75.00),
('Welding Machine', 'EQ-004', 'Machinery', 'WM-Industrial', 'maintenance', 'Main Warehouse', 2500.00, 2000.00),
('Mini Excavator', 'EQ-005', 'Heavy Machinery', 'EX-Compact', 'available', 'North Facility', 45000.00, 40000.00);

-- Insert sample purchase orders
INSERT INTO public.purchase_orders (po_number, vendor_id, status, order_date, expected_delivery_date, subtotal, tax_amount, total_amount, created_by) 
SELECT 
    'PO-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    v.id,
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'draft'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'sent'
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'received'
        ELSE 'closed'
    END,
    CURRENT_DATE - INTERVAL '10 days' + (ROW_NUMBER() OVER()) * INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '5 days' + (ROW_NUMBER() OVER()) * INTERVAL '1 day',
    1000.00 + (ROW_NUMBER() OVER()) * 500,
    (1000.00 + (ROW_NUMBER() OVER()) * 500) * 0.08,
    (1000.00 + (ROW_NUMBER() OVER()) * 500) * 1.08,
    'user-' || (ROW_NUMBER() OVER())::text
FROM public.vendors v
LIMIT 5;

-- Insert sample vendor invoices
INSERT INTO public.vendor_invoices (invoice_number, vendor_id, invoice_date, due_date, subtotal, tax_amount, total_amount, status)
SELECT 
    'INV-' || LPAD((ROW_NUMBER() OVER())::text, 4, '0'),
    v.id,
    CURRENT_DATE - INTERVAL '5 days' + (ROW_NUMBER() OVER()) * INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '25 days' + (ROW_NUMBER() OVER()) * INTERVAL '1 day',
    800.00 + (ROW_NUMBER() OVER()) * 300,
    (800.00 + (ROW_NUMBER() OVER()) * 300) * 0.08,
    (800.00 + (ROW_NUMBER() OVER()) * 300) * 1.08,
    CASE 
        WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'pending'
        WHEN ROW_NUMBER() OVER() % 3 = 2 THEN 'approved'
        ELSE 'paid'
    END
FROM public.vendors v
LIMIT 4;

-- Insert sample requisitions
INSERT INTO public.requisitions (requisition_number, project_id, user_id, status, priority, requested_date, notes)
SELECT 
    'REQ-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    p.id,
    'user-' || ((ROW_NUMBER() OVER() % 3) + 1)::text,
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'pending'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'approved'
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'fulfilled'
        ELSE 'rejected'
    END,
    CASE 
        WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'normal'
        WHEN ROW_NUMBER() OVER() % 3 = 2 THEN 'high'
        ELSE 'urgent'
    END,
    CURRENT_DATE - INTERVAL '3 days' + (ROW_NUMBER() OVER()) * INTERVAL '1 day',
    'Materials needed for project phase ' || (ROW_NUMBER() OVER())::text
FROM public.projects p
LIMIT 6;

-- Insert sample customer invoices
INSERT INTO public.customer_invoices (invoice_number, customer_id, project_id, invoice_date, due_date, subtotal, tax_rate, payment_terms, created_by)
SELECT 
    'CI-' || LPAD((ROW_NUMBER() OVER())::text, 4, '0'),
    c.id,
    p.id,
    CURRENT_DATE - INTERVAL '7 days' + (ROW_NUMBER() OVER()) * INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '23 days' + (ROW_NUMBER() OVER()) * INTERVAL '2 days',
    5000.00 + (ROW_NUMBER() OVER()) * 1500,
    8.5,
    'Net 30',
    'user-manager'
FROM public.customers c
JOIN public.projects p ON p.customer_id = c.id
LIMIT 3;