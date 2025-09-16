import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Package, Search, Plus, Filter, Download, AlertTriangle, TrendingUp, TrendingDown, Edit } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { EditProductDialog } from "@/components/inventory/EditProductDialog";
import { toast } from "@/hooks/use-toast";

const InventoryOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filters, setFilters] = useState({
    stockStatus: [] as string[],
    locations: [] as string[],
    stockRange: { min: "", max: "" }
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { products, isLoading } = useProducts();

  const getStatusBadge = (quantity: number, minStock: number) => {
    if (quantity <= minStock * 0.5) {
      return { variant: "destructive", label: "Critical", icon: AlertTriangle };
    } else if (quantity <= minStock) {
      return { variant: "warning", label: "Low Stock", icon: TrendingDown };
    } else if (quantity > minStock * 2) {
      return { variant: "success", label: "High Stock", icon: TrendingUp };
    } else {
      return { variant: "outline", label: "Adequate", icon: Package };
    }
  };

  // Get unique categories from products
  const categories = ["all", ...(products ? Array.from(new Set(products.map(p => (p as any).product_categories?.name).filter(Boolean))) : [])];
  
  // Get unique locations from products
  const locations = products ? Array.from(new Set(products.map(p => p.location || (p as any).inventory_locations?.name).filter(Boolean))) : [];
  
  const applyFilters = (items: typeof products) => {
    if (!items) return [];
    
    return items.filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const categoryName = (item as any).product_categories?.name;
      const matchesCategory = selectedCategory === "all" || categoryName === selectedCategory;
      
      // Stock status filter
      const statusBadge = getStatusBadge(item.current_stock, item.min_stock_level);
      const matchesStockStatus = filters.stockStatus.length === 0 || filters.stockStatus.includes(statusBadge.label);
      
      // Location filter
      const itemLocation = item.location || (item as any).inventory_locations?.name;
      const matchesLocation = filters.locations.length === 0 || filters.locations.includes(itemLocation);
      
      // Stock range filter
      const matchesStockRange = (!filters.stockRange.min || item.current_stock >= parseInt(filters.stockRange.min)) &&
                               (!filters.stockRange.max || item.current_stock <= parseInt(filters.stockRange.max));
      
      return matchesSearch && matchesCategory && matchesStockStatus && matchesLocation && matchesStockRange;
    });
  };
  
  const filteredItems = applyFilters(products);

  const handleFilterChange = (type: string, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [type]: checked 
        ? [...prev[type as keyof typeof prev] as string[], value]
        : (prev[type as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleStockRangeChange = (field: 'min' | 'max', value: string) => {
    setFilters(prev => ({
      ...prev,
      stockRange: { ...prev.stockRange, [field]: value }
    }));
  };

  const clearFilters = () => {
    setFilters({
      stockStatus: [],
      locations: [],
      stockRange: { min: "", max: "" }
    });
  };

  const totalValue = products?.reduce((sum, item) => sum + (item.current_stock * (item.mauc || 0)), 0) || 0;
  const lowStockItems = products?.filter(item => item.current_stock <= item.min_stock_level).length || 0;
  const criticalItems = products?.filter(item => item.current_stock <= item.min_stock_level * 0.5).length || 0;

  const exportToCSV = () => {
    if (!filteredItems.length) {
      toast({
        title: "No data to export",
        description: "There are no inventory items to export.",
        variant: "destructive"
      });
      return;
    }

    const csvHeaders = [
      "SKU",
      "Item Name", 
      "Category",
      "Quantity",
      "Unit of Measure",
      "Location",
      "Unit Cost",
      "Total Value",
      "Min Stock Level",
      "Max Stock Level",
      "Status"
    ];

    const csvData = filteredItems.map(item => {
      const statusBadge = getStatusBadge(item.current_stock, item.min_stock_level);
      const totalValue = item.current_stock * (item.mauc || 0);
      
      return [
        item.sku,
        item.name,
        (item as any).product_categories?.name || 'Uncategorized',
        item.current_stock,
        item.unit_of_measure,
        item.location || (item as any).inventory_locations?.name || 'N/A',
        item.mauc?.toFixed(2) || '0.00',
        totalValue.toFixed(2),
        item.min_stock_level,
        item.max_stock_level,
        statusBadge.label
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${filteredItems.length} inventory items to CSV.`
    });
  };

  return (
    <AppLayout title="Inventory Overview" subtitle="Manage your construction materials and supplies">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    {products?.length || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-montserrat font-bold text-warning">
                    {lowStockItems}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Critical</p>
                  <p className="text-2xl font-montserrat font-bold text-destructive">
                    {criticalItems}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4 flex-1 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-inter"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="capitalize bg-background hover:bg-accent">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {(filters.stockStatus.length > 0 || filters.locations.length > 0 || filters.stockRange.min || filters.stockRange.max) && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {filters.stockStatus.length + filters.locations.length + (filters.stockRange.min ? 1 : 0) + (filters.stockRange.max ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-background border border-border shadow-lg z-50" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium font-montserrat">Filters</h4>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                  
                  {/* Stock Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-inter font-medium">Stock Status</Label>
                    <div className="space-y-2">
                      {["Critical", "Low Stock", "Adequate", "High Stock"].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.stockStatus.includes(status)}
                            onCheckedChange={(checked) => 
                              handleFilterChange("stockStatus", status, checked as boolean)
                            }
                          />
                          <Label htmlFor={`status-${status}`} className="text-sm font-inter">
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location Filter */}
                  {locations.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-inter font-medium">Location</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {locations.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={`location-${location}`}
                              checked={filters.locations.includes(location)}
                              onCheckedChange={(checked) => 
                                handleFilterChange("locations", location, checked as boolean)
                              }
                            />
                            <Label htmlFor={`location-${location}`} className="text-sm font-inter">
                              {location}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-inter font-medium">Stock Quantity Range</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={filters.stockRange.min}
                          onChange={(e) => handleStockRangeChange("min", e.target.value)}
                          className="text-sm font-inter"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Max"
                          type="number"
                          value={filters.stockRange.max}
                          onChange={(e) => handleStockRangeChange("max", e.target.value)}
                          className="text-sm font-inter"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <AddProductDialog>
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </AddProductDialog>
          </div>
        </div>

        {/* Inventory Table */}
        <Card className="gradient-card border-0 shadow-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-montserrat">
              <Package className="h-5 w-5 text-primary" />
              Inventory Items ({filteredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground font-inter">Loading inventory...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-inter font-semibold">SKU</TableHead>
                    <TableHead className="font-inter font-semibold">Item Name</TableHead>
                    <TableHead className="font-inter font-semibold">Category</TableHead>
                    <TableHead className="font-inter font-semibold">Quantity</TableHead>
                    <TableHead className="font-inter font-semibold">Location</TableHead>
                    <TableHead className="font-inter font-semibold">Unit Cost</TableHead>
                    <TableHead className="font-inter font-semibold">Total Value</TableHead>
                    <TableHead className="font-inter font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const statusBadge = getStatusBadge(item.current_stock, item.min_stock_level);
                    const StatusIcon = statusBadge.icon;
                    const totalValue = item.current_stock * (item.mauc || 0);
                    
                    return (
                      <TableRow 
                        key={item.id} 
                        className="hover:bg-secondary/50 cursor-pointer"
                        onClick={() => handleProductClick(item)}
                      >
                        <TableCell className="font-inter font-medium">{item.sku}</TableCell>
                        <TableCell className="font-inter">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-inter">
                            {(item as any).product_categories?.name || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-inter">
                          {item.current_stock} {item.unit_of_measure}
                        </TableCell>
                        <TableCell className="font-inter">{item.location || (item as any).inventory_locations?.name || 'N/A'}</TableCell>
                        <TableCell className="font-inter">${item.mauc?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="font-inter font-medium">
                          ${totalValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={statusBadge.variant as any}
                            className="flex items-center gap-1 w-fit"
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Product Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="font-montserrat text-xl">
                  Product Details
                </DialogTitle>
                <EditProductDialog product={selectedProduct}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Product
                  </Button>
                </EditProductDialog>
              </div>
            </DialogHeader>
            
            {selectedProduct && (
              <div className="space-y-6">
                {/* Product Image and Basic Info */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border">
                      {selectedProduct.image_url ? (
                        <img
                          src={selectedProduct.image_url}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <Package className="h-16 w-16 mx-auto mb-2" />
                          <p className="text-sm font-inter">No Image</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-montserrat font-bold">{selectedProduct.name}</h3>
                      <p className="text-muted-foreground font-inter">SKU: {selectedProduct.sku}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-inter font-medium text-muted-foreground">Category</Label>
                        <p className="font-inter">
                          {selectedProduct.product_categories?.name || 'Uncategorized'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-inter font-medium text-muted-foreground">Location</Label>
                        <p className="font-inter">
                          {selectedProduct.location || selectedProduct.inventory_locations?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-inter font-medium text-muted-foreground">Supplier</Label>
                        <p className="font-inter">{selectedProduct.supplier || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-inter font-medium text-muted-foreground">Unit of Measure</Label>
                        <p className="font-inter">{selectedProduct.unit_of_measure}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Stock Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-montserrat font-semibold">Stock Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-montserrat font-bold text-primary">
                        {selectedProduct.current_stock}
                      </p>
                      <p className="text-sm font-inter text-muted-foreground">Current Stock</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-montserrat font-bold text-warning">
                        {selectedProduct.min_stock_level}
                      </p>
                      <p className="text-sm font-inter text-muted-foreground">Min Level</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-montserrat font-bold text-info">
                        {selectedProduct.max_stock_level}
                      </p>
                      <p className="text-sm font-inter text-muted-foreground">Max Level</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-montserrat font-bold text-foreground">
                        ${(selectedProduct.current_stock * (selectedProduct.mauc || 0)).toLocaleString()}
                      </p>
                      <p className="text-sm font-inter text-muted-foreground">Total Value</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-inter font-medium text-muted-foreground">Status:</Label>
                    <Badge 
                      variant={getStatusBadge(selectedProduct.current_stock, selectedProduct.min_stock_level).variant as any}
                      className="flex items-center gap-1"
                    >
                      {React.createElement(getStatusBadge(selectedProduct.current_stock, selectedProduct.min_stock_level).icon, { className: "h-3 w-3" })}
                      {getStatusBadge(selectedProduct.current_stock, selectedProduct.min_stock_level).label}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Financial Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-montserrat font-semibold">Financial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm font-inter font-medium text-muted-foreground">Unit Cost (MAUC)</Label>
                      <p className="text-xl font-montserrat font-bold">
                        ${selectedProduct.mauc?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm font-inter font-medium text-muted-foreground">Total Inventory Value</Label>
                      <p className="text-xl font-montserrat font-bold">
                        ${(selectedProduct.current_stock * (selectedProduct.mauc || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-lg font-montserrat font-semibold">Description</h4>
                      <p className="font-inter text-muted-foreground">{selectedProduct.description}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default InventoryOverview;