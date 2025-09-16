import { useState, useMemo, memo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Wrench, Search, Plus, User, Calendar, Settings, CheckCircle, Clock, AlertTriangle, Download, Edit, Trash2, DollarSign, Loader2 } from "lucide-react";
import { useEquipment, useEquipmentStats } from "@/hooks/useEquipment";
import { AdminManagerGuard } from "@/components/auth/RoleGuard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Database } from '@/integrations/supabase/types';

type Equipment = Database['public']['Tables']['equipment']['Row'];
type EquipmentInsert = Database['public']['Tables']['equipment']['Insert'];

interface EquipmentWithMaintenance extends Equipment {
  next_maintenance?: string;
  last_maintenance?: string;
  maintenance_due_days?: number;
  condition?: string;
}

interface EquipmentFormData {
  equipment_number: string;
  name: string;
  category: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_cost?: number;
  current_value?: number;
  status?: string;
  checked_out_to?: string | null;
  checked_out_date?: string | null;
  maintenance_date?: string; // optional scheduled maintenance date (YYYY-MM-DD)
  location?: string;
  notes?: string;
}

const EquipmentOverview = () => {
  const { equipment, isLoading, error, checkOutEquipment, returnEquipment, createEquipment, updateEquipment, deleteEquipment } = useEquipment();
  const stats = useEquipmentStats();
  const { profile, isAdminOrManager } = useUserProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithMaintenance | null>(null);
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EquipmentFormData>({
    equipment_number: '',
    name: '',
    category: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_cost: 0,
    current_value: 0,
    status: 'available',
    checked_out_to: '',
    checked_out_date: '',
    maintenance_date: '',
    location: '',
    notes: ''
  });
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return { variant: "success" as const, label: "Available", icon: CheckCircle };
      case "checked_out":
        return { variant: "warning" as const, label: "Checked Out", icon: User };
      case "maintenance":
        return { variant: "destructive" as const, label: "Maintenance", icon: AlertTriangle };
      case "retired":
        return { variant: "secondary" as const, label: "Retired", icon: Clock };
      default:
        return { variant: "outline" as const, label: status, icon: Wrench };
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return { variant: "success", label: "Excellent" };
      case "good":
        return { variant: "info", label: "Good" };
      case "fair":
        return { variant: "warning", label: "Fair" };
      case "poor":
        return { variant: "destructive", label: "Poor" };
      default:
        return { variant: "secondary", label: condition };
    }
  };

  const statuses = ["all", "Available", "Checked Out", "Maintenance", "Retired"];
  const categories = ["all", "Power Tools", "Machinery", "Cleaning Equipment", "Pneumatic Tools", "Power Equipment", "Pneumatic Equipment", "Welding Equipment"];
  
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.equipment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [equipment, searchTerm, statusFilter, categoryFilter]);

  const resetForm = () => {
    setFormData({
      equipment_number: '',
      name: '',
      category: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      purchase_cost: 0,
      location: '',
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEquipment) {
      // Filter out only the fields that were actually changed
      const changedData: any = {};
      changedFields.forEach(field => {
        if (field in formData) {
          changedData[field] = formData[field as keyof EquipmentFormData];
        }
      });

      // Convert date strings to proper format
      if (changedData.purchase_date) {
        changedData.purchase_date = new Date(changedData.purchase_date).toISOString().split('T')[0];
      }
      if (changedData.checked_out_date) {
        changedData.checked_out_date = new Date(changedData.checked_out_date).toISOString();
      }
      // Remove maintenance_date from equipment update payload
      if ('maintenance_date' in changedData) {
        delete changedData.maintenance_date;
      }

      // Convert empty strings to null for optional fields
      Object.keys(changedData).forEach(key => {
        if (changedData[key] === '' || changedData[key] === undefined) {
          changedData[key] = null;
        }
      });

      console.log('Updating equipment with:', { id: selectedEquipment.id, ...changedData });

      updateEquipment.mutate({ id: selectedEquipment.id, ...changedData }, {
        onSuccess: () => {
          // If maintenance_date was provided in Edit, schedule maintenance
          if (formData.maintenance_date) {
            try {
              const dateOnly = new Date(formData.maintenance_date).toISOString().split('T')[0];
              // Best-effort scheduling via fetch to edge function or separate mutation could be added here
              // For now, we simply log; hook scheduleMaintenance is available in useEquipment if we want to wire it
              console.log('Maintenance date provided; schedule in maintenance UI:', dateOnly);
            } catch {}
          }
          setIsEditDialogOpen(false);
          setSelectedEquipment(null);
          setEditingItemId(null);
          setChangedFields(new Set());
          resetForm();
        },
        onError: (error) => {
          console.error('Update error:', error);
          setEditingItemId(null);
        }
      });
    } else {
      const { maintenance_date, ...equipmentPayload } = formData;
      if (equipmentPayload.purchase_date) {
        equipmentPayload.purchase_date = new Date(equipmentPayload.purchase_date).toISOString().split('T')[0] as any;
      }
      if (equipmentPayload.checked_out_date) {
        equipmentPayload.checked_out_date = new Date(equipmentPayload.checked_out_date).toISOString() as any;
      }

      createEquipment.mutate(equipmentPayload, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleEdit = (equipmentItem: EquipmentWithMaintenance) => {
    setSelectedEquipment(equipmentItem);
    setEditingItemId(equipmentItem.id);
    
    // Format dates for input fields
    const formatDateForInput = (dateString: string | null | undefined) => {
      if (!dateString) return '';
      try {
        return new Date(dateString).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    const formatDateTimeForInput = (dateString: string | null | undefined) => {
      if (!dateString) return '';
      try {
        return new Date(dateString).toISOString().slice(0, 16);
      } catch {
        return '';
      }
    };

    setFormData({
      equipment_number: equipmentItem.equipment_number || '',
      name: equipmentItem.name,
      category: equipmentItem.category || '',
      model: equipmentItem.model || '',
      serial_number: equipmentItem.serial_number || '',
      purchase_date: formatDateForInput(equipmentItem.purchase_date),
      purchase_cost: equipmentItem.purchase_cost || 0,
      current_value: equipmentItem.current_value || 0,
      status: equipmentItem.status || 'available',
      checked_out_to: equipmentItem.checked_out_to || '',
      checked_out_date: formatDateTimeForInput(equipmentItem.checked_out_date),
      location: equipmentItem.location || '',
      notes: equipmentItem.notes || ''
    });
    setChangedFields(new Set());
    setIsEditDialogOpen(true);
  };

  const handleCheckOut = (equipmentItem: EquipmentWithMaintenance) => {
    setSelectedEquipment(equipmentItem);
    setIsCheckoutDialogOpen(true);
  };

  const handleRowClick = (equipmentItem: EquipmentWithMaintenance) => {
    setSelectedEquipment(equipmentItem);
    setIsDetailDialogOpen(true);
  };

  const handleCheckoutSubmit = () => {
    if (!selectedEquipment) return;
    
    checkOutEquipment.mutate({
      id: selectedEquipment.id,
      userId: "current_user_id", // This will be replaced with actual user ID
      notes: checkoutNotes
    }, {
      onSuccess: () => {
        setIsCheckoutDialogOpen(false);
        setSelectedEquipment(null);
        setCheckoutNotes("");
      }
    });
  };

  const handleReturn = (equipmentId: string) => {
    returnEquipment.mutate(equipmentId);
  };

  const handleDelete = (equipmentId: string) => {
    setDeletingItemId(equipmentId);
    deleteEquipment.mutate(equipmentId, {
      onSuccess: () => {
        setDeletingItemId(null);
      },
      onError: () => {
        setDeletingItemId(null);
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout title="Equipment Overview" subtitle="Manage company equipment and assets">
        <div className="space-y-6">
          {/* Loading KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="gradient-card border-0 shadow-brand">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-12" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Loading Table */}
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout title="Equipment Overview" subtitle="Manage company equipment and assets">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load equipment: {error.message}
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Equipment Overview" subtitle="Manage company equipment and assets">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Equipment</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    {stats.total}
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Available</p>
                  <p className="text-2xl font-montserrat font-bold text-success">
                    {stats.available}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Checked Out</p>
                  <p className="text-2xl font-montserrat font-bold text-warning">
                    {stats.checkedOut}
                  </p>
                </div>
                <User className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Maintenance</p>
                  <p className="text-2xl font-montserrat font-bold text-destructive">
                    {stats.maintenance}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Maintenance Due</p>
                  <p className="text-2xl font-montserrat font-bold text-warning">
                    {stats.maintenanceDue}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    ${(stats.totalValue / 1000).toFixed(0)}K
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-inter"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status === "all" ? "All Status" : status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <AdminManagerGuard>
              <Button variant="default" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </AdminManagerGuard>
          </div>
        </div>

        {/* Equipment Table */}
        <Card className="gradient-card border-0 shadow-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-montserrat">
              <Wrench className="h-5 w-5 text-primary" />
              Equipment Assets ({filteredEquipment.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-inter font-semibold">Equipment #</TableHead>
                  <TableHead className="font-inter font-semibold">Name</TableHead>
                  <TableHead className="font-inter font-semibold">Category</TableHead>
                  <TableHead className="font-inter font-semibold">Status</TableHead>
                  <TableHead className="font-inter font-semibold">Location</TableHead>
                  <TableHead className="font-inter font-semibold">Checked Out To</TableHead>
                  <TableHead className="font-inter font-semibold">Actions</TableHead>
                  <TableHead className="font-inter font-semibold"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading equipment...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((item) => (
                    <EquipmentTableRow 
                      key={item.id} 
                      item={item} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onCheckOut={handleCheckOut}
                      onReturn={handleReturn}
                      onRowClick={handleRowClick}
                      isEditing={editingItemId === item.id}
                      isDeleting={deletingItemId === item.id}
                      profile={profile}
                      canManage={isAdminOrManager()}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Maintenance Schedule */}
        <Card className="gradient-card border-0 shadow-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-montserrat">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {equipment
                .filter(eq => eq.next_maintenance && new Date(eq.next_maintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                .sort((a, b) => new Date(a.next_maintenance!).getTime() - new Date(b.next_maintenance!).getTime())
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-warning" />
                      <div>
                        <p className="text-sm font-inter font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-inter">
                          {item.equipment_number} • {item.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-inter font-medium">
                        {new Date(item.next_maintenance!).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground font-inter">
                        {Math.ceil((new Date(item.next_maintenance!).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days
                      </p>
                    </div>
                  </div>
                ))}
              {equipment.filter(eq => eq.next_maintenance && new Date(eq.next_maintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No upcoming maintenance scheduled
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Equipment Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
              <DialogDescription>
                Add a new piece of equipment to the inventory.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-1">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="equipment_number">Equipment Number *</Label>
                    <Input
                      id="equipment_number"
                      value={formData.equipment_number}
                      onChange={(e) => setFormData({ ...formData, equipment_number: e.target.value })}
                      placeholder="EQ-001"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Equipment name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Power Tools">Power Tools</SelectItem>
                        <SelectItem value="Machinery">Machinery</SelectItem>
                        <SelectItem value="Cleaning Equipment">Cleaning Equipment</SelectItem>
                        <SelectItem value="Pneumatic Tools">Pneumatic Tools</SelectItem>
                        <SelectItem value="Power Equipment">Power Equipment</SelectItem>
                        <SelectItem value="Pneumatic Equipment">Pneumatic Equipment</SelectItem>
                        <SelectItem value="Welding Equipment">Welding Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Model number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="serial_number">Serial Number</Label>
                    <Input
                      id="serial_number"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      placeholder="Serial number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="purchase_date">Purchase Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="purchase_cost">Purchase Cost</Label>
                    <Input
                      id="purchase_cost"
                      type="number"
                      step="0.01"
                      value={formData.purchase_cost}
                      onChange={(e) => setFormData({ ...formData, purchase_cost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maintenance_date">Maintenance Date (Optional)</Label>
                    <Input
                      id="maintenance_date"
                      type="date"
                      value={formData.maintenance_date || ''}
                      onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Storage location"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-shrink-0 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEquipment.isPending}>
                  {createEquipment.isPending ? 'Adding...' : 'Add Equipment'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Equipment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingItemId(null);
            setChangedFields(new Set());
          }
        }}>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Edit Equipment</DialogTitle>
              <DialogDescription>
                Update equipment information.
              </DialogDescription>
            </DialogHeader>
            {selectedEquipment && (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto px-1">
                  <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit_equipment_number">Equipment Number *</Label>
                    <Input
                      id="edit_equipment_number"
                      className={!changedFields.has('equipment_number') ? 'opacity-60' : ''}
                      value={formData.equipment_number}
                      onChange={(e) => {
                        setFormData({ ...formData, equipment_number: e.target.value });
                        setChangedFields(prev => new Set(prev).add('equipment_number'));
                      }}
                      placeholder="EQ-001"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_name">Name *</Label>
                    <Input
                      id="edit_name"
                      className={!changedFields.has('name') ? 'opacity-60' : ''}
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setChangedFields(prev => new Set(prev).add('name'));
                      }}
                      placeholder="Equipment name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => {
                      setFormData({ ...formData, category: value });
                      setChangedFields(prev => new Set(prev).add('category'));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Power Tools">Power Tools</SelectItem>
                        <SelectItem value="Machinery">Machinery</SelectItem>
                        <SelectItem value="Cleaning Equipment">Cleaning Equipment</SelectItem>
                        <SelectItem value="Pneumatic Tools">Pneumatic Tools</SelectItem>
                        <SelectItem value="Power Equipment">Power Equipment</SelectItem>
                        <SelectItem value="Pneumatic Equipment">Pneumatic Equipment</SelectItem>
                        <SelectItem value="Welding Equipment">Welding Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_status">Status</Label>
                    <Select value={formData.status} disabled>
                      <SelectTrigger className="opacity-60">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Status changes happen via Check Out/Return flows.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_location">Location</Label>
                    <Input
                      id="edit_location"
                      className={!changedFields.has('location') ? 'opacity-60' : ''}
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        setChangedFields(prev => new Set(prev).add('location'));
                      }}
                      placeholder="Storage location"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_purchase_date">Purchase Date</Label>
                    <Input
                      id="edit_purchase_date"
                      type="date"
                      className={!changedFields.has('purchase_date') ? 'opacity-60' : ''}
                      value={formData.purchase_date}
                      onChange={(e) => {
                        setFormData({ ...formData, purchase_date: e.target.value });
                        setChangedFields(prev => new Set(prev).add('purchase_date'));
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_purchase_cost">Purchase Cost</Label>
                    <Input
                      id="edit_purchase_cost"
                      type="number"
                      step="0.01"
                      className={!changedFields.has('purchase_cost') ? 'opacity-60' : ''}
                      value={formData.purchase_cost}
                      onChange={(e) => {
                        setFormData({ ...formData, purchase_cost: parseFloat(e.target.value) || 0 });
                        setChangedFields(prev => new Set(prev).add('purchase_cost'));
                      }}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_current_value">Current Value</Label>
                    <Input
                      id="edit_current_value"
                      type="number"
                      step="0.01"
                      className={!changedFields.has('current_value') ? 'opacity-60' : ''}
                      value={formData.current_value}
                      onChange={(e) => {
                        setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 });
                        setChangedFields(prev => new Set(prev).add('current_value'));
                      }}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_maintenance_date">Maintenance Date (Optional)</Label>
                    <Input
                      id="edit_maintenance_date"
                      type="date"
                      className={!changedFields.has('maintenance_date') ? 'opacity-60' : ''}
                      value={formData.maintenance_date || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, maintenance_date: e.target.value });
                        setChangedFields(prev => new Set(prev).add('maintenance_date'));
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_checked_out_to">Checked Out To</Label>
                    <Input
                      id="edit_checked_out_to"
                      className="opacity-60"
                      value={formData.checked_out_to || ''}
                      disabled
                      placeholder="User ID or name"
                    />
                    <p className="text-xs text-muted-foreground">Update via the Check Out dialog.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_checked_out_date">Checked Out Date</Label>
                    <Input
                      id="edit_checked_out_date"
                      type="datetime-local"
                      className="opacity-60"
                      value={formData.checked_out_date || ''}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Update via the Check Out dialog.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_notes">Notes</Label>
                    <Textarea
                      id="edit_notes"
                      className={!changedFields.has('notes') ? 'opacity-60' : ''}
                      value={formData.notes}
                      onChange={(e) => {
                        setFormData({ ...formData, notes: e.target.value });
                        setChangedFields(prev => new Set(prev).add('notes'));
                      }}
                      placeholder="Additional notes"
                    />
                  </div>
                  </div>
                </div>
                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingItemId(null);
                    setChangedFields(new Set());
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateEquipment.isPending}>
                    {updateEquipment.isPending ? 'Updating...' : 'Update Equipment'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Checkout Dialog */}
        <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Check Out Equipment</DialogTitle>
              <DialogDescription>
                Check out "{selectedEquipment?.name}" for use.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="checkout_notes">Notes (Optional)</Label>
                <Textarea
                  id="checkout_notes"
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Purpose of checkout, expected return date, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCheckoutSubmit} disabled={checkOutEquipment.isPending}>
                {checkOutEquipment.isPending ? 'Checking Out...' : 'Check Out'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Equipment Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Equipment Details
              </DialogTitle>
              <DialogDescription>
                Complete information about {selectedEquipment?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedEquipment && (
              <div className="flex-1 overflow-y-auto px-1">
                <div className="grid gap-6 py-4">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Equipment Number</Label>
                        <p className="text-sm font-mono">{selectedEquipment.equipment_number}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                        <p className="text-sm font-medium">{selectedEquipment.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                        <Badge variant="outline" className="w-fit">
                          {selectedEquipment.category || 'N/A'}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                        <p className="text-sm">{selectedEquipment.model || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Serial Number</Label>
                        <p className="text-sm font-mono">{selectedEquipment.serial_number || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                        <p className="text-sm">{selectedEquipment.location || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="flex items-center gap-1">
                          {(() => {
                            const statusBadge = getStatusBadge(selectedEquipment.status);
                            const StatusIcon = statusBadge.icon;
                            return (
                              <Badge 
                                variant={statusBadge.variant as any}
                                className="flex items-center gap-1 w-fit"
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusBadge.label}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Checked Out To</Label>
                        <p className="text-sm">{selectedEquipment.checked_out_to || 'Available'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Financial Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Purchase Date</Label>
                        <p className="text-sm">
                          {selectedEquipment.purchase_date 
                            ? new Date(selectedEquipment.purchase_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Purchase Cost</Label>
                        <p className="text-sm font-mono">
                          {selectedEquipment.purchase_cost 
                            ? `$${selectedEquipment.purchase_cost.toFixed(2)}`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Current Value</Label>
                        <p className="text-sm font-mono">
                          {selectedEquipment.current_value 
                            ? `$${selectedEquipment.current_value.toFixed(2)}`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Depreciation</Label>
                        <p className="text-sm">
                          {selectedEquipment.purchase_cost && selectedEquipment.current_value
                            ? `${(((selectedEquipment.purchase_cost - selectedEquipment.current_value) / selectedEquipment.purchase_cost) * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Maintenance Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Maintenance Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Next Maintenance</Label>
                          <p className="text-sm">
                            {selectedEquipment.next_maintenance 
                              ? new Date(selectedEquipment.next_maintenance).toLocaleDateString()
                              : 'Not scheduled'
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Last Maintenance</Label>
                          <p className="text-sm">
                            {selectedEquipment.last_maintenance 
                              ? new Date(selectedEquipment.last_maintenance).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Maintenance Due Days</Label>
                          <p className="text-sm">
                            {selectedEquipment.maintenance_due_days !== undefined
                              ? `${selectedEquipment.maintenance_due_days} days`
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Condition</Label>
                          <Badge 
                            variant={getConditionBadge(selectedEquipment.condition || 'unknown').variant as any}
                            className="w-fit"
                          >
                            {getConditionBadge(selectedEquipment.condition || 'unknown').label}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  {selectedEquipment.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{selectedEquipment.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Timestamps */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                        <p className="text-sm">
                          {new Date(selectedEquipment.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                        <p className="text-sm">
                          {selectedEquipment.updated_at 
                            ? new Date(selectedEquipment.updated_at).toLocaleString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
              {isAdminOrManager() && (
                <Button onClick={() => {
                  setIsDetailDialogOpen(false);
                  handleEdit(selectedEquipment!);
                }}>
                  Edit Equipment
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

// Memoized table row component for better performance
const EquipmentTableRow = memo(({ 
  item, 
  onEdit, 
  onDelete, 
  onCheckOut, 
  onReturn, 
  onRowClick,
  isEditing, 
  isDeleting, 
  profile,
  canManage
}: {
  item: EquipmentWithMaintenance;
  onEdit: (item: EquipmentWithMaintenance) => void;
  onDelete: (id: string) => void;
  onCheckOut: (item: EquipmentWithMaintenance) => void;
  onReturn: (id: string) => void;
  onRowClick: (item: EquipmentWithMaintenance) => void;
  isEditing: boolean;
  isDeleting: boolean;
  profile: any;
  canManage: boolean;
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return { variant: "success" as const, label: "Available", icon: CheckCircle };
      case "checked_out":
        return { variant: "warning" as const, label: "Checked Out", icon: User };
      case "maintenance":
        return { variant: "destructive" as const, label: "Maintenance", icon: AlertTriangle };
      case "retired":
        return { variant: "secondary" as const, label: "Retired", icon: Clock };
      default:
        return { variant: "outline" as const, label: status, icon: Wrench };
    }
  };

  const statusBadge = getStatusBadge(item.status);
  const StatusIcon = statusBadge.icon;

  return (
    <TableRow 
      className="hover:bg-secondary/50 cursor-pointer"
      onClick={() => onRowClick(item)}
    >
      <TableCell className="font-inter font-medium">
        {item.equipment_number}
      </TableCell>
      <TableCell className="font-inter">{item.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className="font-inter">
          {item.category || 'N/A'}
        </Badge>
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
      <TableCell className="font-inter">{item.location || 'N/A'}</TableCell>
      <TableCell className="font-inter">
        {item.checked_out_to || "-"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {item.status === 'available' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCheckOut(item)}
              disabled={!profile}
            >
              Check Out
            </Button>
          ) : (item.status === 'checked_out' || item.status === 'checked-out') ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReturn(item.id)}
            > 
              Return
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReturn(item.id)}
            > 
              NO ACTION
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        {canManage && (
          <>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(item)}
              disabled={isEditing}
            >
              {isEditing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{item.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                  onClick={() => onDelete(item.id)}
                  className=""
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </TableCell>
    </TableRow>
  );
});

EquipmentTableRow.displayName = 'EquipmentTableRow';

export default EquipmentOverview;