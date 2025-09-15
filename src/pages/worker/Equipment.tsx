import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  Wrench, 
  User, 
  Calendar, 
  Search, 
  CheckCircle, 
  Clock, 
  Settings,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  LayoutGrid,
  List,
  ArrowRight,
  MapPin,
  Activity,
  Check,
  ArrowLeft,
  Info,
  Grid,
  Loader2
} from "lucide-react";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  serial_number: string;
  status: 'available' | 'checked_out' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location?: string;
  description?: string;
  last_maintenance_date?: string;
  image_url?: string;
  purchase_date?: string;
  equipment_logs?: EquipmentLog[];
}

interface EquipmentLog {
  id: string;
  equipment_id: string;
  user_id: string;
  checkout_time: string;
  checkin_time?: string;
  expected_return_time?: string;
  notes?: string;
  user_profiles?: {
    full_name: string;
  };
}

const WorkerEquipment = () => {
  const { profile } = useUserProfile();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>("name");
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");

  // Fetch all equipment with logs
  const { data: equipment = [], isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['worker-equipment'],
    queryFn: async (): Promise<EquipmentItem[]> => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_logs!equipment_logs_equipment_id_fkey (
            id,
            user_id,
            checkout_time,
            checkin_time,
            expected_return_time,
            notes,
            user_profiles (
              full_name
            )
          )
        `)
        .in('status', ['available', 'checked_out'])
        .order('name', { ascending: true });

      if (error) throw error;

      return data.map(item => ({
        ...item,
        equipment_logs: item.equipment_logs?.filter(log => !log.checkin_time) || []
      }));
    }
  });

  // Checkout equipment mutation
  const checkoutMutation = useMutation({
    mutationFn: async ({ equipmentId, notes, expectedReturn }: { equipmentId: string, notes: string, expectedReturn: string }) => {
      // First create the equipment log
      const { data: logData, error: logError } = await supabase
        .from('equipment_logs')
        .insert({
          equipment_id: equipmentId,
          user_id: profile?.id || 'unknown',
          checkout_time: new Date().toISOString(),
          expected_return_time: expectedReturn,
          notes: notes || 'Equipment checked out by worker'
        })
        .select()
        .single();

      if (logError) throw logError;

      // Then update equipment status
      const { error: updateError } = await supabase
        .from('equipment')
        .update({ status: 'checked_out' })
        .eq('id', equipmentId);

      if (updateError) throw updateError;

      return logData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-equipment'] });
      setIsCheckoutDialogOpen(false);
      setSelectedEquipment(null);
      setCheckoutNotes("");
      setExpectedReturnDate("");
      toast({
        title: "Success",
        description: "Equipment checked out successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to check out equipment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Return equipment mutation
  const returnMutation = useMutation({
    mutationFn: async ({ equipmentId, notes }: { equipmentId: string, notes: string }) => {
      // Find the active log entry
      const activeLog = equipment
        .find(eq => eq.id === equipmentId)
        ?.equipment_logs?.[0];

      if (!activeLog) throw new Error('No active checkout log found');

      // Update the log entry with return time
      const { error: logError } = await supabase
        .from('equipment_logs')
        .update({
          checkin_time: new Date().toISOString(),
          notes: notes ? `${activeLog.notes} | Return: ${notes}` : activeLog.notes
        })
        .eq('id', activeLog.id);

      if (logError) throw logError;

      // Update equipment status
      const { error: updateError } = await supabase
        .from('equipment')
        .update({ status: 'available' })
        .eq('id', equipmentId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-equipment'] });
      setIsReturnDialogOpen(false);
      setSelectedEquipment(null);
      setReturnNotes("");
      toast({
        title: "Success",
        description: "Equipment returned successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to return equipment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Get unique categories
  const uniqueCategories = useMemo(() => 
    [...new Set(equipment.map(eq => eq.category))],
    [equipment]
  );

  // Filter and sort equipment
  const filteredEquipment = useMemo(() => {
    let filtered = equipment.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort equipment
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'category':
          return a.category.localeCompare(b.category);
        case 'condition':
          return a.condition.localeCompare(b.condition);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [equipment, searchTerm, selectedCategory, sortBy]);

  // Separate available and checked out equipment
  const availableEquipment = filteredEquipment.filter(eq => eq.status === 'available');
  const checkedOutEquipment = filteredEquipment.filter(eq => eq.status === 'checked_out');
  const myCheckedOutEquipment = checkedOutEquipment.filter(eq => 
    eq.equipment_logs?.some(log => log.user_id === profile?.id)
  );

  const getConditionBadge = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return { variant: "default", label: "Excellent", color: "text-green-700 bg-green-50 border-green-200" };
      case "good":
        return { variant: "secondary", label: "Good", color: "text-blue-700 bg-blue-50 border-blue-200" };
      case "fair":
        return { variant: "secondary", label: "Fair", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
      case "poor":
        return { variant: "destructive", label: "Poor", color: "text-red-700 bg-red-50 border-red-200" };
      default:
        return { variant: "outline", label: condition, color: "text-gray-700 bg-gray-50 border-gray-200" };
    }
  };

  const getStatusBadge = (status: string, equipment: EquipmentItem) => {
    switch (status) {
      case 'available':
        return { variant: "default", label: "Available", color: "text-green-700 bg-green-50 border-green-200" };
      case 'checked_out':
        const isMyEquipment = equipment.equipment_logs?.some(log => log.user_id === profile?.id);
        const isOverdue = equipment.equipment_logs?.[0]?.expected_return_time && 
                         new Date(equipment.equipment_logs[0].expected_return_time) < new Date();
        
        if (isOverdue && isMyEquipment) {
          return { variant: "destructive", label: "Overdue", color: "text-red-700 bg-red-50 border-red-200" };
        }
        if (isMyEquipment) {
          return { variant: "secondary", label: "Checked Out by You", color: "text-blue-700 bg-blue-50 border-blue-200" };
        }
        return { variant: "secondary", label: "Checked Out", color: "text-gray-700 bg-gray-50 border-gray-200" };
      case 'maintenance':
        return { variant: "secondary", label: "Maintenance", color: "text-orange-700 bg-orange-50 border-orange-200" };
      default:
        return { variant: "outline", label: status, color: "text-gray-700 bg-gray-50 border-gray-200" };
    }
  };

  const handleCheckout = (equipment: EquipmentItem) => {
    setSelectedEquipment(equipment);
    setIsCheckoutDialogOpen(true);
  };

  const handleReturn = (equipment: EquipmentItem) => {
    setSelectedEquipment(equipment);
    setIsReturnDialogOpen(true);
  };

  const handleCheckoutSubmit = () => {
    if (!selectedEquipment || !expectedReturnDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    checkoutMutation.mutate({
      equipmentId: selectedEquipment.id,
      notes: checkoutNotes,
      expectedReturn: new Date(expectedReturnDate).toISOString()
    });
  };

  const handleReturnSubmit = () => {
    if (!selectedEquipment) return;

    returnMutation.mutate({
      equipmentId: selectedEquipment.id,
      notes: returnNotes
    });
  };

  if (isLoadingEquipment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Equipment</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-4 w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                </div>
                <div className="h-10 bg-gray-200 rounded mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Equipment</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search equipment by name, category, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
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
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="condition">Condition</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableEquipment.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">My Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{myCheckedOutEquipment.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Checked Out</p>
                <p className="text-2xl font-bold text-gray-900">{checkedOutEquipment.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {checkedOutEquipment.filter(eq => 
                    eq.equipment_logs?.[0]?.expected_return_time && 
                    new Date(eq.equipment_logs[0].expected_return_time) < new Date()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">
            Available ({availableEquipment.length})
          </TabsTrigger>
          <TabsTrigger value="my-equipment">
            My Equipment ({myCheckedOutEquipment.length})
          </TabsTrigger>
          <TabsTrigger value="all-checked-out">
            All Checked Out ({checkedOutEquipment.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Equipment */}
        <TabsContent value="available">
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
            "space-y-4"
          }>
            {availableEquipment.map((item) => {
              const conditionBadge = getConditionBadge(item.condition);
              const statusBadge = getStatusBadge(item.status, item);
              
              return (
                <Card key={item.id} className="hover:shadow-md transition-all hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.serial_number}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        <Badge className={`text-xs ${conditionBadge.color} border`}>
                          {conditionBadge.label}
                        </Badge>
                        <Badge className={`text-xs ${statusBadge.color} border`}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {item.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                      {item.description && (
                        <div className="flex items-start text-sm text-gray-600">
                          <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-xs">{item.description}</span>
                        </div>
                      )}
                      {item.last_maintenance_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Wrench className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-xs">Last: {new Date(item.last_maintenance_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handleCheckout(item)}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Check Out
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {availableEquipment.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Equipment</h3>
                <p className="text-gray-600">There is no equipment matching your search criteria available for checkout.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Equipment */}
        <TabsContent value="my-equipment">
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
            "space-y-4"
          }>
            {myCheckedOutEquipment.map((item) => {
              const conditionBadge = getConditionBadge(item.condition);
              const statusBadge = getStatusBadge(item.status, item);
              const activeLog = item.equipment_logs?.[0];
              const isOverdue = activeLog?.expected_return_time && 
                               new Date(activeLog.expected_return_time) < new Date();
              
              return (
                <Card key={item.id} className={`hover:shadow-md transition-all ${
                  isOverdue ? 'border-red-200 bg-red-50/50' : 'hover:border-primary/20'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.serial_number}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        <Badge className={`text-xs ${conditionBadge.color} border`}>
                          {conditionBadge.label}
                        </Badge>
                        <Badge className={`text-xs ${statusBadge.color} border`}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {activeLog?.checkout_time && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-xs">Checked: {new Date(activeLog.checkout_time).toLocaleDateString()}</span>
                        </div>
                      )}
                      {activeLog?.expected_return_time && (
                        <div className={`flex items-center text-sm ${
                          isOverdue ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-xs">
                            Due: {new Date(activeLog.expected_return_time).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {activeLog?.notes && (
                        <div className="flex items-start text-sm text-gray-600">
                          <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-xs">{activeLog.notes}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      variant={isOverdue ? "destructive" : "outline"} 
                      className="w-full" 
                      onClick={() => handleReturn(item)}
                      disabled={returnMutation.isPending}
                    >
                      {returnMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowLeft className="h-4 w-4 mr-2" />
                      )}
                      Return
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {myCheckedOutEquipment.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Equipment Checked Out</h3>
                <p className="text-gray-600">You don't have any equipment currently checked out.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Checked Out Equipment */}
        <TabsContent value="all-checked-out">
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
            "space-y-4"
          }>
            {checkedOutEquipment.map((item) => {
              const conditionBadge = getConditionBadge(item.condition);
              const statusBadge = getStatusBadge(item.status, item);
              const activeLog = item.equipment_logs?.[0];
              const isMyEquipment = activeLog?.user_id === profile?.id;
              const isOverdue = activeLog?.expected_return_time && 
                               new Date(activeLog.expected_return_time) < new Date();
              
              return (
                <Card key={item.id} className={`hover:shadow-md transition-all ${
                  isOverdue ? 'border-red-200 bg-red-50/50' : 
                  isMyEquipment ? 'border-blue-200 bg-blue-50/50' : 'hover:border-primary/20'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.serial_number}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        <Badge className={`text-xs ${conditionBadge.color} border`}>
                          {conditionBadge.label}
                        </Badge>
                        <Badge className={`text-xs ${statusBadge.color} border`}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {activeLog?.user_profiles?.full_name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-xs truncate">{activeLog.user_profiles.full_name}</span>
                        </div>
                      )}
                      {activeLog?.checkout_time && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-xs">Checked: {new Date(activeLog.checkout_time).toLocaleDateString()}</span>
                        </div>
                      )}
                      {activeLog?.expected_return_time && (
                        <div className={`flex items-center text-sm ${
                          isOverdue ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-xs">
                            Due: {new Date(activeLog.expected_return_time).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {isMyEquipment && (
                      <Button 
                        variant={isOverdue ? "destructive" : "outline"} 
                        className="w-full" 
                        onClick={() => handleReturn(item)}
                        disabled={returnMutation.isPending}
                      >
                        {returnMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowLeft className="h-4 w-4 mr-2" />
                        )}
                        Return
                      </Button>
                    )}
                    {!isMyEquipment && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        Checked out by another user
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {checkedOutEquipment.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Checked Out Equipment</h3>
                <p className="text-gray-600">There is no equipment currently checked out.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Check Out Equipment</DialogTitle>
            <DialogDescription>
              You are about to check out: <strong>{selectedEquipment?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expectedReturn">Expected Return Date*</Label>
              <Input
                id="expectedReturn"
                type="datetime-local"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkoutNotes">Notes (Optional)</Label>
              <Textarea
                id="checkoutNotes"
                placeholder="Add any notes about this checkout..."
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCheckoutDialogOpen(false)}
              disabled={checkoutMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleCheckoutSubmit}
              disabled={checkoutMutation.isPending || !expectedReturnDate}
            >
              {checkoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Check Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Return Equipment</DialogTitle>
            <DialogDescription>
              You are about to return: <strong>{selectedEquipment?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="returnNotes">Return Notes (Optional)</Label>
              <Textarea
                id="returnNotes"
                placeholder="Add any notes about the equipment condition or issues..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsReturnDialogOpen(false)}
              disabled={returnMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleReturnSubmit}
              disabled={returnMutation.isPending}
            >
              {returnMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowLeft className="h-4 w-4 mr-2" />
              )}
              Return Equipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerEquipment;