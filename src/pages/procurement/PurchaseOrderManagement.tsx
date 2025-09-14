import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Search, Plus, Download, Eye, Edit, Clock, CheckCircle, AlertTriangle, Truck } from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { AdminManagerGuard } from "@/components/auth/RoleGuard";
import { normalizePurchaseOrders } from "@/lib/normalize";

const PurchaseOrderManagement = () => {
  const { purchaseOrders, isLoading } = usePurchaseOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const mockPurchaseOrders = [
    {
      id: "PO-001",
      vendor: "ABC Concrete Co.",
      items: [
        { name: "Concrete Mix #1", quantity: 50, unit: "bags", unitPrice: 25.99 },
        { name: "Aggregate Stone", quantity: 5, unit: "tons", unitPrice: 35.00 }
      ],
      totalAmount: 1474.50,
      status: "pending",
      orderDate: "2024-01-15",
      expectedDelivery: "2024-01-20",
      project: "Downtown Office Complex",
      createdBy: "John Smith",
      approvedBy: null
    },
    {
      id: "PO-002",
      vendor: "Steel Works Inc.",
      items: [
        { name: "Rebar #4", quantity: 20, unit: "pieces", unitPrice: 45.00 }
      ],
      totalAmount: 900.00,
      status: "approved",
      orderDate: "2024-01-14",
      expectedDelivery: "2024-01-18",
      project: "Residential Building A",
      createdBy: "Sarah Johnson",
      approvedBy: "Mike Wilson"
    },
    {
      id: "PO-003",
      vendor: "Cement Direct",
      items: [
        { name: "Portland Cement", quantity: 100, unit: "bags", unitPrice: 12.50 }
      ],
      totalAmount: 1250.00,
      status: "delivered",
      orderDate: "2024-01-10",
      expectedDelivery: "2024-01-15",
      actualDelivery: "2024-01-15",
      project: "Highway Bridge Repair",
      createdBy: "Lisa Chen",
      approvedBy: "John Smith"
    },
    {
      id: "PO-004",
      vendor: "Tool Supply Co.",
      items: [
        { name: "Power Drill Set", quantity: 3, unit: "sets", unitPrice: 150.00 },
        { name: "Safety Harness", quantity: 10, unit: "pieces", unitPrice: 85.00 }
      ],
      totalAmount: 1300.00,
      status: "rejected",
      orderDate: "2024-01-12",
      project: "Municipal Library",
      createdBy: "David Brown",
      rejectionReason: "Over budget allocation"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { variant: "warning", label: "Pending Approval", icon: Clock };
      case "approved":
        return { variant: "info", label: "Approved", icon: CheckCircle };
      case "delivered":
        return { variant: "success", label: "Delivered", icon: Truck };
      case "rejected":
        return { variant: "destructive", label: "Rejected", icon: AlertTriangle };
      default:
        return { variant: "secondary", label: status, icon: ShoppingCart };
    }
  };

  const statuses = ["all", "draft", "sent", "acknowledged", "received", "closed", "cancelled"];
  
  // Use normalized data structure for consistent display
  const displayOrders = purchaseOrders.length > 0 ? normalizePurchaseOrders(purchaseOrders) : normalizePurchaseOrders(mockPurchaseOrders);
  
  const filteredOrders = displayOrders.filter(order => {
    const matchesSearch = order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPOs = displayOrders.length;
  const pendingPOs = displayOrders.filter(po => po.status === "pending" || po.status === "draft").length;
  const totalValue = displayOrders.reduce((sum, po) => sum + po.total_amount, 0);
  const deliveredPOs = displayOrders.filter(po => po.status === "delivered" || po.status === "received").length;

  return (
    <AppLayout title="Purchase Order Management" subtitle="Create, track, and manage purchase orders">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total POs</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    {totalPOs}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-montserrat font-bold text-warning">
                    {pendingPOs}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-montserrat font-bold text-success">
                    {deliveredPOs}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-success" />
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
                placeholder="Search purchase orders..."
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
                  {status}
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
                New PO
              </Button>
            </AdminManagerGuard>
          </div>
        </div>

        {/* Purchase Orders Table */}
        <Card className="gradient-card border-0 shadow-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-montserrat">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Purchase Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-inter font-semibold">PO Number</TableHead>
                  <TableHead className="font-inter font-semibold">Vendor</TableHead>
                  <TableHead className="font-inter font-semibold">Project</TableHead>
                  <TableHead className="font-inter font-semibold">Items</TableHead>
                  <TableHead className="font-inter font-semibold">Total Amount</TableHead>
                  <TableHead className="font-inter font-semibold">Order Date</TableHead>
                  <TableHead className="font-inter font-semibold">Status</TableHead>
                  <TableHead className="font-inter font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading purchase orders...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <TableRow key={order.id} className="hover:bg-secondary/50">
                        <TableCell className="font-inter font-medium">
                          {order.po_number}
                        </TableCell>
                        <TableCell className="font-inter">
                          {order.vendor}
                        </TableCell>
                        <TableCell className="font-inter">
                          {order.project}
                        </TableCell>
                        <TableCell className="font-inter">
                          {order.items_count} items
                        </TableCell>
                        <TableCell className="font-inter font-medium">
                          ${order.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-inter">
                          {new Date(order.order_date).toLocaleDateString()}
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
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AdminManagerGuard>
                              {(order.status === "pending" || order.status === "draft") && (
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
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

        {/* Recent Activity */}
        <Card className="gradient-card border-0 shadow-brand">
          <CardHeader>
            <CardTitle className="font-montserrat">Recent Purchase Order Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <div className="flex-1">
                  <p className="text-sm font-inter font-medium">PO-003 delivered successfully</p>
                  <p className="text-xs text-muted-foreground font-inter">2 hours ago by Cement Direct</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-2 h-2 rounded-full bg-info"></div>
                <div className="flex-1">
                  <p className="text-sm font-inter font-medium">PO-002 approved by Mike Wilson</p>
                  <p className="text-xs text-muted-foreground font-inter">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <div className="flex-1">
                  <p className="text-sm font-inter font-medium">PO-001 created and pending approval</p>
                  <p className="text-xs text-muted-foreground font-inter">2 days ago by John Smith</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PurchaseOrderManagement;