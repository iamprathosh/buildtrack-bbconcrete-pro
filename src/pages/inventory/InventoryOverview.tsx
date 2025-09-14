import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Plus, Filter, Download, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const InventoryOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const inventoryItems = [
    {
      id: "CON-001",
      name: "Concrete Mix #1",
      category: "Concrete",
      quantity: 45,
      unit: "bags",
      minStock: 20,
      location: "Warehouse A",
      supplier: "ABC Concrete Co.",
      unitCost: 25.99,
      totalValue: 1169.55,
      lastUpdated: "2024-01-15",
      status: "adequate"
    },
    {
      id: "REB-004",
      name: "Rebar #4",
      category: "Steel",
      quantity: 5,
      unit: "pieces",
      minStock: 10,
      location: "Yard B",
      supplier: "Steel Works Inc.",
      unitCost: 45.00,
      totalValue: 225.00,
      lastUpdated: "2024-01-14",
      status: "low"
    },
    {
      id: "CEM-001",
      name: "Portland Cement",
      category: "Cement",
      quantity: 120,
      unit: "bags",
      minStock: 50,
      location: "Warehouse A",
      supplier: "Cement Direct",
      unitCost: 12.50,
      totalValue: 1500.00,
      lastUpdated: "2024-01-16",
      status: "adequate"
    },
    {
      id: "AGG-001",
      name: "Aggregate Stone",
      category: "Aggregate",
      quantity: 200,
      unit: "tons",
      minStock: 100,
      location: "Yard C",
      supplier: "Rock Quarry LLC",
      unitCost: 35.00,
      totalValue: 7000.00,
      lastUpdated: "2024-01-15",
      status: "high"
    }
  ];

  const getStatusBadge = (status: string, quantity: number, minStock: number) => {
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

  const categories = ["all", "Concrete", "Steel", "Cement", "Aggregate"];
  
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minStock).length;
  const criticalItems = inventoryItems.filter(item => item.quantity <= item.minStock * 0.5).length;

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
                    {inventoryItems.length}
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
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-inter"
              />
            </div>
            
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
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
                  const statusBadge = getStatusBadge(item.status, item.quantity, item.minStock);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-secondary/50">
                      <TableCell className="font-inter font-medium">{item.id}</TableCell>
                      <TableCell className="font-inter">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-inter">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-inter">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="font-inter">{item.location}</TableCell>
                      <TableCell className="font-inter">${item.unitCost}</TableCell>
                      <TableCell className="font-inter font-medium">
                        ${item.totalValue.toLocaleString()}
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default InventoryOverview;