import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useProducts, useProductCategories, useInventoryLocations, Product } from "@/hooks/useProducts";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditProductDialogProps {
  product: Product;
  children: React.ReactNode;
}

export function EditProductDialog({ product, children }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { updateProduct } = useProducts();
  const { data: categories } = useProductCategories();
  const { data: locations } = useInventoryLocations();

  // Initialize form data when dialog opens or product changes
  useEffect(() => {
    if (open && product) {
      setFormData({
        id: product.id,
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        category_id: product.category_id || "",
        location_id: product.location_id || "",
        unit_of_measure: product.unit_of_measure || "",
        current_stock: product.current_stock || 0,
        min_stock_level: product.min_stock_level || 0,
        max_stock_level: product.max_stock_level || 1000,
        supplier: product.supplier || "",
        location: product.location || "",
        mauc: product.mauc || 0,
        image_url: product.image_url || "",
        is_active: product.is_active !== false
      });
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.unit_of_measure) {
      toast.error("Name, SKU, and Unit of Measure are required");
      return;
    }

    setIsLoading(true);

    try {
      await updateProduct.mutateAsync(formData as Product & { id: string });
      setOpen(false);
      toast.success("Product updated successfully");
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-montserrat">
            <Edit className="h-5 w-5 text-primary" />
            Edit Product: {product.name}
          </DialogTitle>
          <DialogDescription className="font-inter">
            Update product information and image
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-inter font-semibold">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
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
                  value={formData.sku || ""}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Enter SKU"
                  required
                  className="font-inter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="font-inter font-semibold">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  className="font-inter"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-inter font-semibold">Category</Label>
                  <Select 
                    value={formData.category_id || ""} 
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
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
                  <Label htmlFor="location_id" className="font-inter font-semibold">Location</Label>
                  <Select 
                    value={formData.location_id || ""} 
                    onValueChange={(value) => handleInputChange('location_id', value)}
                  >
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit_of_measure" className="font-inter font-semibold">Unit of Measure *</Label>
                <Input
                  id="unit_of_measure"
                  value={formData.unit_of_measure || ""}
                  onChange={(e) => handleInputChange('unit_of_measure', e.target.value)}
                  placeholder="e.g., bags, pieces, tons"
                  required
                  className="font-inter"
                />
              </div>
            </div>
            
            {/* Right Column - Stock & Image */}
            <div className="space-y-4">
              <div className="space-y-2">
                <ImageUpload
                  onImageUpload={(url) => handleInputChange('image_url', url)}
                  currentImage={formData.image_url}
                  label="Product Image"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_stock" className="font-inter font-semibold">Current Stock</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    min="0"
                    value={formData.current_stock || 0}
                    onChange={(e) => handleInputChange('current_stock', parseInt(e.target.value) || 0)}
                    className="font-inter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min_stock_level" className="font-inter font-semibold">Min Stock</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    min="0"
                    value={formData.min_stock_level || 0}
                    onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
                    className="font-inter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_stock_level" className="font-inter font-semibold">Max Stock</Label>
                  <Input
                    id="max_stock_level"
                    type="number"
                    min="0"
                    value={formData.max_stock_level || 1000}
                    onChange={(e) => handleInputChange('max_stock_level', parseInt(e.target.value) || 1000)}
                    className="font-inter"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier" className="font-inter font-semibold">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier || ""}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="Enter supplier name"
                  className="font-inter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="font-inter font-semibold">Storage Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter storage location"
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
                  value={formData.mauc || 0}
                  onChange={(e) => handleInputChange('mauc', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="font-inter"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || updateProduct.isPending}
              className="font-inter font-semibold"
            >
              {isLoading || updateProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}