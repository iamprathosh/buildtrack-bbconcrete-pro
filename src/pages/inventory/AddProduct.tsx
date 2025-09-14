import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminManagerGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    unit_of_measure: 'EA',
    supplier: '',
    min_stock_level: '0',
    max_stock_level: '1000',
    current_stock: '0',
    location: ''
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['product_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.name) {
      toast.error("SKU and Product Name are required");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          sku: formData.sku,
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id || null,
          unit_of_measure: formData.unit_of_measure,
          supplier: formData.supplier || null,
          min_stock_level: parseInt(formData.min_stock_level),
          max_stock_level: parseInt(formData.max_stock_level),
          current_stock: parseInt(formData.current_stock),
          location: formData.location || null
        });

      if (error) throw error;

      toast.success("Product created successfully");
      navigate('/inventory');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminManagerGuard showError>
      <AppLayout title="Add Product" subtitle="Create a new inventory item">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Enter SKU"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="uom">Unit of Measure</Label>
                    <Select value={formData.unit_of_measure} onValueChange={(value) => handleInputChange('unit_of_measure', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EA">Each (EA)</SelectItem>
                        <SelectItem value="LF">Linear Feet (LF)</SelectItem>
                        <SelectItem value="SF">Square Feet (SF)</SelectItem>
                        <SelectItem value="CF">Cubic Feet (CF)</SelectItem>
                        <SelectItem value="CY">Cubic Yards (CY)</SelectItem>
                        <SelectItem value="TON">Tons (TON)</SelectItem>
                        <SelectItem value="LB">Pounds (LB)</SelectItem>
                        <SelectItem value="GAL">Gallons (GAL)</SelectItem>
                        <SelectItem value="BAG">Bags (BAG)</SelectItem>
                        <SelectItem value="BOX">Boxes (BOX)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      placeholder="Enter supplier name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter storage location"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current_stock">Current Stock</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => handleInputChange('current_stock', e.target.value)}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_stock">Min Stock Level</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_stock">Max Stock Level</Label>
                    <Input
                      id="max_stock"
                      type="number"
                      value={formData.max_stock_level}
                      onChange={(e) => handleInputChange('max_stock_level', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AdminManagerGuard>
  );
}