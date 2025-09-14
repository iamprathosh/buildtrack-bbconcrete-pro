import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts, useProductCategories, useInventoryLocations, ProductInsert } from "@/hooks/useProducts";
import { Plus } from "lucide-react";

interface AddProductDialogProps {
  children: React.ReactNode;
}

export function AddProductDialog({ children }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProductInsert>({
    name: "",
    sku: "",
    description: "",
    category_id: "",
    location_id: "",
    unit_of_measure: "",
    current_stock: 0,
    min_stock_level: 0,
    max_stock_level: 1000,
    supplier: "",
    location: "",
    mauc: 0,
    is_active: true
  });

  const { createProduct } = useProducts();
  const { data: categories } = useProductCategories();
  const { data: locations } = useInventoryLocations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.sku || !formData.unit_of_measure) {
      return;
    }

    try {
      await createProduct.mutateAsync(formData);
      setOpen(false);
      // Reset form
      setFormData({
        name: "",
        sku: "",
        description: "",
        category_id: "",
        location_id: "",
        unit_of_measure: "",
        current_stock: 0,
        min_stock_level: 0,
        max_stock_level: 1000,
        supplier: "",
        location: "",
        mauc: 0,
        is_active: true
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleInputChange = (field: keyof ProductInsert, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-montserrat">
            <Plus className="h-5 w-5 text-primary" />
            Add New Product
          </DialogTitle>
          <DialogDescription className="font-inter">
            Add a new product to the inventory system
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-inter font-semibold">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                required
                className="font-inter"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sku" className="font-inter font-semibold">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Enter SKU"
                required
                className="font-inter"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="font-inter font-semibold">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                className="font-inter"
                rows={3}
              />
            </div>
            
            {/* Category and Location */}
            <div className="space-y-2">
              <Label htmlFor="category" className="font-inter font-semibold">Category</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="location_id" className="font-inter font-semibold">Inventory Location</Label>
              <Select value={formData.location_id} onValueChange={(value) => handleInputChange('location_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Stock Information */}
            <div className="space-y-2">
              <Label htmlFor="unit_of_measure" className="font-inter font-semibold">Unit of Measure *</Label>
              <Input
                id="unit_of_measure"
                value={formData.unit_of_measure}
                onChange={(e) => handleInputChange('unit_of_measure', e.target.value)}
                placeholder="e.g., bags, pieces, tons"
                required
                className="font-inter"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current_stock" className="font-inter font-semibold">Current Stock</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => handleInputChange('current_stock', parseInt(e.target.value) || 0)}
                className="font-inter"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min_stock_level" className="font-inter font-semibold">Minimum Stock Level</Label>
              <Input
                id="min_stock_level"
                type="number"
                min="0"
                value={formData.min_stock_level}
                onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
                className="font-inter"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_stock_level" className="font-inter font-semibold">Maximum Stock Level</Label>
              <Input
                id="max_stock_level"
                type="number"
                min="0"
                value={formData.max_stock_level}
                onChange={(e) => handleInputChange('max_stock_level', parseInt(e.target.value) || 1000)}
                className="font-inter"
              />
            </div>
            
            {/* Supplier and Cost */}
            <div className="space-y-2">
              <Label htmlFor="supplier" className="font-inter font-semibold">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Enter supplier name"
                className="font-inter"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mauc" className="font-inter font-semibold">MAUC (Cost)</Label>
              <Input
                id="mauc"
                type="number"
                min="0"
                step="0.01"
                value={formData.mauc}
                onChange={(e) => handleInputChange('mauc', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="font-inter"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={createProduct.isPending}
              className="font-inter font-semibold"
            >
              {createProduct.isPending ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}