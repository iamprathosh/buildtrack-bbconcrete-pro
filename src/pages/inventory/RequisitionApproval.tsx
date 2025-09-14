import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, Search, CheckCircle, XCircle, Clock, Filter, Eye, User } from "lucide-react";
import { useRequisitions } from "@/hooks/useRequisitions";
import { AdminManagerGuard } from "@/components/auth/RoleGuard";
import { useUserProfile } from "@/hooks/useUserProfile";

const RequisitionApproval = () => {
  const { requisitions, isLoading, updateRequisition } = useRequisitions();
  const { profile } = useUserProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { variant: "warning", label: "Pending Review", icon: Clock };
      case "approved":
        return { variant: "success", label: "Approved", icon: CheckCircle };
      case "rejected":
        return { variant: "destructive", label: "Rejected", icon: XCircle };
      case "fulfilled":
        return { variant: "secondary", label: "Fulfilled", icon: CheckCircle };
      default:
        return { variant: "outline", label: status, icon: ClipboardCheck };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return { variant: "destructive", label: "Urgent" };
      case "high":
        return { variant: "warning", label: "High" };
      case "normal":
        return { variant: "secondary", label: "Normal" };
      case "low":
        return { variant: "outline", label: "Low" };
      default:
        return { variant: "secondary", label: priority };
    }
  };

  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = 
      req.requisition_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    if (!profile?.id) return;
    await updateRequisition.mutateAsync({
      id,
      status,
      approved_by: profile.id,
      approved_date: new Date().toISOString()
    });
  };

  const pendingCount = requisitions.filter(r => r.status === 'pending').length;
  const approvedCount = requisitions.filter(r => r.status === 'approved').length;
  const totalValue = requisitions.reduce((sum, req) => {
    return sum + (req.requisition_items?.reduce((itemSum, item) => 
      itemSum + ((item.quantity_requested || 0) * (item.unit_cost || 0)), 0) || 0);
  }, 0);

  return (
    <AppLayout title="Requisition Approval" subtitle="Review and approve material requests">
      <AdminManagerGuard showError>
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="gradient-card border-0 shadow-brand">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter text-muted-foreground">Total Requisitions</p>
                    <p className="text-2xl font-montserrat font-bold text-foreground">
                      {requisitions.length}
                    </p>
                  </div>
                  <ClipboardCheck className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="gradient-card border-0 shadow-brand">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-montserrat font-bold text-warning">
                      {pendingCount}
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
                    <p className="text-sm font-inter text-muted-foreground">Approved</p>
                    <p className="text-2xl font-montserrat font-bold text-success">
                      {approvedCount}
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
                    <p className="text-sm font-inter text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-montserrat font-bold text-foreground">
                      ${totalValue.toLocaleString()}
                    </p>
                  </div>
                  <ClipboardCheck className="h-8 w-8 text-info" />
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
                  placeholder="Search requisitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-inter"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requisitions Table */}
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-montserrat">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Material Requisitions ({filteredRequisitions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading requisitions...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requisition #</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequisitions.map((req) => {
                      const statusBadge = getStatusBadge(req.status);
                      const priorityBadge = getPriorityBadge(req.priority || 'normal');
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.requisition_number}</TableCell>
                          <TableCell>{req.project?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {req.user_id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={priorityBadge.variant as any} className="text-xs">
                              {priorityBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{req.requisition_items?.length || 0} items</TableCell>
                          <TableCell>
                            {new Date(req.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant as any} className="flex items-center gap-1 w-fit">
                              <StatusIcon className="h-3 w-3" />
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {req.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApproval(req.id, 'approved')}
                                    className="text-success hover:text-success"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApproval(req.id, 'rejected')}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminManagerGuard>
    </AppLayout>
  );
};

export default RequisitionApproval;