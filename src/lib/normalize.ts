// Type-safe data normalization utilities for BuildTrack

export interface NormalizedEquipment {
  id: string;
  name: string;
  equipment_number: string;
  category: string;
  status: string;
  location: string;
  checked_out_to: string | null;
  purchase_cost: number;
  nextMaintenance?: string;
}

export interface NormalizedPurchaseOrder {
  id: string;
  po_number: string;
  vendor: string;
  project: string;
  items_count: number;
  total_amount: number;
  order_date: string;
  status: string;
}

export interface NormalizedRequisition {
  id: string;
  requisition_number: string;
  project_name: string;
  items_count: number;
  status: string;
  created_at: string;
  notes?: string;
  priority?: string;
  user_id: string;
}

export const normalizeEquipment = (equipment: any[]): NormalizedEquipment[] => {
  return equipment.map(item => ({
    id: item.id,
    name: item.name,
    equipment_number: item.equipment_number || item.id,
    category: item.category || item.type || 'N/A',
    status: item.status,
    location: item.location || 'N/A',
    checked_out_to: item.checked_out_to || item.checkedOutBy || null,
    purchase_cost: item.purchase_cost || item.purchasePrice || 0,
    nextMaintenance: item.nextMaintenance
  }));
};

export const normalizePurchaseOrders = (orders: any[]): NormalizedPurchaseOrder[] => {
  return orders.map(order => ({
    id: order.id,
    po_number: order.po_number || order.id,
    vendor: typeof order.vendor === 'string' ? order.vendor : order.vendor?.name || 'N/A',
    project: typeof order.project === 'string' ? order.project : order.project?.name || 'N/A',
    items_count: order.purchase_order_items?.length || order.items?.length || 0,
    total_amount: order.total_amount || order.totalAmount || 0,
    order_date: order.order_date || order.orderDate,
    status: order.status
  }));
};

export const normalizeRequisitions = (requisitions: any[]): NormalizedRequisition[] => {
  return requisitions.map(req => ({
    id: req.id,
    requisition_number: req.requisition_number || req.id,
    project_name: req.project?.name || 'N/A',
    items_count: req.requisition_items?.length || req.items?.length || 0,
    status: req.status,
    created_at: req.created_at || req.requestDate,
    notes: req.notes,
    priority: req.priority,
    user_id: req.user_id
  }));
};