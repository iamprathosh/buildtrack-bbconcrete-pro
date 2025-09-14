-- Phase 1: Create missing database tables for BuildTrack

-- Create equipment table
CREATE TABLE public.equipment (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    equipment_number TEXT NOT NULL UNIQUE,
    category TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_cost NUMERIC(10,2),
    current_value NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'maintenance', 'retired')),
    location TEXT,
    checked_out_to TEXT, -- user_id who has it checked out
    checked_out_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_locations table
CREATE TABLE public.inventory_locations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address_line_1 TEXT,
    address_line_2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requisitions table
CREATE TABLE public.requisitions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    requisition_number TEXT NOT NULL UNIQUE,
    project_id UUID NOT NULL,
    user_id TEXT NOT NULL, -- worker who submitted
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    requested_date DATE,
    approved_by TEXT, -- manager user_id
    approved_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requisition_items table
CREATE TABLE public.requisition_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    requisition_id UUID NOT NULL REFERENCES public.requisitions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity_requested INTEGER NOT NULL,
    quantity_approved INTEGER,
    unit_cost NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    po_number TEXT NOT NULL UNIQUE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id),
    project_id UUID REFERENCES public.projects(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'received', 'closed', 'cancelled')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal NUMERIC(10,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) DEFAULT 0,
    terms TEXT,
    notes TEXT,
    created_by TEXT NOT NULL, -- user_id
    approved_by TEXT, -- manager user_id
    approved_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor_invoices table
CREATE TABLE public.vendor_invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id),
    purchase_order_id UUID REFERENCES public.purchase_orders(id),
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'overdue', 'cancelled')),
    payment_terms TEXT,
    notes TEXT,
    invoice_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(vendor_id, invoice_number)
);

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    vendor_id UUID REFERENCES public.vendors(id),
    receipt_url TEXT,
    is_billable BOOLEAN DEFAULT false,
    submitted_by TEXT NOT NULL, -- user_id
    approved_by TEXT, -- manager user_id
    approved_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_invoices table
CREATE TABLE public.customer_invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    project_id UUID NOT NULL REFERENCES public.projects(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal NUMERIC(10,2) NOT NULL,
    tax_rate NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) GENERATED ALWAYS AS (subtotal * tax_rate / 100) STORED,
    total_amount NUMERIC(10,2) GENERATED ALWAYS AS (subtotal + (subtotal * tax_rate / 100)) STORED,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    payment_terms TEXT,
    notes TEXT,
    sent_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    created_by TEXT NOT NULL, -- user_id
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_invoice_items table
CREATE TABLE public.customer_invoice_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_invoice_id UUID NOT NULL REFERENCES public.customer_invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment_maintenance table
CREATE TABLE public.equipment_maintenance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('scheduled', 'repair', 'inspection', 'calibration')),
    description TEXT NOT NULL,
    scheduled_date DATE,
    completed_date DATE,
    cost NUMERIC(10,2),
    performed_by TEXT, -- user_id or external contractor
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    next_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table for system tracking
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_equipment_status ON public.equipment(status);
CREATE INDEX idx_equipment_checked_out_to ON public.equipment(checked_out_to);
CREATE INDEX idx_requisitions_status ON public.requisitions(status);
CREATE INDEX idx_requisitions_project ON public.requisitions(project_id);
CREATE INDEX idx_purchase_orders_vendor ON public.purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_vendor_invoices_status ON public.vendor_invoices(status);
CREATE INDEX idx_expenses_project ON public.expenses(project_id);
CREATE INDEX idx_customer_invoices_customer ON public.customer_invoices(customer_id);
CREATE INDEX idx_customer_invoices_project ON public.customer_invoices(project_id);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);

-- Add foreign key constraints for existing tables
ALTER TABLE public.products ADD COLUMN location_id UUID REFERENCES public.inventory_locations(id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_locations_updated_at
    BEFORE UPDATE ON public.inventory_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requisitions_updated_at
    BEFORE UPDATE ON public.requisitions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_invoices_updated_at
    BEFORE UPDATE ON public.vendor_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_invoices_updated_at
    BEFORE UPDATE ON public.customer_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_maintenance_updated_at
    BEFORE UPDATE ON public.equipment_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all new tables
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for equipment
CREATE POLICY "authenticated_can_read_equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "admin_manager_can_manage_equipment" ON public.equipment FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for inventory_locations
CREATE POLICY "authenticated_can_read_locations" ON public.inventory_locations FOR SELECT USING (true);
CREATE POLICY "admin_manager_can_manage_locations" ON public.inventory_locations FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for requisitions
CREATE POLICY "users_can_view_own_requisitions" ON public.requisitions FOR SELECT USING (user_id = auth.uid()::text OR is_admin_or_manager());
CREATE POLICY "workers_can_create_requisitions" ON public.requisitions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "admin_manager_can_manage_requisitions" ON public.requisitions FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for requisition_items
CREATE POLICY "users_can_view_own_requisition_items" ON public.requisition_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.requisitions WHERE id = requisition_id AND (user_id = auth.uid()::text OR is_admin_or_manager()))
);
CREATE POLICY "users_can_manage_own_requisition_items" ON public.requisition_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.requisitions WHERE id = requisition_id AND user_id = auth.uid()::text)
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.requisitions WHERE id = requisition_id AND user_id = auth.uid()::text)
);
CREATE POLICY "admin_manager_can_manage_requisition_items" ON public.requisition_items FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for purchase_orders
CREATE POLICY "authenticated_can_read_purchase_orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "admin_manager_can_manage_purchase_orders" ON public.purchase_orders FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for purchase_order_items
CREATE POLICY "authenticated_can_read_po_items" ON public.purchase_order_items FOR SELECT USING (true);
CREATE POLICY "admin_manager_can_manage_po_items" ON public.purchase_order_items FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for vendor_invoices
CREATE POLICY "authenticated_can_read_vendor_invoices" ON public.vendor_invoices FOR SELECT USING (true);
CREATE POLICY "admin_manager_can_manage_vendor_invoices" ON public.vendor_invoices FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for expenses
CREATE POLICY "users_can_view_project_expenses" ON public.expenses FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.project_assignments WHERE project_id = expenses.project_id AND user_id = auth.uid()::text AND is_active = true) OR is_admin_or_manager()
);
CREATE POLICY "users_can_create_expenses" ON public.expenses FOR INSERT WITH CHECK (
    submitted_by = auth.uid()::text AND 
    EXISTS (SELECT 1 FROM public.project_assignments WHERE project_id = expenses.project_id AND user_id = auth.uid()::text AND is_active = true)
);
CREATE POLICY "admin_manager_can_manage_expenses" ON public.expenses FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for customer_invoices
CREATE POLICY "authenticated_can_read_customer_invoices" ON public.customer_invoices FOR SELECT USING (true);
CREATE POLICY "admin_manager_can_manage_customer_invoices" ON public.customer_invoices FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for customer_invoice_items
CREATE POLICY "authenticated_can_read_customer_invoice_items" ON public.customer_invoice_items FOR SELECT USING (true);
CREATE POLICY "admin_manager_can_manage_customer_invoice_items" ON public.customer_invoice_items FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for equipment_maintenance
CREATE POLICY "authenticated_can_read_equipment_maintenance" ON public.equipment_maintenance FOR SELECT USING (true);
CREATE POLICY "admin_manager_can_manage_equipment_maintenance" ON public.equipment_maintenance FOR ALL USING (is_admin_or_manager()) WITH CHECK (is_admin_or_manager());

-- Create RLS policies for audit_logs
CREATE POLICY "admin_can_read_audit_logs" ON public.audit_logs FOR SELECT USING (is_admin_or_manager());

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('documents', 'documents', false),
('equipment-images', 'equipment-images', true),
('receipts', 'receipts', false),
('invoices', 'invoices', false),
('reports', 'reports', false);

-- Create storage policies for documents bucket
CREATE POLICY "authenticated_can_view_documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "admin_manager_can_manage_documents" ON storage.objects FOR ALL USING (bucket_id = 'documents' AND is_admin_or_manager()) WITH CHECK (bucket_id = 'documents' AND is_admin_or_manager());

-- Create storage policies for equipment-images bucket  
CREATE POLICY "public_can_view_equipment_images" ON storage.objects FOR SELECT USING (bucket_id = 'equipment-images');
CREATE POLICY "admin_manager_can_manage_equipment_images" ON storage.objects FOR ALL USING (bucket_id = 'equipment-images' AND is_admin_or_manager()) WITH CHECK (bucket_id = 'equipment-images' AND is_admin_or_manager());

-- Create storage policies for receipts bucket
CREATE POLICY "users_can_view_own_receipts" ON storage.objects FOR SELECT USING (
    bucket_id = 'receipts' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR is_admin_or_manager())
);
CREATE POLICY "users_can_upload_receipts" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "admin_manager_can_manage_receipts" ON storage.objects FOR ALL USING (bucket_id = 'receipts' AND is_admin_or_manager()) WITH CHECK (bucket_id = 'receipts' AND is_admin_or_manager());

-- Create storage policies for invoices bucket
CREATE POLICY "authenticated_can_view_invoices" ON storage.objects FOR SELECT USING (bucket_id = 'invoices');
CREATE POLICY "admin_manager_can_manage_invoices" ON storage.objects FOR ALL USING (bucket_id = 'invoices' AND is_admin_or_manager()) WITH CHECK (bucket_id = 'invoices' AND is_admin_or_manager());

-- Create storage policies for reports bucket
CREATE POLICY "authenticated_can_view_reports" ON storage.objects FOR SELECT USING (bucket_id = 'reports');
CREATE POLICY "admin_manager_can_manage_reports" ON storage.objects FOR ALL USING (bucket_id = 'reports' AND is_admin_or_manager()) WITH CHECK (bucket_id = 'reports' AND is_admin_or_manager());