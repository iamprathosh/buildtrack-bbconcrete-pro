import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Search, Plus, Filter, User, Calendar, Settings, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const EquipmentOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const equipment = [
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

  const statuses = ["all", "available", "checked-out", "maintenance", "retired"];
  
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(eq => eq.status === "available").length;
  const checkedOutEquipment = equipment.filter(eq => eq.status === "checked-out").length;
  const maintenanceEquipment = equipment.filter(eq => eq.status === "maintenance").length;
  const totalValue = equipment.reduce((sum, eq) => sum + eq.purchasePrice, 0);

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
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
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
                  <TableHead className="font-inter font-semibold">Equipment ID</TableHead>
                  <TableHead className="font-inter font-semibold">Name</TableHead>
                  <TableHead className="font-inter font-semibold">Type</TableHead>
                  <TableHead className="font-inter font-semibold">Condition</TableHead>
                  <TableHead className="font-inter font-semibold">Status</TableHead>
                  <TableHead className="font-inter font-semibold">Location</TableHead>
                  <TableHead className="font-inter font-semibold">Checked Out By</TableHead>
                  <TableHead className="font-inter font-semibold">Next Maintenance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => {
                  const statusBadge = getStatusBadge(item.status);
                  const conditionBadge = getConditionBadge(item.condition);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-secondary/50">
                      <TableCell className="font-inter font-medium">{item.id}</TableCell>
                      <TableCell className="font-inter">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-inter">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={conditionBadge.variant as any}
                          className="text-xs"
                        >
                          {conditionBadge.label}
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
                      <TableCell className="font-inter">{item.location}</TableCell>
                      <TableCell className="font-inter">
                        {item.checkedOutBy || "-"}
                      </TableCell>
                      <TableCell className="font-inter">
                        {new Date(item.nextMaintenance).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                .filter(eq => new Date(eq.nextMaintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                .sort((a, b) => new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime())
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-warning" />
                      <div>
                        <p className="text-sm font-inter font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-inter">
                          {item.id} • {item.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-inter font-medium">
                        {new Date(item.nextMaintenance).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground font-inter">
                        {Math.ceil((new Date(item.nextMaintenance).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EquipmentOverview;