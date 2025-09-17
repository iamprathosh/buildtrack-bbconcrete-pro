import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProjectTransactions } from "@/hooks/useProjectTransactions";
import { RoleGuard, AdminManagerGuard } from "@/components/auth/RoleGuard";
import { 
  Package, 
  PackageOpen, 
  Plus, 
  RotateCcw,
  Search,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Filter,
  X,
  ArrowLeft,
  Building,
  User,
  History,
  Calendar,
  Clock
} from "lucide-react";
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type StockTransaction = Database['public']['Tables']['stock_transactions']['Insert'];

type ActionType = "pull" | "receive" | "return" | null;

interface ProductWithCategory {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  unit_of_measure: string;
  category: string;
  image_url?: string;
  mauc: number;
}

export default function WorkerOperations() {
  const { profile } = useUserProfile();
  const queryClient = useQueryClient();
  
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<ProductWithCategory[]>([]);
  const [quantities, setQuantities] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [notes, setNotes] = useState<string>("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  // Fetch products with category information - optimized with caching
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-with-categories'],
    queryFn: async (): Promise<ProductWithCategory[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          current_stock,
          unit_of_measure,
          image_url,
          mauc,
          product_categories!inner (
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
        mauc: product.mauc || 0
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - products don't change frequently
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Fetch active projects - optimized with caching
  const { data: projects = [] } = useQuery({
    queryKey: ['active-projects'],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, job_number, status, customer_id')
        .in('status', ['planning', 'active'])
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - projects change less frequently
    refetchOnWindowFocus: false
  });

  // Fetch project transactions
  const { 
    data: transactions = [], 
    isLoading: isLoadingTransactions 
  } = useProjectTransactions(selectedProject);

  // Stock transaction mutation
  const stockTransactionMutation = useMutation({
    mutationFn: async (transaction: StockTransaction) => {
      const { data, error } = await supabase
        .from('stock_transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-with-categories'] });
    }
  });

  // Get unique categories
  const uniqueCategories = useMemo(() => 
    [...new Set(products.map(p => p.category))], 
    [products]
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const toggleProductSelection = (product: ProductWithCategory) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        // Remove from selection and clear quantity
        const newQuantities = { ...quantities };
        delete newQuantities[product.id];
        setQuantities(newQuantities);
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleQuantityChange = (productId: string, value: string) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const selectAllVisible = () => {
    const allVisible = filteredProducts.filter(p => !selectedProducts.some(sp => sp.id === p.id));
    setSelectedProducts(prev => [...prev, ...allVisible]);
  };

  const clearSelection = () => {
    setSelectedProducts([]);
    setQuantities({});
  };

  const handleActionStart = (action: ActionType) => {
    setCurrentAction(action);
    setIsProjectDialogOpen(true);
  };

  const handleProjectSelect = () => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive"
      });
      return;
    }
    setIsProjectDialogOpen(false);
  };

  const handleDialogClose = () => {
    // If dialog is closed without selecting a project, reset the action
    if (!selectedProject) {
      setCurrentAction(null);
    }
    setIsProjectDialogOpen(false);
  };

  const handleBulkOperation = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one product",
        variant: "destructive"
      });
      return;
    }

    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive"
      });
      return;
    }

    const itemsWithQuantity = selectedProducts.filter(product => {
      const qty = quantities[product.id];
      return qty && parseInt(qty) > 0;
    });

    if (itemsWithQuantity.length === 0) {
      toast({
        title: "Error",
        description: "Please enter quantities for selected items",
        variant: "destructive"
      });
      return;
    }

    if (!currentAction) {
      toast({
        title: "Error",
        description: "Please select an action",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const product of itemsWithQuantity) {
        const qty = parseInt(quantities[product.id]);
        
        try {
          let transactionType: 'pull' | 'receive' | 'return';
          let transactionNotes = notes;

          switch (currentAction) {
            case "pull":
              if (qty > product.current_stock) {
                toast({
                  title: "Error",
                  description: `Insufficient stock for ${product.name}. Available: ${product.current_stock}`,
                  variant: "destructive"
                });
                errorCount++;
                continue;
              }
              transactionType = 'pull';
              transactionNotes = transactionNotes || `Worker pulled ${qty} ${product.unit_of_measure} of ${product.name}`;
              break;
              
            case "receive":
              transactionType = 'receive';
              transactionNotes = transactionNotes || `Stock received: ${qty} ${product.unit_of_measure} of ${product.name}`;
              break;
              
            case "return":
              transactionType = 'return';
              transactionNotes = transactionNotes || `Worker returned ${qty} ${product.unit_of_measure} of ${product.name}`;
              break;
              
            default:
              throw new Error("Invalid action type");
          }

          await stockTransactionMutation.mutateAsync({
            product_id: product.id,
            project_id: selectedProject,
            user_id: profile?.id || 'unknown',
            transaction_type: transactionType,
            quantity: qty,
            unit_cost: product.mauc,
            notes: transactionNotes,
            transaction_date: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
          
          successCount++;
        } catch (error) {
          console.error('Transaction error:', error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        const actionName = currentAction === "pull" ? "pulled" : 
                         currentAction === "receive" ? "received" : "returned";
        toast({
          title: "Success",
          description: `Successfully ${actionName} ${successCount} items!`
        });
      }
      
      if (errorCount > 0) {
        toast({
          title: "Warning",
          description: `Failed to process ${errorCount} items`,
          variant: "destructive"
        });
      }

      // Reset form
      setSelectedProducts([]);
      setQuantities({});
      setNotes("");
      setCurrentAction(null);
      setSelectedProject("");
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Operation failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setCurrentAction(null);
    setSelectedProject("");
    setSelectedProducts([]);
    setQuantities({});
    setSearchTerm("");
    setSelectedCategory("all");
    setNotes("");
    setIsProjectDialogOpen(false);
  };

  const isWorker = profile?.role === 'worker';
  const isManager = profile?.role === 'project_manager' || profile?.role === 'super_admin';

  return (
    <AppLayout title="Worker Operations" subtitle="Manage inventory transactions">
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Welcome Section */}
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Inventory Operations
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select multiple items and perform bulk operations efficiently
            </p>
            {profile && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Logged in as: {profile.full_name} ({profile.role.replace('_', ' ')})</span>
              </div>
            )}
          </div>

          {/* Action Selection */}
          {!currentAction && (
            <div className="flex justify-center items-center mb-12">
              {/* Show 2 buttons for workers, 3 for managers */}
              {profile?.role === 'worker' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl w-full px-4">
                  {/* Pull/Take Out - Available to all users */}
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-2 hover:border-primary/50 h-full"
                    onClick={() => handleActionStart("pull")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[280px]">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                        <PackageOpen className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">Take Out</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">Remove items from inventory for project use</p>
                    </CardContent>
                  </Card>

                  {/* Return - Available to all users */}
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-2 hover:border-red-500/50 h-full"
                    onClick={() => handleActionStart("return")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[280px]">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                        <RotateCcw className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-red-500 transition-colors">Return</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">Return unused items back to inventory</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl w-full px-4">
                  {/* Pull/Take Out - Available to all users */}
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-2 hover:border-primary/50 h-full"
                    onClick={() => handleActionStart("pull")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[280px]">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                        <PackageOpen className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">Take Out</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">Remove items from inventory for project use</p>
                    </CardContent>
                  </Card>

                  {/* Receive/Stock In - Manager only */}
                  <AdminManagerGuard>
                    <Card 
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-2 hover:border-green-400/50 h-full"
                      onClick={() => handleActionStart("receive")}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[280px]">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                          <Plus className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-green-500 transition-colors">Stock In</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-4">Add new stock received from vendors</p>
                        <Badge variant="outline" className="mt-auto">Manager Only</Badge>
                      </CardContent>
                    </Card>
                  </AdminManagerGuard>

                  {/* Return - Available to all users */}
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-2 hover:border-red-500/50 h-full"
                    onClick={() => handleActionStart("return")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[280px]">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                        <RotateCcw className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-red-500 transition-colors">Return</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">Return unused items back to inventory</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {currentAction && selectedProject && (
            <>
              {/* Action Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-2">
                    {currentAction === "pull" && <><PackageOpen className="h-8 w-8 text-primary" />Take Out Items</>}
                    {currentAction === "receive" && <><Plus className="h-8 w-8 text-green-500" />Stock In Items</>}
                    {currentAction === "return" && <><RotateCcw className="h-8 w-8 text-red-500" />Return Items</>}
                  </h2>
                  {selectedProducts.length > 0 && (
                    <p className="text-muted-foreground text-lg">
                      {selectedProducts.length} items selected for {projects.find(p => p.id === selectedProject)?.name}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Project: {projects.find(p => p.id === selectedProject)?.name}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTransactions(!showTransactions)}
                      className="flex items-center gap-2"
                    >
                      <History className="h-4 w-4" />
                      {showTransactions ? 'Hide History' : 'View History'}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={resetAll}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Selection
                </Button>
              </div>

              {/* Transaction History */}
              {showTransactions && (
                <Card className="mb-6 gradient-card border-0 shadow-brand">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-montserrat">
                      <History className="h-5 w-5 text-primary" />
                      Recent Transactions - {projects.find(p => p.id === selectedProject)?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTransactions ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading transactions...</p>
                      </div>
                    ) : transactions.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {transactions.slice(0, 20).map((transaction) => (
                          <div 
                            key={transaction.id} 
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                transaction.transaction_type === 'pull' ? 'bg-red-500' :
                                transaction.transaction_type === 'receive' ? 'bg-green-500' : 'bg-blue-500'
                              }`}></div>
                              <div>
                                <p className="font-medium text-sm">
                                  {transaction.product_name} ({transaction.product_sku})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.user_name} • {transaction.product_category}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={
                                    transaction.transaction_type === 'pull' ? 'destructive' :
                                    transaction.transaction_type === 'receive' ? 'default' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {transaction.transaction_type === 'pull' ? 'Pulled' :
                                   transaction.transaction_type === 'receive' ? 'Received' : 'Returned'}
                                </Badge>
                                <span className="font-medium text-sm">
                                  {transaction.quantity} {transaction.product_unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {transaction.notes && (
                                <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                  {transaction.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No transactions yet for this project</p>
                        <p className="text-sm text-muted-foreground">Start by pulling, receiving, or returning items</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

                <div className="flex gap-2 justify-center md:justify-start">
                  <Button 
                    onClick={selectAllVisible} 
                    variant="outline" 
                    className="h-12 flex-1 md:flex-none"
                    disabled={filteredProducts.length === 0}
                  >
                    Select All
                  </Button>
                  <Button 
                    onClick={clearSelection} 
                    variant="outline" 
                    className="h-12 flex-1 md:flex-none"
                    disabled={selectedProducts.length === 0}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Products Grid */}
              {isLoadingProducts ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading products...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    return (
                      <Card 
                        key={product.id} 
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-primary border-primary/50 bg-primary/5' 
                            : 'hover:shadow-lg hover:border-primary/30'
                        }`}
                        onClick={() => toggleProductSelection(product)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Checkbox 
                              checked={isSelected}
                              onChange={() => toggleProductSelection(product)}
                            />
                            <Badge variant="outline" className="text-xs">
                              {product.category}
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
                            <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                            
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <span className="text-sm font-medium">
                                {product.current_stock} {product.unit_of_measure}
                              </span>
                              {product.current_stock < 10 && (
                                <AlertCircle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                            
                            <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                              product.current_stock >= 25 
                                ? 'bg-green-100 text-green-700' 
                                : product.current_stock >= 10 
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {product.current_stock >= 25 ? '✓ Good' : 
                               product.current_stock >= 10 ? '⚠ Low' : '⚠ Critical'}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="border-t pt-3">
                              <Label className="text-xs font-medium mb-1 block">
                                Quantity ({product.unit_of_measure})
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                max={currentAction === "pull" ? product.current_stock : undefined}
                                value={quantities[product.id] || ""}
                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                placeholder="0"
                                className="h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                              {currentAction === "pull" && quantities[product.id] && 
                               parseInt(quantities[product.id]) > product.current_stock && (
                                <p className="text-xs text-red-600 mt-1">
                                  Max: {product.current_stock}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {filteredProducts.length === 0 && !isLoadingProducts && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No items found</p>
                </div>
              )}

              {/* Bottom Actions */}
              {selectedProducts.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
                  <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium mb-2 block">
                          Notes (Optional)
                        </Label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add notes for this operation..."
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <Button
                          onClick={handleBulkOperation}
                          size="lg"
                          className="w-full h-12 text-lg font-semibold"
                          disabled={isLoading || selectedProducts.length === 0 || stockTransactionMutation.isPending}
                        >
                          {(isLoading || stockTransactionMutation.isPending) && "Processing..."}
                          {!(isLoading || stockTransactionMutation.isPending) && currentAction === "pull" && `📦 Take Out ${selectedProducts.length} Items`}
                          {!(isLoading || stockTransactionMutation.isPending) && currentAction === "receive" && `➕ Stock In ${selectedProducts.length} Items`}
                          {!(isLoading || stockTransactionMutation.isPending) && currentAction === "return" && `↩️ Return ${selectedProducts.length} Items`}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add padding to prevent content being hidden behind fixed bottom bar */}
              {selectedProducts.length > 0 && <div className="h-32"></div>}
            </>
          )}

          {/* Project Selection Dialog */}
          <Dialog open={isProjectDialogOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Select Project</DialogTitle>
                <DialogDescription>
                  Choose which project this operation is for.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="project">Project *</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {project.job_number} • {project.status}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button onClick={handleProjectSelect}>
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Role-based access message for workers */}
          {isWorker && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                As a worker, you can take out items from inventory and return unused items. Stock-in operations are restricted to managers.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
