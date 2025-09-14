-- Fix foreign key relationships for requisitions and purchase orders

-- Add foreign key constraint for requisitions to projects  
ALTER TABLE public.requisitions 
ADD CONSTRAINT fk_requisitions_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id);

-- Add foreign key constraint for purchase orders to projects
ALTER TABLE public.purchase_orders 
ADD CONSTRAINT fk_purchase_orders_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id);

-- Add foreign key constraint for purchase orders to vendors
ALTER TABLE public.purchase_orders 
ADD CONSTRAINT fk_purchase_orders_vendor 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);

-- Add foreign key constraint for requisition_items to products
ALTER TABLE public.requisition_items 
ADD CONSTRAINT fk_requisition_items_product 
FOREIGN KEY (product_id) REFERENCES public.products(id);

-- Add foreign key constraint for purchase_order_items to products
ALTER TABLE public.purchase_order_items 
ADD CONSTRAINT fk_purchase_order_items_product 
FOREIGN KEY (product_id) REFERENCES public.products(id);