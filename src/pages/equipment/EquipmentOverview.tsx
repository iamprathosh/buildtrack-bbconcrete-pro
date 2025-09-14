import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Search, Plus, Filter, User, Calendar, Settings, CheckCircle, Clock, AlertTriangle, Download } from "lucide-react";
import { useEquipment } from "@/hooks/useEquipment";
import { AdminManagerGuard } from "@/components/auth/RoleGuard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { normalizeEquipment } from "@/lib/normalize";

const EquipmentOverview = () => {
  const { equipment, isLoading, checkOutEquipment, returnEquipment } = useEquipment();
  const { profile } = useUserProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const mockEquipmentData = [
    {
      id: "EQ-001",
      name: "Concrete Mixer - Large",
      type: "Machinery",
      condition: "Good",
      status: "available",
      location: "Equipment Yard A",
      lastMaintenance: "2024-01-10",
      nextMaintenance: "2024-04-10",
      checkedOutBy: null,
      checkedOutDate: null,
      purchaseDate: "2023-06-15",
      purchasePrice: 15000,
      serialNumber: "CM-2023-001"
    },
    {
      id: "EQ-002",
      name: "Power Drill Set",
      type: "Tools",
      condition: "Excellent",
      status: "checked-out",
      location: "Downtown Office Complex",
      lastMaintenance: "2024-01-05",
      nextMaintenance: "2024-07-05",
      checkedOutBy: "Mike Johnson",
      checkedOutDate: "2024-01-12",
      purchaseDate: "2023-09-20",
      purchasePrice: 450,
      serialNumber: "PD-2023-015"
    },
    {
      id: "EQ-003",
      name: "Safety Harness",
      type: "Safety",
      condition: "Good",
      status: "available",
      location: "Safety Equipment Room",
      lastMaintenance: "2024-01-12",
      nextMaintenance: "2024-06-12",
      checkedOutBy: null,
      checkedOutDate: null,
      purchaseDate: "2023-11-01",
      purchasePrice: 85,
      serialNumber: "SH-2023-008"
    },
    {
      id: "EQ-004",
      name: "Welding Machine",
      type: "Machinery",
      condition: "Fair",
      status: "maintenance",
      location: "Maintenance Shop",
      lastMaintenance: "2024-01-08",
      nextMaintenance: "2024-02-08",
      checkedOutBy: null,
      checkedOutDate: null,
      purchaseDate: "2022-03-10",
      purchasePrice: 2500,
      serialNumber: "WM-2022-003"
    },
    {
      id: "EQ-005",
      name: "Excavator - Mini",
      type: "Heavy Machinery",
      condition: "Excellent",
      status: "checked-out",
      location: "Highway Bridge Repair",
      lastMaintenance: "2024-01-01",
      nextMaintenance: "2024-04-01",
      checkedOutBy: "Robert Smith",
      checkedOutDate: "2024-01-08",
      purchaseDate: "2023-01-15",
      purchasePrice: 45000,
      serialNumber: "EX-2023-001"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return { variant: "success", label: "Available", icon: CheckCircle };
      case "checked-out":
        return { variant: "warning", label: "Checked Out", icon: User };
      case "maintenance":
        return { variant: "destructive", label: "Maintenance", icon: AlertTriangle };
      case "retired":
        return { variant: "secondary", label: "Retired", icon: Clock };
      default:
        return { variant: "outline", label: status, icon: Wrench };
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
  
  // Use normalized data structure for consistent display
  const displayEquipment = equipment.length > 0 ? normalizeEquipment(equipment) : normalizeEquipment(mockEquipmentData);
  
  const filteredEquipment = displayEquipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.equipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEquipment = displayEquipment.length;
  const availableEquipment = displayEquipment.filter(eq => eq.status === "available").length;
  const checkedOutEquipment = displayEquipment.filter(eq => eq.status === "checked_out" || eq.status === "checked-out").length;
  const maintenanceEquipment = displayEquipment.filter(eq => eq.status === "maintenance").length;
  const totalValue = displayEquipment.reduce((sum, eq) => sum + (eq.purchase_cost || 0), 0);

  const handleCheckOut = async (equipmentId: string) => {
    if (!profile?.id) return;
    await checkOutEquipment.mutateAsync({ id: equipmentId, userId: profile.id });
  };

  const handleReturn = async (equipmentId: string) => {
    await returnEquipment.mutateAsync(equipmentId);
  };

  return (
    <AppLayout title="Equipment Overview" subtitle="Manage company equipment and assets">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Equipment</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    {totalEquipment}
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
                    {availableEquipment}
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
                    {checkedOutEquipment}
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
                    {maintenanceEquipment}
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
                  <p className="text-sm font-inter text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    ${(totalValue / 1000).toFixed(0)}K
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-info" />
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
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-inter"
              />
            </div>
            
            <div className="flex gap-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === "all" ? "All" : status.replace("-", " ")}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <AdminManagerGuard>
              <Button variant="primary" size="sm">
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
                                onClick={() => handleCheckOut(item.id)}
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
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
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
              {displayEquipment
                .filter(eq => eq.nextMaintenance && new Date(eq.nextMaintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                .sort((a, b) => new Date(a.nextMaintenance!).getTime() - new Date(b.nextMaintenance!).getTime())
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
                        {new Date(item.nextMaintenance!).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground font-inter">
                        {Math.ceil((new Date(item.nextMaintenance!).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days
                      </p>
                    </div>
                  </div>
                ))}
              {displayEquipment.filter(eq => eq.nextMaintenance && new Date(eq.nextMaintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No upcoming maintenance scheduled
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EquipmentOverview;