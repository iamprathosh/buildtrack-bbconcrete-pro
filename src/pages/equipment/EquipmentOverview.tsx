import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Wrench, Search, Plus, User, Calendar, Settings, CheckCircle, Clock, AlertTriangle, Download, Edit, Trash2, Tool, MapPin, DollarSign } from "lucide-react";
import { useEquipment, useEquipmentStats } from "@/hooks/useEquipment";
import { AdminManagerGuard } from "@/components/auth/RoleGuard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/hooks/use-toast";
import { Database } from '@/integrations/supabase/types';

type Equipment = Database['public']['Tables']['equipment']['Row'];
type EquipmentInsert = Database['public']['Tables']['equipment']['Insert'];

interface EquipmentFormData {
  equipment_number: string;
  name: string;
  category: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_cost?: number;
  location?: string;
  notes?: string;
}

const EquipmentOverview = () => {
  const { equipment, isLoading, error, checkOutEquipment, returnEquipment, createEquipment, updateEquipment, deleteEquipment } = useEquipment();
  const stats = useEquipmentStats();
  const { profile } = useUserProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [formData, setFormData] = useState<EquipmentFormData>({
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

  const statuses = ["all", "available", "checked_out", "maintenance", "retired"];
  const categories = ["all", "Power Tools", "Machinery", "Cleaning Equipment", "Pneumatic Tools", "Power Equipment", "Pneumatic Equipment", "Welding Equipment"];
  
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.equipment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
      updateEquipment.mutate({ id: selectedEquipment.id, ...formData }, {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedEquipment(null);
          resetForm();
        }
      });
    } else {
      createEquipment.mutate(formData, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleEdit = (equipmentItem: Equipment) => {
    setSelectedEquipment(equipmentItem);
    setFormData({
      equipment_number: equipmentItem.equipment_number || '',
      name: equipmentItem.name,
      category: equipmentItem.category || '',
      model: equipmentItem.model || '',
      serial_number: equipmentItem.serial_number || '',
      purchase_date: equipmentItem.purchase_date || '',
      purchase_cost: equipmentItem.purchase_cost || 0,
      location: equipmentItem.location || '',
      notes: equipmentItem.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleCheckOut = (equipmentItem: Equipment) => {
    setSelectedEquipment(equipmentItem);
    setIsCheckoutDialogOpen(true);
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
    deleteEquipment.mutate(equipmentId);
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
                  filteredEquipment.map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-secondary/50">
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
                          <div className="flex items-center gap-2">
                            {item.status === 'available' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckOut(item)}
                                disabled={!profile}
                              >
                                Check Out
                              </Button>
                            ) : (item.status === 'checked_out' || item.status === 'checked-out') && item.checked_out_to === profile?.id ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturn(item.id)}
                              >
                                Return
                              </Button>
                            ) : null}
                            <AdminManagerGuard>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-destructive" />
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
                                      onClick={() => handleDelete(item.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </AdminManagerGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
              <DialogDescription>
                Add a new piece of equipment to the inventory.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
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
                  <Label htmlFor="purchase_cost">Purchase Cost</Label>
                  <Input
                    id="purchase_cost"
                    type="number"
                    value={formData.purchase_cost}
                    onChange={(e) => setFormData({ ...formData, purchase_cost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
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
                  />
                </div>
              </div>
              <DialogFooter>
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
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Equipment</DialogTitle>
              <DialogDescription>
                Update equipment information.
              </DialogDescription>
            </DialogHeader>
            {selectedEquipment && (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit_equipment_number">Equipment Number *</Label>
                    <Input
                      id="edit_equipment_number"
                      value={formData.equipment_number}
                      onChange={(e) => setFormData({ ...formData, equipment_number: e.target.value })}
                      placeholder="EQ-001"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_name">Name *</Label>
                    <Input
                      id="edit_name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Equipment name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_category">Category *</Label>
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
                    <Label htmlFor="edit_location">Location</Label>
                    <Input
                      id="edit_location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Storage location"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_notes">Notes</Label>
                    <Textarea
                      id="edit_notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
      </div>
    </AppLayout>
  );
};

export default EquipmentOverview;