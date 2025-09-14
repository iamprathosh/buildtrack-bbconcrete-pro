import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Database } from "@/integrations/supabase/types";

type TransactionType = Database['public']['Enums']['transaction_type'];
type Product = Database['public']['Tables']['products']['Row'];

interface StockTransactionFormProps {
  product: Product;
  onSuccess?: () => void;
}

export function StockTransactionForm({ product, onSuccess }: StockTransactionFormProps) {
  const { userId, isWorker, isAdminOrManager } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: '' as TransactionType,
    quantity: '',
    project_id: '',
    notes: '',
    unit_cost: ''
  });

  // Fetch user's assigned projects (for workers) or all projects (for admin/managers)
  const { data: projects } = useQuery({
    queryKey: ['user_projects', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      if (isWorker()) {
        // Workers can only see their assigned projects
        const { data: assignments, error: assignmentError } = await supabase
          .from('project_assignments')
          .select('project_id')
          .eq('user_id', userId)
          .eq('is_active', true);
        
        if (assignmentError) throw assignmentError;
        
        if (assignments.length === 0) return [];
        
        const projectIds = assignments.map(a => a.project_id);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds)
          .order('name');
          
        if (error) throw error;
        return data;
      } else {
        // Admin/managers can see all projects
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('name');
          
        if (error) throw error;
        return data;
      }
    },
    enabled: !!userId
  });

  const getAvailableTransactionTypes = (): { value: TransactionType; label: string; icon: React.ReactNode }[] => {
    const baseTypes = [
      { value: 'pull' as TransactionType, label: 'Stock Out', icon: <Minus className="h-4 w-4" /> },
      { value: 'return' as TransactionType, label: 'Return', icon: <RotateCcw className="h-4 w-4" /> }
    ];

    // Only admin/managers can receive stock
    if (isAdminOrManager()) {
      baseTypes.push({ value: 'receive' as TransactionType, label: 'Stock In', icon: <Plus className="h-4 w-4" /> });
    }

    return baseTypes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    if (!formData.transaction_type || !formData.quantity) {
      toast.error("Transaction type and quantity are required");
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    // Check if worker is trying to stock out more than available
    if (formData.transaction_type === 'pull' && quantity > (product.current_stock || 0)) {
      toast.error(`Cannot stock out more than available (${product.current_stock})`);
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('stock_transactions')
        .insert({
          product_id: product.id,
          user_id: userId,
          transaction_type: formData.transaction_type,
          quantity: quantity,
          project_id: formData.project_id || null,
          notes: formData.notes || null,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null
        });

      if (error) throw error;

      toast.success(`${formData.transaction_type === 'pull' ? 'Stock out' : formData.transaction_type === 'return' ? 'Return' : 'Stock in'} recorded successfully`);
      
      // Reset form
      setFormData({
        transaction_type: '' as TransactionType,
        quantity: '',
        project_id: '',
        notes: '',
        unit_cost: ''
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error recording transaction:', error);
      toast.error(error instanceof Error ? error.message : "Failed to record transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Record Stock Transaction</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current Stock:</span>
          <Badge variant={product.current_stock === 0 ? "destructive" : "secondary"}>
            {product.current_stock} {product.unit_of_measure}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="transaction_type">Transaction Type *</Label>
            <Select 
              value={formData.transaction_type} 
              onValueChange={(value: TransactionType) => setFormData(prev => ({ ...prev, transaction_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableTransactionTypes().map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit_cost">Unit Cost</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: e.target.value }))}
                placeholder="Enter unit cost"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="project">Project</Label>
            <Select 
              value={formData.project_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project (optional)" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} ({project.job_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Recording..." : "Record Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}