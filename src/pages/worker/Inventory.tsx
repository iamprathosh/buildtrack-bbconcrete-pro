import { useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, AlertTriangle, TrendingUp, TrendingDown, Filter, Package2, Grid3X3, List, LayoutGrid } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProductWithCategory {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  unit_of_measure: string;
  category: string;
  image_url?: string;
  description?: string;
  location?: string;
}

const WorkerInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch products with category information
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-with-categories-worker'],
    queryFn: async (): Promise<ProductWithCategory[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      return data.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        current_stock: product.current_stock || 0,
        unit_of_measure: product.unit_of_measure,
        category: product.product_categories?.name || 'Uncategorized',
        image_url: product.image_url,
        description: product.description,
        location: product.location || 'Warehouse'
      }));
    }
  });

  // Get unique categories
  const uniqueCategories = useMemo(() => 
    [...new Set(products.map(p => p.category))], 
    [products]
  );

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stock_asc':
          return a.current_stock - b.current_stock;
        case 'stock_desc':
          return b.current_stock - a.current_stock;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { variant: "destructive", label: "Out of Stock", icon: AlertTriangle };
    if (stock <= 10) return { variant: "destructive", label: "Critical", icon: TrendingDown };
    if (stock <= 25) return { variant: "secondary", label: "Low Stock", icon: TrendingDown };
    return { variant: "default", label: "In Stock", icon: TrendingUp };
  };

  const getStockCount = () => {
    const total = products.length;
    const lowStock = products.filter(p => p.current_stock <= 10 && p.current_stock > 0).length;
    const outOfStock = products.filter(p => p.current_stock === 0).length;
    const inStock = products.filter(p => p.current_stock > 10).length;
    
    return { total, lowStock, outOfStock, inStock };
  };

  const stockStats = getStockCount();

  return (
    <AppLayout title="Inventory View" subtitle="Browse available materials and stock levels">
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center space-y-6 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Inventory Overview
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              View current stock levels and material availability
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package2 className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">{stockStats.total}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{stockStats.inStock}</span>
                </div>
                <p className="text-sm text-muted-foreground">In Stock</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-yellow-600" />
                  <span className="text-2xl font-bold text-yellow-600">{stockStats.lowStock}</span>
                </div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</span>
                </div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and View Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="stock_desc">Stock (High to Low)</SelectItem>
                <SelectItem value="stock_asc">Stock (Low to High)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none px-3"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{filteredProducts.length} items</span>
            </div>
          </div>

          {/* Notice for Operations */}
          <Alert className="mb-6">
            <Package className="h-4 w-4" />
            <AlertDescription>
              This is a read-only inventory view. To perform stock operations (take out, return, or stock in), please use the <strong>Worker Operations</strong> page.
            </AlertDescription>
          </Alert>

          {/* Products Display */}
          {isLoadingProducts ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading inventory...</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.current_stock);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <Card key={product.id} className="hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            <Badge 
                              variant={stockStatus.variant as any}
                              className="text-xs flex items-center gap-1"
                            >
                              <StatusIcon className="h-3 w-3" />
                              {stockStatus.label}
                            </Badge>
                          </div>
                          
                          <div className="text-center mb-3">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg mx-auto mb-2"
                              />
                            ) : (
                              <div className="bg-gray-100 rounded-lg p-3 mb-2 w-12 h-12 mx-auto flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            
                            <h4 className="font-bold text-sm mb-1">{product.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">SKU: {product.sku}</p>
                            
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-lg font-bold text-foreground">
                                  {product.current_stock}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {product.unit_of_measure}
                                </span>
                              </div>
                              
                              {product.location && (
                                <p className="text-xs text-muted-foreground">
                                  📍 {product.location}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {product.description && (
                            <div className="border-t pt-2 mt-2">
                              <p className="text-xs text-muted-foreground text-center">
                                {product.description}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                // List View
                <div className="space-y-4 mb-6">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.current_stock);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <Card key={product.id} className="hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="bg-gray-100 rounded-lg p-4 w-16 h-16 flex items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                                    {product.name}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {product.category}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      SKU: {product.sku}
                                    </span>
                                    {product.location && (
                                      <span className="text-sm text-muted-foreground">
                                        📍 {product.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Stock Status */}
                                <div className="flex flex-col items-end gap-2">
                                  <Badge 
                                    variant={stockStatus.variant as any}
                                    className="text-xs flex items-center gap-1"
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {stockStatus.label}
                                  </Badge>
                                  <div className="text-right">
                                    <div className="text-xl font-bold text-foreground">
                                      {product.current_stock}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {product.unit_of_measure}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Description */}
                              {product.description && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-sm text-muted-foreground">
                                    {product.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {filteredProducts.length === 0 && !isLoadingProducts && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-2">No items found</p>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkerInventory;