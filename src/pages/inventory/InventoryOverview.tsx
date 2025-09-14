import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Plus, Filter, Download, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { toast } from "@/hooks/use-toast";

const InventoryOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
  
  const filteredItems = products?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryName = (item as any).product_categories?.name;
    const matchesCategory = selectedCategory === "all" || categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

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
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
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
                      <TableRow key={item.id} className="hover:bg-secondary/50">
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
      </div>
    </AppLayout>
  );
};

export default InventoryOverview;