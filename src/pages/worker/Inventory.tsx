import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Minus, Plus, RotateCcw, Search, ScanLine } from "lucide-react";
import BBLogo from "@/assets/bb-logo.svg";

const WorkerInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const inventory = [
    {
      id: 1,
      name: "Concrete Mix #1",
      sku: "CON-001",
      category: "Concrete",
      available: 45,
      unit: "bags",
      location: "Warehouse A"
    },
    {
      id: 2,
      name: "Rebar #4",
      sku: "REB-004",
      category: "Steel",
      available: 5,
      unit: "pieces",
      location: "Yard B"
    },
    {
      id: 3,
      name: "Portland Cement",
      sku: "CEM-001",
      category: "Cement",
      available: 120,
      unit: "bags",
      location: "Warehouse A"
    },
    {
      id: 4,
      name: "Aggregate Stone",
      sku: "AGG-001",
      category: "Aggregate",
      available: 200,
      unit: "tons",
      location: "Yard C"
    }
  ];

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockBadge = (available: number) => {
    if (available <= 10) return { variant: "destructive", label: "Low Stock" };
    if (available <= 50) return { variant: "warning", label: "Medium" };
    return { variant: "success", label: "In Stock" };
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <img src={BBLogo} alt="BuildTrack" className="h-6 brightness-0 invert" />
            <div>
              <h1 className="font-montserrat font-bold text-lg">Worker Inventory</h1>
              <p className="font-inter text-xs opacity-90">Manage materials for your project</p>
            </div>
          </div>

          {/* Search and Scan */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-inter bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ScanLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="checkout" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="checkout">Stock Out</TabsTrigger>
              <TabsTrigger value="return">Return</TabsTrigger>
            </TabsList>

            <TabsContent value="checkout" className="space-y-3">
              {filteredInventory.map((item) => {
                const stockBadge = getStockBadge(item.available);
                return (
                  <Card key={item.id} className="gradient-card border-0 shadow-brand">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="font-montserrat font-bold text-base text-foreground">
                            {item.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <CardDescription className="font-inter text-sm">
                              SKU: {item.sku}
                            </CardDescription>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge 
                          variant={stockBadge.variant as any}
                          className="text-xs"
                        >
                          {stockBadge.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-inter text-muted-foreground">Available:</span>
                        <span className="font-inter font-medium">{item.available} {item.unit}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-inter text-muted-foreground">Location:</span>
                        <span className="font-inter font-medium">{item.location}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 pt-2">
                        <Button variant="outline" size="icon-sm">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="flex-1 text-center">
                          <Input 
                            type="number" 
                            defaultValue="1" 
                            className="text-center font-inter"
                            min="1"
                            max={item.available}
                          />
                        </div>
                        <Button variant="outline" size="icon-sm">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="primary" size="sm" className="ml-2">
                          <Package className="h-3 w-3 mr-1" />
                          Stock Out
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="return" className="space-y-3">
              {filteredInventory.map((item) => (
                <Card key={item.id} className="gradient-card border-0 shadow-brand">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="font-montserrat font-bold text-base text-foreground">
                          {item.name}
                        </CardTitle>
                        <CardDescription className="font-inter text-sm">
                          SKU: {item.sku}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon-sm">
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="flex-1 text-center">
                        <Input 
                          type="number" 
                          defaultValue="1" 
                          className="text-center font-inter"
                          min="1"
                        />
                      </div>
                      <Button variant="outline" size="icon-sm">
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="success" size="sm" className="ml-2">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Return
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WorkerInventory;